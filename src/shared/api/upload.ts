import {
  createPhoto,
  createUploadUrls,
  type CreatePhotoInput,
  type PhotoSummary,
  type UploadUrlEntry,
} from '@/shared/api/photo'

export type UploadProgress = {
  total: number
  completed: number
}

export type UploadFilesResult = {
  uploaded: PhotoSummary[]
  failures: Array<{ file: File; error: unknown }>
}

const ALLOWED_UPLOAD_HOST_PATTERN = /(^|\.)amazonaws\.com$/i

function inferMimeType(file: File): string {
  if (file.type) return file.type
  const lower = file.name.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic'
  return 'image/jpeg'
}

function assertSafeUploadUrl(uploadUrl: string): URL {
  const parsed = new URL(uploadUrl)
  if (parsed.protocol !== 'https:') {
    throw new Error('Untrusted upload URL protocol')
  }
  if (!ALLOWED_UPLOAD_HOST_PATTERN.test(parsed.host)) {
    throw new Error('Untrusted upload URL host')
  }
  return parsed
}

async function putToSignedUrl(
  uploadUrl: string,
  file: File,
  mimeType: string,
): Promise<void> {
  assertSafeUploadUrl(uploadUrl)
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': mimeType },
    body: file,
  })
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status})`)
  }
}

export async function uploadFiles(
  files: File[],
  options?: { onProgress?: (progress: UploadProgress) => void },
): Promise<UploadFilesResult> {
  const groups = new Map<string, File[]>()
  for (const file of files) {
    const mime = inferMimeType(file)
    const list = groups.get(mime) ?? []
    list.push(file)
    groups.set(mime, list)
  }

  const uploaded: PhotoSummary[] = []
  const failures: UploadFilesResult['failures'] = []
  let completed = 0
  const total = files.length
  options?.onProgress?.({ total, completed })

  const recordFailure = (file: File, error: unknown) => {
    failures.push({ file, error })
    completed += 1
    options?.onProgress?.({ total, completed })
  }

  for (const [mimeType, groupFiles] of groups) {
    let entries: UploadUrlEntry[]
    try {
      entries = await createUploadUrls({
        fileCount: groupFiles.length,
        mimeType,
      })
    } catch (error) {
      for (const file of groupFiles) recordFailure(file, error)
      continue
    }

    const pairCount = Math.min(groupFiles.length, entries.length)
    for (let i = pairCount; i < groupFiles.length; i += 1) {
      recordFailure(
        groupFiles[i],
        new Error('Server returned fewer upload URLs than requested'),
      )
    }

    const pairs: Array<{ file: File; entry: UploadUrlEntry }> = []
    for (let i = 0; i < pairCount; i += 1) {
      pairs.push({ file: groupFiles[i], entry: entries[i] })
    }

    await Promise.all(
      pairs.map(async ({ file, entry }) => {
        try {
          await putToSignedUrl(entry.uploadUrl, file, mimeType)
          const input: CreatePhotoInput = {
            fileKey: entry.fileKey,
            embedding: [],
            mimeType,
            fileSizeBytes: file.size,
          }
          const photo = await createPhoto(input)
          if (photo) uploaded.push(photo)
        } catch (error) {
          failures.push({ file, error })
        } finally {
          completed += 1
          options?.onProgress?.({ total, completed })
        }
      }),
    )
  }

  return { uploaded, failures }
}
