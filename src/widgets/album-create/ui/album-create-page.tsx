import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  AlbumCreateForm,
  type AlbumCreateInput,
} from '@/widgets/album-create/ui/album-create-form'
import { AlbumShareView } from '@/widgets/album-create/ui/album-share-view'

const CHEVRON_RIGHT = '/icons/chevron-right.svg'

export function AlbumCreatePage() {
  const navigate = useNavigate()
  const [createdAlbumName, setCreatedAlbumName] = useState<string | null>(null)

  const handleBack = () => {
    if (createdAlbumName) {
      setCreatedAlbumName(null)
      return
    }
    navigate(-1)
  }

  const handleCreate = (input: AlbumCreateInput) => {
    setCreatedAlbumName(input.name.trim() || '새 앨범')
  }

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[402px] flex-col bg-white">
      <header className="relative flex h-[60px] items-center justify-center px-5">
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로 가기"
          className="absolute left-5 flex h-10 w-10 items-center justify-center"
        >
          <img
            src={CHEVRON_RIGHT}
            alt=""
            className="h-[15.67px] w-[8.67px] -scale-x-100"
            aria-hidden="true"
          />
        </button>
        <h1 className="text-[20px] font-bold text-[#222226]">새 앨범 만들기</h1>
      </header>

      {createdAlbumName ? (
        <AlbumShareView albumName={createdAlbumName} onGoHome={handleGoHome} />
      ) : (
        <AlbumCreateForm onCreate={handleCreate} />
      )}
    </main>
  )
}
