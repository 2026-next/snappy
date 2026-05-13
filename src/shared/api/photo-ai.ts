import { apiFetch } from '@/shared/api/client'

export type JobStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED'

const KNOWN_STATUSES: ReadonlyArray<JobStatus> = [
  'PENDING',
  'PROCESSING',
  'SUCCEEDED',
  'FAILED',
]

function coerceStatus(value: unknown): JobStatus {
  return KNOWN_STATUSES.includes(value as JobStatus)
    ? (value as JobStatus)
    : 'PENDING'
}

export type JobError = {
  code: string
  message: string
}

export type SuggestedEnhancement = {
  type: string
  iconUrl: string
  suggestedPrompt: string
}

export type AnalysisResult = {
  hasPerson: boolean
  personCount: number
  composition: { score: number }
  sharpness: { score: number }
  suggestedEnhancements: SuggestedEnhancement[]
}

export type AnalysisJob = {
  analysisJobId: string
  status: JobStatus
  result: AnalysisResult | null
  error: JobError | null
  createdAt: string
  updatedAt: string
}

export type PhotoVersion = {
  versionId: string
  fileKey: string
  url: string | null
  width: number | null
  height: number | null
  prompt: string | null
  isOriginal: boolean
  createdAt: string
}

export type EnhancementJob = {
  jobId: string
  status: JobStatus
  prompt: string
  resultVersion: PhotoVersion | null
  error: JobError | null
  createdAt: string
  updatedAt: string
}

type RawJobError = { code?: string | null; message?: string | null } | null | undefined

type RawAnalysisJob = {
  analysisJobId?: string
  id?: string
  status?: JobStatus
  result?: Partial<AnalysisResult> | null
  resultJson?: Partial<AnalysisResult> | null
  error?: RawJobError
  errorCode?: string | null
  errorMessage?: string | null
  createdAt?: string
  updatedAt?: string
}

type RawPhotoVersion = {
  versionId?: string
  id?: string
  fileKey?: string
  url?: string | null
  width?: number | null
  height?: number | null
  prompt?: string | null
  isOriginal?: boolean
  createdAt?: string
}

type RawEnhancementJob = {
  jobId?: string
  id?: string
  status?: JobStatus
  prompt?: string
  resultVersion?: RawPhotoVersion | null
  error?: RawJobError
  errorCode?: string | null
  errorMessage?: string | null
  createdAt?: string
  updatedAt?: string
}

function normalizeJobError(
  raw: RawJobError,
  code?: string | null,
  message?: string | null,
): JobError | null {
  if (raw && (raw.code != null || raw.message != null)) {
    return { code: raw.code ?? 'UNKNOWN', message: raw.message ?? '' }
  }
  if (code != null || message != null) {
    return { code: code ?? 'UNKNOWN', message: message ?? '' }
  }
  return null
}

function normalizeSuggestion(raw: Partial<SuggestedEnhancement> | undefined): SuggestedEnhancement {
  return {
    type: String(raw?.type ?? ''),
    iconUrl: String(raw?.iconUrl ?? ''),
    suggestedPrompt: String(raw?.suggestedPrompt ?? ''),
  }
}

function normalizeAnalysisResult(
  raw: Partial<AnalysisResult> | null | undefined,
): AnalysisResult | null {
  if (!raw) return null
  return {
    hasPerson: Boolean(raw.hasPerson),
    personCount: typeof raw.personCount === 'number' ? raw.personCount : 0,
    composition: {
      score: typeof raw.composition?.score === 'number' ? raw.composition.score : 0,
    },
    sharpness: {
      score: typeof raw.sharpness?.score === 'number' ? raw.sharpness.score : 0,
    },
    suggestedEnhancements: Array.isArray(raw.suggestedEnhancements)
      ? raw.suggestedEnhancements.map(normalizeSuggestion)
      : [],
  }
}

export function normalizeAnalysisJob(raw: RawAnalysisJob): AnalysisJob {
  return {
    analysisJobId: String(raw.analysisJobId ?? raw.id ?? ''),
    status: coerceStatus(raw.status),
    result: normalizeAnalysisResult(raw.result ?? raw.resultJson ?? null),
    error: normalizeJobError(raw.error, raw.errorCode, raw.errorMessage),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  }
}

export function normalizePhotoVersion(raw: RawPhotoVersion): PhotoVersion {
  return {
    versionId: String(raw.versionId ?? raw.id ?? ''),
    fileKey: String(raw.fileKey ?? ''),
    url: raw.url ?? null,
    width: typeof raw.width === 'number' ? raw.width : null,
    height: typeof raw.height === 'number' ? raw.height : null,
    prompt: raw.prompt ?? null,
    isOriginal: Boolean(raw.isOriginal ?? false),
    createdAt: String(raw.createdAt ?? ''),
  }
}

