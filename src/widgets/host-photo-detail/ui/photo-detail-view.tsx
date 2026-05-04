import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const CHEVRON_RIGHT = '/icons/chevron-right.svg'
const MORE_ICON = '/icons/more.svg'
const TRASH_ICON = '/icons/trash.svg'
const DOWNLOAD_ICON = '/icons/download.svg'
const HEART_OUTLINE = '/icons/heart-outline.svg'
const HEART_FILLED = '/icons/heart-filled.svg'
const AI_SPARKLE = '/icons/ai-sparkle.svg'

const SAMPLE_PHOTO = '/images/album-cover-sample.png'

const ALBUM_TITLE = '민수 & 지연 Wedding'
const MOCK_MESSAGE = '오늘 정말 아름다웠어, 결혼 축하해!'
const MOCK_UPLOADER_NAME = '김민준'
const MOCK_UPLOADER_RELATION = '친구'
const MOCK_TAKEN_AT = { date: '2026.05.16', time: '14:21' }
const MOCK_UPLOADED_AT = { date: '2026.05.16', time: '20:34' }
const MOCK_RETOUCHED = false

export function PhotoDetailView() {
  const navigate = useNavigate()
  const { albumId, photoId } = useParams()

  const [isFavorite, setIsFavorite] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleBack = () => navigate(-1)
  const handleMore = () => {}
  const handleOpenDelete = () => setIsDeleteModalOpen(true)
  const handleCloseDelete = () => setIsDeleteModalOpen(false)
  const handleConfirmDelete = () => {
    setIsDeleteModalOpen(false)
    navigate(-1)
  }
  const handleDownload = () => {
    if (albumId && photoId) {
      navigate(`/host/albums/${albumId}/photos/${photoId}/save`)
    }
  }
  const handleToggleFavorite = () => setIsFavorite((prev) => !prev)
  const handleEdit = () => {}

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
        <h1 className="text-[20px] font-bold tracking-[-0.4px] text-[#222226]">
          {ALBUM_TITLE}
        </h1>
        <button
          type="button"
          onClick={handleMore}
          aria-label="더 보기"
          className="absolute right-5 flex h-10 w-10 items-center justify-center"
        >
          <img src={MORE_ICON} alt="" className="h-6 w-6" aria-hidden="true" />
        </button>
      </header>

      <div className="relative aspect-[402/302] w-full overflow-hidden bg-[#f4f6fa]">
        <img
          src={SAMPLE_PHOTO}
          alt=""
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
      </div>

      <div className="flex items-center justify-between px-5 pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenDelete}
            aria-label="사진 삭제"
            className="flex h-[38px] items-center justify-center rounded-[10px] bg-[#f4f6fa] px-2"
          >
            <img
              src={TRASH_ICON}
              alt=""
              className="h-6 w-6"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            aria-label="사진 저장"
            className="flex h-[38px] items-center justify-center rounded-[10px] bg-[#f4f6fa] px-2 text-[#222226]"
          >
            <img
              src={DOWNLOAD_ICON}
              alt=""
              className="h-6 w-6"
              aria-hidden="true"
            />
          </button>
        </div>
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          aria-pressed={isFavorite}
          className="flex h-12 w-12 items-center justify-center"
        >
          <img
            src={isFavorite ? HEART_FILLED : HEART_OUTLINE}
            alt=""
            className="h-6 w-6"
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2 px-5">
        <div className="flex flex-col items-start rounded-2xl bg-[#f4f6fa] px-5 py-3">
          <div className="flex gap-3 text-[14px] leading-[1.4] tracking-[-0.28px]">
            <p className="w-[90px] shrink-0 text-[#616369]">축하 메세지</p>
            <p className="text-[#222226]">{MOCK_MESSAGE}</p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 rounded-2xl bg-[#f4f6fa] px-5 py-3">
          <div className="flex gap-3 text-[14px] leading-[1.4] tracking-[-0.28px]">
            <p className="w-[90px] shrink-0 text-[#616369]">업로드자</p>
            <div className="flex items-center gap-1 text-[#222226]">
              <span>{MOCK_UPLOADER_NAME}</span>
              <span>·</span>
              <span>{MOCK_UPLOADER_RELATION}</span>
            </div>
          </div>
          <div className="flex gap-3 text-[14px] leading-[1.4] tracking-[-0.28px]">
            <p className="w-[90px] shrink-0 text-[#616369]">촬영 시간</p>
            <div className="flex items-center gap-1 text-[#222226]">
              <span>{MOCK_TAKEN_AT.date}</span>
              <span>{MOCK_TAKEN_AT.time}</span>
            </div>
          </div>
          <div className="flex gap-3 text-[14px] leading-[1.4] tracking-[-0.28px]">
            <p className="w-[90px] shrink-0 text-[#616369]">업로드 시간</p>
            <div className="flex items-center gap-1 text-[#222226]">
              <span>{MOCK_UPLOADED_AT.date}</span>
              <span>{MOCK_UPLOADED_AT.time}</span>
            </div>
          </div>
          <div className="flex gap-3 text-[14px] leading-[1.4] tracking-[-0.28px]">
            <p className="w-[90px] shrink-0 text-[#616369]">보정 여부</p>
            <p className="text-[#222226]">{MOCK_RETOUCHED ? '보정 완료' : '보정 전'}</p>
          </div>
        </div>
      </div>

      <div className="mt-auto px-5 pb-5 pt-6">
        <button
          type="button"
          onClick={handleEdit}
          className="flex h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-[#222226] text-[18px] font-medium text-white transition-opacity hover:opacity-90 active:opacity-80"
        >
          <img
            src={AI_SPARKLE}
            alt=""
            className="h-6 w-6"
            aria-hidden="true"
          />
          사진 보정하기
        </button>
      </div>

      {isDeleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-delete-title"
          className="fixed inset-0 z-30 mx-auto flex w-full max-w-[402px] items-center justify-center px-5"
        >
          <button
            type="button"
            aria-label="닫기"
            onClick={handleCloseDelete}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative flex w-full flex-col items-center gap-5 rounded-[18px] bg-white px-4 py-5">
            <h2
              id="photo-delete-title"
              className="text-[20px] font-bold leading-normal text-[#222226]"
            >
              이 사진을 삭제할까요?
            </h2>
            <p className="text-center text-[14px] leading-[1.5] text-[#616369]">
              삭제한 사진은 앨범에서 사라지며 복구할 수 없어요.
              <br />
              삭제를 계속 진행하시겠어요?
            </p>
            <div className="flex w-full items-center gap-4">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#f4f6fa] text-[18px] font-medium text-[#222226]"
              >
                삭제하기
              </button>
              <button
                type="button"
                onClick={handleCloseDelete}
                className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#222226] text-[18px] font-medium text-white"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
