import { useEffect, useRef, useState } from 'react'

type ViewMode = 'view' | 'delete'

interface FileEntry {
  id: number
  file: File
  preview: string
}

interface GuestUploadSelectViewProps {
  onBack: () => void
  onNext: (files: File[]) => void
}

export function GuestUploadSelectView({ onBack, onNext }: GuestUploadSelectViewProps) {
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [mode, setMode] = useState<ViewMode>('view')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const entriesRef = useRef<FileEntry[]>([])
  const idCounterRef = useRef(0)

  useEffect(() => {
    entriesRef.current = entries
  }, [entries])

  useEffect(() => {
    return () => {
      entriesRef.current.forEach((e) => URL.revokeObjectURL(e.preview))
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    const newEntries = picked.map((file) => ({
      id: ++idCounterRef.current,
      file,
      preview: URL.createObjectURL(file),
    }))
    setEntries((prev) => [...prev, ...newEntries])
    e.target.value = ''
  }

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

  const handleDeleteSelected = () => {
    entries
      .filter((e) => selectedIds.has(e.id))
      .forEach((e) => URL.revokeObjectURL(e.preview))
    setEntries((prev) => prev.filter((e) => !selectedIds.has(e.id)))
    setMode('view')
    setSelectedIds(new Set())
  }

  return (
    <>
    <div className="flex min-h-screen flex-col bg-white text-[#222226]">
      <div className="mx-auto flex w-full max-w-[402px] grow flex-col px-5 pt-6 pb-8">
        <header className="relative flex h-10 items-center justify-center">
          <button
            type="button"
            onClick={() => setIsExitModalOpen(true)}
            aria-label="뒤로가기"
            className="absolute left-0 flex size-10 items-center justify-center"
          >
            <ChevronLeftIcon />
          </button>
          <span className="text-[20px] font-bold tracking-[-0.4px]">사진 선택</span>
        </header>

        <div className="mt-2 flex flex-col items-center">
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === 2 ? 'w-8 bg-[#222226]' : 'w-2 bg-[#b7bdc6]'
                }`}
              />
            ))}
          </div>
          <p className="mt-1 text-center text-[10px] tracking-[-0.2px] text-[#a2a5ad]">
            업로드할 사진을 선택해주세요
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/heic"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
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

          {entries.length > 0 && (
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-[2px]">
                    <PhotoIcon />
                    <span className="text-[12px] font-semibold tracking-[-0.24px]">선택한 사진</span>
                  </div>
                  <span className="text-[12px] tracking-[-0.24px] text-[#a2a5ad]">
                    총 {entries.length}장
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
                {chunkArray(entries, 3).map((row, i) => (
                  <div key={i} className="flex gap-1">
                    {row.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => mode === 'delete' && toggleSelect(entry.id)}
                        className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-[4px] border border-[#d7dbe2]"
                      >
                        <img
                          src={entry.preview}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        {mode === 'delete' && (
                          <span className="absolute right-1 top-1">
                            {selectedIds.has(entry.id) ? (
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

        {mode === 'view' ? (
          <button
            type="button"
            onClick={() => onNext(entries.map((e) => e.file))}
            disabled={entries.length === 0}
            className="flex h-[60px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#222226] text-[18px] font-medium tracking-[-0.36px] text-white disabled:opacity-40"
          >
            <ArrowCircleRightIcon />
            다음
          </button>
        ) : (
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={selectedIds.size === 0}
            className="flex h-[60px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#222226] text-[18px] font-medium tracking-[-0.36px] text-white disabled:opacity-40"
          >
            <TrashIcon />
            {selectedIds.size}개 사진 삭제
          </button>
        )}
      </div>
    </div>

    {isExitModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
        <div className="flex w-full max-w-[362px] flex-col gap-5 rounded-[18px] bg-white px-4 py-5">
          <p className="text-center text-[20px] font-bold tracking-[-0.4px] text-[#222226]">
            사진 선택을 중단할까요?
          </p>
          <p className="text-center text-[14px] leading-[1.5] text-[#616369]">
            선택한 사진이 저장되지 않을 수 있어요.<br />로그인 화면으로 돌아가시겠어요?
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBack}
              className="h-[44px] flex-1 rounded-[16px] bg-[#f4f6fa] text-[18px] font-medium text-[#222226]"
            >
              나가기
            </button>
            <button
              type="button"
              onClick={() => setIsExitModalOpen(false)}
              className="h-[44px] flex-1 rounded-[16px] bg-[#222226] text-[18px] font-medium text-white"
            >
              계속 선택하기
            </button>
          </div>
        </div>
      </div>
    )}
    </>
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

function ArrowCircleRightIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" stroke="white" strokeWidth="1.5" />
      <path
        d="M10.5 8.5L14.5 12L10.5 15.5"
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
