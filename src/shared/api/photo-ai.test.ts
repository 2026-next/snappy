import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createEnhancement,
  getEnhancement,
  getPhotoAnalysis,
  isTerminalStatus,
  listPhotoVersions,
  normalizeAnalysisJob,
  normalizeEnhancementJob,
  normalizePhotoVersion,
  pollAnalysisJob,
  pollEnhancementJob,
} from '@/shared/api/photo-ai'
import { useAuthStore } from '@/shared/auth/use-auth-store'

type FetchCall = { url: string; init?: RequestInit }

function stubFetch(handler: (call: FetchCall) => Response | Promise<Response>) {
  const calls: FetchCall[] = []
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    calls.push({ url, init })
    return handler({ url, init })
  })
  vi.stubGlobal('fetch', fetchMock)
  return calls
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('photo-ai api', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setTokens(
        { accessToken: 'at-1', refreshToken: 'rt-1', tokenType: 'Bearer' },
        'google',
      )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    useAuthStore.getState().logout()
  })

  it('normalizeAnalysisJob fills defaults and coerces nested result', () => {
    const job = normalizeAnalysisJob({
      analysisJobId: 'job-1',
      status: 'SUCCEEDED',
      result: {
        hasPerson: true,
        personCount: 2,
        composition: { score: 8.1 },
        sharpness: { score: 7.4 },
        suggestedEnhancements: [
          { type: '꽃 추가', iconUrl: 'https://x/flower.svg', suggestedPrompt: '배경에 꽃을 추가해줘' },
        ],
      },
      createdAt: '2026-05-13T00:00:00Z',
      updatedAt: '2026-05-13T00:00:01Z',
    })
    expect(job.analysisJobId).toBe('job-1')
    expect(job.status).toBe('SUCCEEDED')
    expect(job.result?.hasPerson).toBe(true)
    expect(job.result?.personCount).toBe(2)
    expect(job.result?.composition.score).toBe(8.1)
    expect(job.result?.suggestedEnhancements).toHaveLength(1)
    expect(job.result?.suggestedEnhancements[0].type).toBe('꽃 추가')
    expect(job.error).toBeNull()
  })

  it('normalizeAnalysisJob captures error tuples from either shape', () => {
    expect(
      normalizeAnalysisJob({
        id: 'job-2',
        status: 'FAILED',
        errorCode: 'AI_ANALYSIS_FAILED',
        errorMessage: 'timeout',
      }).error,
    ).toEqual({ code: 'AI_ANALYSIS_FAILED', message: 'timeout' })

    expect(
      normalizeAnalysisJob({
        id: 'job-3',
        status: 'FAILED',
        error: { code: 'X', message: 'y' },
      }).error,
    ).toEqual({ code: 'X', message: 'y' })
  })

  it('normalizePhotoVersion preserves originality and url', () => {
    const v = normalizePhotoVersion({
      versionId: 'v-1',
      fileKey: 'photos/abc.jpg',
      url: 'https://cdn/v.jpg',
      width: 1024,
      height: 768,
      prompt: '꽃을 더해줘',
      isOriginal: false,
      createdAt: '2026-05-13T00:00:00Z',
    })
    expect(v).toEqual({
      versionId: 'v-1',
      fileKey: 'photos/abc.jpg',
      url: 'https://cdn/v.jpg',
      width: 1024,
      height: 768,
      prompt: '꽃을 더해줘',
      isOriginal: false,
      createdAt: '2026-05-13T00:00:00Z',
    })
  })

  it('normalizeEnhancementJob normalizes nested resultVersion', () => {
    const job = normalizeEnhancementJob({
      jobId: 'e-1',
      status: 'SUCCEEDED',
      prompt: '배경 흐리게',
      resultVersion: {
        id: 'v-2',
        fileKey: 'photos/def.jpg',
        url: 'https://cdn/d.jpg',
        width: 1200,
        height: 900,
        prompt: '배경 흐리게',
        isOriginal: false,
        createdAt: '2026-05-13T00:01:00Z',
      },
    })
    expect(job.status).toBe('SUCCEEDED')
    expect(job.resultVersion?.versionId).toBe('v-2')
    expect(job.resultVersion?.url).toBe('https://cdn/d.jpg')
  })

  it('getPhotoAnalysis hits the analysis endpoint with bearer token', async () => {
    const calls = stubFetch(() =>
      jsonResponse({
        analysisJobId: 'a-1',
        status: 'SUCCEEDED',
        result: { hasPerson: true, personCount: 1, composition: { score: 7 }, sharpness: { score: 8 }, suggestedEnhancements: [] },
      }),
    )
    const job = await getPhotoAnalysis('photo-1')
    expect(job.analysisJobId).toBe('a-1')
    expect(calls[0].url).toMatch(/\/photo\/photo-1\/analysis$/)
    expect(
      new Headers(calls[0].init?.headers).get('Authorization'),
    ).toBe('Bearer at-1')
  })

  it('createEnhancement posts prompt and parses jobId', async () => {
    const calls = stubFetch(() =>
      jsonResponse(
        { jobId: 'e-9', status: 'PENDING', prompt: '꽃 추가', createdAt: 'now' },
        202,
      ),
    )
    const job = await createEnhancement('photo-1', '꽃 추가')
    expect(job.jobId).toBe('e-9')
    expect(job.status).toBe('PENDING')
    expect(calls[0].init?.method).toBe('POST')
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({ prompt: '꽃 추가' })
  })

  it('getEnhancement composes nested job path', async () => {
    const calls = stubFetch(() =>
      jsonResponse({ jobId: 'e-1', status: 'PROCESSING', prompt: 'p' }),
    )
    await getEnhancement('photo-1', 'e-1')
    expect(calls[0].url).toMatch(/\/photo\/photo-1\/enhancement\/e-1$/)
  })

  it('listPhotoVersions accepts both wrapped and bare arrays', async () => {
    stubFetch(() =>
      jsonResponse({
        versions: [
          { versionId: 'v-1', fileKey: 'k1', isOriginal: true, createdAt: 't' },
          { versionId: 'v-2', fileKey: 'k2', isOriginal: false, createdAt: 't' },
        ],
      }),
    )
    const versions = await listPhotoVersions('photo-1')
    expect(versions).toHaveLength(2)
    expect(versions[0].isOriginal).toBe(true)
    expect(versions[1].isOriginal).toBe(false)
  })

  it('isTerminalStatus identifies completion states only', () => {
    expect(isTerminalStatus('SUCCEEDED')).toBe(true)
    expect(isTerminalStatus('FAILED')).toBe(true)
    expect(isTerminalStatus('PENDING')).toBe(false)
    expect(isTerminalStatus('PROCESSING')).toBe(false)
  })

  it('coerces unknown status strings to PENDING', () => {
    expect(
      normalizeAnalysisJob({
        id: 'job-x',
        status: 'weird' as unknown as 'PENDING',
      }).status,
    ).toBe('PENDING')
    expect(
      normalizeEnhancementJob({
        id: 'e-x',
        status: 'succeeded' as unknown as 'PENDING',
      }).status,
    ).toBe('PENDING')
  })

  it('pollAnalysisJob polls until terminal status', async () => {
    const statuses = ['PROCESSING', 'PROCESSING', 'SUCCEEDED']
    let call = 0
    stubFetch(() => {
      const status = statuses[Math.min(call, statuses.length - 1)]
      call += 1
      return jsonResponse({
        analysisJobId: 'a-1',
        status,
        result:
          status === 'SUCCEEDED'
            ? {
                hasPerson: false,
                personCount: 0,
                composition: { score: 5 },
                sharpness: { score: 5 },
                suggestedEnhancements: [],
              }
            : null,
      })
    })
    const job = await pollAnalysisJob('photo-1', { intervalMs: 5, timeoutMs: 2000 })
    expect(job.status).toBe('SUCCEEDED')
    expect(call).toBe(3)
  })

  it('pollEnhancementJob exits on FAILED with error info', async () => {
    let call = 0
    stubFetch(() => {
      call += 1
      if (call === 1) {
        return jsonResponse({ jobId: 'e-1', status: 'PROCESSING', prompt: 'p' })
      }
      return jsonResponse({
        jobId: 'e-1',
        status: 'FAILED',
        prompt: 'p',
        errorCode: 'AI_ENHANCEMENT_FAILED',
        errorMessage: 'mock failure',
      })
    })
    const job = await pollEnhancementJob('photo-1', 'e-1', {
      intervalMs: 5,
      timeoutMs: 2000,
    })
    expect(job.status).toBe('FAILED')
    expect(job.error).toEqual({
      code: 'AI_ENHANCEMENT_FAILED',
      message: 'mock failure',
    })
  })

  it('pollAnalysisJob rejects when abort signal fires before first fetch', async () => {
    stubFetch(() =>
      jsonResponse({ analysisJobId: 'a-1', status: 'PROCESSING' }),
    )
    const controller = new AbortController()
    controller.abort()
    await expect(
      pollAnalysisJob('photo-1', {
        intervalMs: 5,
        timeoutMs: 2000,
        signal: controller.signal,
      }),
    ).rejects.toThrow('aborted')
  })

  it('pollEnhancementJob rejects on abort during delay', async () => {
    stubFetch(() =>
      jsonResponse({ jobId: 'e-1', status: 'PROCESSING', prompt: 'p' }),
    )
    const controller = new AbortController()
    const pending = pollEnhancementJob('photo-1', 'e-1', {
      intervalMs: 50,
      timeoutMs: 2000,
      signal: controller.signal,
    })
    setTimeout(() => controller.abort(), 10)
    await expect(pending).rejects.toThrow('aborted')
  })
})
