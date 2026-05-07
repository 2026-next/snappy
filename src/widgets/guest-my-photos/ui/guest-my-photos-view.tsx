import { useState } from 'react'

export interface Photo {
  id: number
  url: string
}

interface GuestMyPhotosViewProps {
  albumTitle: string
  uploadCount: number
  uploaderName: string
  photos: Photo[]
  initialMessage?: string
  onBack: () => void
  onAddMore: () => void
  onMessageSave: (message: string) => void
  onPhotosDelete: (photoIds: number[]) => void
}

type ViewMode = 'view' | 'delete'

export function GuestMyPhotosView({
  albumTitle,
  uploadCount,
  uploaderName,
  photos,
  initialMessage = '',
  onBack,
  onAddMore,
  onMessageSave,
  onPhotosDelete,
}: GuestMyPhotosViewProps) {
  const [mode, setMode] = useState<ViewMode>('view')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [currentMessage, setCurrentMessage] = useState(initialMessage)
  const [editingMessage, setEditingMessage] = useState(initialMessage)

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleEnterDeleteMode = () => {
    setMode('delete')
    setSelectedIds(new Set())
  }

  const handleCancelDelete = () => {
    setMode('view')
    setSelectedIds(new Set())
  }

  const handleDelete = () => {
    onPhotosDelete(Array.from(selectedIds))
    setMode('view')
    setSelectedIds(new Set())
  }

  const handleOpenMessageModal = () => {
    setEditingMessage(currentMessage)
    setIsMessageModalOpen(true)
  }

  const handleMessageSave = () => {
    setCurrentMessage(editingMessage)
    onMessageSave(editingMessage)
    setIsMessageModalOpen(false)
  }

  const handleMessageCancel = () => {
    setIsMessageModalOpen(false)
  }

  const rows = chunkArray(photos, 3)

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#222226]">
      <div className="mx-auto flex w-full max-w-[402px] grow flex-col px-5 pt-6 pb-8">
        {/* Header */}
        <header className="relative flex h-10 items-center justify-center">
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로가기"
            className="absolute left-0 flex size-10 items-center justify-center"
          >
            <ChevronLeftIcon />
          </button>
          <span className="text-[20px] font-bold tracking-[-0.4px]">내가 올린 사진</span>
        </header>

        <div className="mt-4 flex flex-col gap-2">
          {/* 업로드 정보 카드 */}
          <div className="flex flex-col gap-2 rounded-[16px] bg-[#f4f6fa] px-5 py-3 text-[14px] leading-[1.4] tracking-[-0.28px]">
            <div className="flex gap-3">
              <span className="w-[90px] text-[#616369]">앨범 제목</span>
              <span>{albumTitle}</span>
            </div>
            <div className="flex gap-3">
              <span className="w-[90px] text-[#616369]">업로드 수량</span>
              <span>총 {uploadCount}장</span>
            </div>
            <div className="flex gap-3">
              <span className="w-[90px] text-[#616369]">업로드자</span>
              <span>{uploaderName}</span>
            </div>
          </div>

          {/* 갤러리 추가 피커 */}
          <button
            type="button"
            onClick={onAddMore}
            className="flex w-full flex-col items-center gap-3 rounded-[16px] bg-[#f4f6fa] py-5"
          >
            <div className="flex items-center justify-center rounded-full bg-[#212121] p-[10px]">
              <UploadIcon />
            </div>
            <span className="text-[14px] font-medium tracking-[-0.28px] text-[#616369]">
              갤러리에서 사진 선택하기
            </span>
          </button>

          <div className="flex items-center gap-[2px]">
            <InfoCircleIcon />
            <div className="flex gap-1 text-[10px] tracking-[-0.2px]">
              <span className="font-semibold text-[#222226]">지원 형식</span>
              <span className="text-[#a2a5ad]">
                JPG, PNG, HEIC&nbsp;&nbsp;|&nbsp;&nbsp;용량이 큰 사진은 업로드에 시간이 걸릴 수 있어요
              </span>
            </div>
          </div>

          {/* 업로드한 사진 섹션 */}
          {photos.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-[2px]">
                    <PhotoIcon />
                    <span className="text-[12px] font-semibold tracking-[-0.24px]">업로드한 사진</span>
                  </div>
                  <span className="text-[12px] tracking-[-0.24px] text-[#a2a5ad]">
                    총 {photos.length}장
                  </span>
                </div>
                {mode === 'view' ? (
                  <button
                    type="button"
                    onClick={handleEnterDeleteMode}
                    className="text-[12px] tracking-[-0.24px] text-[#a2a5ad] underline"
                  >
                    사진 삭제
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    className="text-[12px] tracking-[-0.24px] text-[#a2a5ad] underline"
                  >
                    선택 취소
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1">
                {rows.map((row, i) => (
                  <div key={i} className="flex gap-1">
                    {row.map((photo) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => mode === 'delete' && toggleSelect(photo.id)}
                        className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-[4px] border border-[#d7dbe2]"
                      >
                        <img
                          src={photo.url}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        {mode === 'delete' && (
                          <span className="absolute right-1 top-1">
                            {selectedIds.has(photo.id) ? (
                              <CheckCircleFilled />
                            ) : (
                              <CheckCircleEmpty />
                            )}
                          </span>
                        )}
                      </button>
                    ))}
                    {row.length < 3 &&
                      Array.from({ length: 3 - row.length }).map((_, k) => (
                        <div key={k} className="aspect-square min-w-0 flex-1" />
                      ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grow" />

        {/* 하단 버튼 */}
        {mode === 'view' ? (
          <button
            type="button"
            onClick={handleOpenMessageModal}
            className="flex h-[60px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#222226] text-[18px] font-medium tracking-[-0.36px] text-white"
          >
            <MessageIcon />
            축하 메세지 수정
          </button>
        ) : (
          <button
            type="button"
            onClick={handleDelete}
            disabled={selectedIds.size === 0}
            className="flex h-[60px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#222226] text-[18px] font-medium tracking-[-0.36px] text-white disabled:opacity-40"
          >
            <TrashIcon />
            {selectedIds.size}개 사진 삭제
          </button>
        )}
      </div>

      {/* 축하 메세지 수정 모달 */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div className="flex w-full max-w-[362px] flex-col gap-5 rounded-[18px] bg-white px-4 py-5">
            <p className="text-center text-[20px] font-bold tracking-[-0.4px]">
              축하 메세지 수정
            </p>
            <div className="flex flex-col gap-[10px] rounded-[16px] bg-[#f4f6fa] px-4 pb-4 pt-[10px]">
              <p className="text-[12px] tracking-[-0.24px] text-[#a2a5ad]">
                메세지는 생략해도 괜찮아요
              </p>
              <textarea
                value={editingMessage}
                onChange={(e) => setEditingMessage(e.target.value)}
                className="h-[120px] w-full resize-none rounded-[6px] bg-white p-[10px] text-[14px] font-medium tracking-[-0.28px] text-[#222226] outline-none placeholder:text-[#b7bdc6]"
                placeholder="예: 오늘 너무 아름다웠어요. 결혼 진심으로 축하해요!"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleMessageCancel}
                className="h-[44px] flex-1 rounded-[16px] bg-[#f4f6fa] text-[18px] font-medium text-[#222226]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleMessageSave}
                className="h-[44px] flex-1 rounded-[16px] bg-[#222226] text-[18px] font-medium text-white"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

function ChevronLeftIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M17 7L10 14L17 21"
        stroke="#222226"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
      <path d="M27 36V22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M20 29L27 22L34 29"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M18 40H36" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function PhotoIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <rect x="1.5" y="3.5" width="14" height="10" rx="1.5" stroke="#222226" strokeWidth="1" />
      <circle cx="5.5" cy="7" r="1.5" stroke="#222226" strokeWidth="1" />
      <path
        d="M1.5 12L5.5 8.5L8.5 11.5L11 9.5L15.5 13.5"
        stroke="#222226"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function InfoCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6.5" stroke="#222226" strokeWidth="0.5" />
      <path d="M7 6.5V10" stroke="#222226" strokeWidth="1" strokeLinecap="round" />
      <circle cx="7" cy="5" r="0.75" fill="#222226" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8l-4 4V5a1 1 0 0 1 1-1z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M8 6V4h8v2"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 6l-1 14H6L5 6"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckCircleFilled() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#222226" />
      <path
        d="M7 12L10.5 15.5L17 8.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckCircleEmpty() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10.5" fill="white" fillOpacity="0.7" stroke="#b7bdc6" strokeWidth="1.5" />
    </svg>
  )
}