export function normalizeEnhancementJob(raw: RawEnhancementJob): EnhancementJob {
  return {
    jobId: String(raw.jobId ?? raw.id ?? ''),
    status: coerceStatus(raw.status),
    prompt: String(raw.prompt ?? ''),
    resultVersion: raw.resultVersion ? normalizePhotoVersion(raw.resultVersion) : null,
    error: normalizeJobError(raw.error, raw.errorCode, raw.errorMessage),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  }
}

export async function getPhotoAnalysis(
  photoId: string,
  signal?: AbortSignal,
): Promise<AnalysisJob> {
  const raw = await apiFetch<RawAnalysisJob>(
    `/photo/${encodeURIComponent(photoId)}/analysis`,
    { signal },
  )
  return normalizeAnalysisJob(raw)
}

export async function createEnhancement(
  photoId: string,
  prompt: string,
  signal?: AbortSignal,
): Promise<EnhancementJob> {
  const raw = await apiFetch<RawEnhancementJob>(
    `/photo/${encodeURIComponent(photoId)}/enhancement`,
    {
      method: 'POST',
      body: JSON.stringify({ prompt }),
      signal,
    },
  )
  return normalizeEnhancementJob(raw)
}

export async function getEnhancement(
  photoId: string,
  jobId: string,
  signal?: AbortSignal,
): Promise<EnhancementJob> {
  const raw = await apiFetch<RawEnhancementJob>(
    `/photo/${encodeURIComponent(photoId)}/enhancement/${encodeURIComponent(jobId)}`,
    { signal },
  )
  return normalizeEnhancementJob(raw)
}

export async function listPhotoVersions(
  photoId: string,
  signal?: AbortSignal,
): Promise<PhotoVersion[]> {
  const raw = await apiFetch<{ versions?: RawPhotoVersion[] } | RawPhotoVersion[]>(
    `/photo/${encodeURIComponent(photoId)}/versions`,
    { signal },
  )
  const list = Array.isArray(raw) ? raw : (raw.versions ?? [])
  return list.map(normalizePhotoVersion)
}

export function isTerminalStatus(status: JobStatus): boolean {
  return status === 'SUCCEEDED' || status === 'FAILED'
}

export type PollOptions = {
  intervalMs?: number
  timeoutMs?: number
  signal?: AbortSignal
}

const DEFAULT_POLL_INTERVAL_MS = 2500
const DEFAULT_POLL_TIMEOUT_MS = 180_000

async function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('aborted'))
      return
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
      reject(new Error('aborted'))
    }
    signal?.addEventListener('abort', onAbort)
  })
}

function assertNotAborted(signal: AbortSignal | undefined) {
  if (signal?.aborted) {
    throw new Error('aborted')
  }
}

export async function pollAnalysisJob(
  photoId: string,
  options: PollOptions = {},
): Promise<AnalysisJob> {
  const intervalMs = options.intervalMs ?? DEFAULT_POLL_INTERVAL_MS
  const timeoutMs = options.timeoutMs ?? DEFAULT_POLL_TIMEOUT_MS
  const startedAt = Date.now()
  assertNotAborted(options.signal)
  let job = await getPhotoAnalysis(photoId, options.signal)
  assertNotAborted(options.signal)
  while (!isTerminalStatus(job.status)) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error('AI 분석 응답이 너무 오래 걸려요')
    }
    await delay(intervalMs, options.signal)
    job = await getPhotoAnalysis(photoId, options.signal)
    assertNotAborted(options.signal)
  }
  return job
}

export async function pollEnhancementJob(
  photoId: string,
  jobId: string,
  options: PollOptions = {},
): Promise<EnhancementJob> {
  const intervalMs = options.intervalMs ?? DEFAULT_POLL_INTERVAL_MS
  const timeoutMs = options.timeoutMs ?? DEFAULT_POLL_TIMEOUT_MS
  const startedAt = Date.now()
  assertNotAborted(options.signal)
  let job = await getEnhancement(photoId, jobId, options.signal)
  assertNotAborted(options.signal)
  while (!isTerminalStatus(job.status)) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error('AI 보정 응답이 너무 오래 걸려요')
    }
    await delay(intervalMs, options.signal)
    job = await getEnhancement(photoId, jobId, options.signal)
    assertNotAborted(options.signal)
  }
  return job
}
