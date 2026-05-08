import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getMyMessage, saveMessage } from '@/shared/api/message'
import { deletePhoto, getMyPhotos, type PhotoSummary } from '@/shared/api/photo'
import { useAuthStore } from '@/shared/auth/use-auth-store'
import {
  GuestMyPhotosView,
  type Photo,
} from '@/widgets/guest-my-photos/ui/guest-my-photos-view'

function toViewPhoto(photo: PhotoSummary): Photo {
  return {
    id: photo.id,
    url: photo.thumbnailUrl ?? photo.url,
  }
}

function readGuestName(guest: Record<string, unknown> | null): string {
  if (!guest) return ''
  const name = guest['name']
  return typeof name === 'string' ? name : ''
}

export function GuestMyPhotosPage() {
  const { albumId = '' } = useParams<{ albumId: string }>()
  const navigate = useNavigate()
  const guest = useAuthStore((s) => s.guest)
  const uploaderName = readGuestName(guest)

  const [photos, setPhotos] = useState<PhotoSummary[]>([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSavingMessage, setIsSavingMessage] = useState(false)
  const [isDeletingPhotos, setIsDeletingPhotos] = useState(false)

  const loadAll = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [photoList, savedMessage] = await Promise.all([
        getMyPhotos(),
        getMyMessage(),
      ])
      setPhotos(photoList)
      setMessage(savedMessage?.content ?? '')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '내 사진을 불러오지 못했어요',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  const handleMessageSave = async (next: string) => {
    if (next.length === 0) return
    setIsSavingMessage(true)
    setErrorMessage(null)
    try {
      const saved = await saveMessage(next)
      setMessage(saved.content)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '메세지 저장에 실패했어요',
      )
    } finally {
      setIsSavingMessage(false)
    }
  }

  const handlePhotosDelete = async (photoIds: string[]) => {
    if (photoIds.length === 0) return
    setIsDeletingPhotos(true)
    setErrorMessage(null)
    const results = await Promise.allSettled(
      photoIds.map((id) => deletePhoto(id).then(() => id)),
    )
    const removed = new Set<string>()
    let failed = 0
    for (const result of results) {
      if (result.status === 'fulfilled') {
        removed.add(result.value)
      } else {
        failed += 1
      }
    }
    if (removed.size > 0) {
      setPhotos((prev) => prev.filter((p) => !removed.has(p.id)))
    }
    if (failed > 0) {
      setErrorMessage(`${failed}장의 사진을 삭제하지 못했어요.`)
    }
    setIsDeletingPhotos(false)
  }

  return (
    <GuestMyPhotosView
      albumTitle="내 앨범"
      uploadCount={photos.length}
      uploaderName={uploaderName}
      photos={photos.map(toViewPhoto)}
      initialMessage={message}
      isLoading={isLoading}
      errorMessage={errorMessage}
      isSavingMessage={isSavingMessage}
      isDeletingPhotos={isDeletingPhotos}
      onBack={() => navigate(`/guest/${albumId}/login`)}
      onAddMore={() => navigate(`/guest/${albumId}/upload/select`)}
      onMessageSave={handleMessageSave}
      onPhotosDelete={handlePhotosDelete}
    />
  )
}
