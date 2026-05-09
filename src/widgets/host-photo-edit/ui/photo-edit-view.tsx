import { useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

type Tab = 'filter' | 'color' | 'crop' | 'auto' | 'element' | 'portrait'

const FALLBACK_PHOTO = '/images/album-cover-sample.png'

const TAB_LABELS: Record<Tab, string> = {
  filter: '필터 보정',
  color: '색감 보정',
  crop: '기울기 조정',
  auto: '자동 보정',
  element: '요소 편집',
  portrait: '인물 보정',
}

const TABS: Tab[] = ['filter', 'color', 'crop', 'auto', 'element', 'portrait']

const TAB_ICON_SRC: Record<Tab, string> = {
  filter: '/icons/photo-edit-filter.svg',
  color: '/icons/photo-edit-color.svg',
  crop: '/icons/photo-edit-crop.svg',
  auto: '/icons/photo-edit-auto.svg',
  element: '/icons/photo-edit-element.svg',
  portrait: '/icons/photo-edit-portrait.svg',
}

// true = SVG default is white (darken when active on light bg)
// false = SVG default is dark (lighten when inactive on dark bg)
const TAB_ICON_DEFAULT_WHITE: Record<Tab, boolean> = {
  filter: true,
  color: true,
  crop: true,
  auto: true,
  element: false,
  portrait: true,
}

// camera(filter) and AI(auto) icons need an inner p-[4.8px] wrapper to match Figma sizing
const TAB_ICON_HAS_INNER_PADDING: Record<Tab, boolean> = {
  filter: true,
  color: false,
  crop: false,
  auto: true,
  element: false,
  portrait: false,
}

function tabIconStyle(tab: Tab, active: boolean): React.CSSProperties {
  const isWhiteDefault = TAB_ICON_DEFAULT_WHITE[tab]
  if (isWhiteDefault) {
    // white by default → darken when active (sits on light bg)
    return active ? { filter: 'brightness(0)' } : {}
  }
  // dark by default → lighten when inactive (sits on dark bg)
  return active ? {} : { filter: 'brightness(0) invert(1)' }
}

const FILTER_PRESETS = [
  'iPhone 4S',
  'iPhone 5',
  'iPhone 6',
  'iPhone SE',
  'Old Phone Flash',
  '35mm Film',
  'Warm Film',
  'Soft Grain',
  'Flash Film',
  'Vintage Brown',
]

const AUTO_PRESETS = [
  'Default',
  '눈매 선명',
  '윤곽 정리',
  '피부톤',
  '표정 생기',
  '비대칭 완화',
  '입체감 강조',
  '웨스턴 무드',
  '귀여운',
  '순수',
  '동안',
  '메이크업',
]

const ELEMENT_TAGS = ['부케 풍성하게', '잔머리 제거', '핸드폰 제거']

function PresetThumbnails({
  presets,
  photoUrl,
  selected,
  onSelect,
}: {
  presets: string[]
  photoUrl: string
  selected: string | null
  onSelect: (name: string) => void
}) {
  return (
    <div className="flex gap-[4px] overflow-x-auto px-[20px] py-[10px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {presets.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => onSelect(name)}
          className="flex shrink-0 flex-col items-start w-[66px]"
        >
          <div className="aspect-square relative w-full overflow-hidden rounded-[4px]">
            <img
              src={photoUrl}
              alt=""
              className="absolute inset-0 size-full max-w-none object-cover rounded-[4px]"
              aria-hidden="true"
            />
            {selected === name && (
              <div
                className="absolute inset-0 rounded-[4px] bg-black/20"
                aria-hidden="true"
              />
            )}
          </div>
          <div className="flex w-full items-center justify-center py-[4px]">
            <span className="text-[12px] font-medium leading-normal text-black text-center">
              {name}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}

const RULER_PX_PER_UNIT = 8

function RulerSlider({
  label,
  value,
  onChange,
  onCommit,
  min = -50,
  max = 50,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  onCommit?: (before: number, after: number) => void
  min?: number
  max?: number
}) {
  const dragRef = useRef<{ x: number; startValue: number; currentValue: number } | null>(null)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { x: e.clientX, startValue: value, currentValue: value }
  }
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    const delta = -(e.clientX - dragRef.current.x) / RULER_PX_PER_UNIT
    const next = Math.max(min, Math.min(max, Math.round(dragRef.current.startValue + delta)))
    dragRef.current.currentValue = next
    onChange(next)
  }
  const handlePointerUp = () => {
    if (!dragRef.current) return
    onCommit?.(dragRef.current.startValue, dragRef.current.currentValue)
    dragRef.current = null
  }

  return (
    <div className="flex select-none flex-col items-center py-5">
      <p className="mb-5 text-[14px] tracking-[-0.28px] text-black">{label}</p>
      <div
        className="relative w-full overflow-hidden touch-none cursor-grab active:cursor-grabbing"
        style={{ height: 16 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="pointer-events-none absolute inset-y-0"
          style={{ left: `calc(50% - ${(value - min) * RULER_PX_PER_UNIT}px)` }}
        >
          {Array.from({ length: max - min + 1 }, (_, i) => {
            const v = min + i
            const isZero = v === 0
            const isMajor = v % 10 === 0
            const h = isZero ? 16 : isMajor ? 10 : 5
            return (
              <div
                key={v}
                className="absolute"
                style={{
                  left: i * RULER_PX_PER_UNIT,
                  bottom: 0,
                  width: 1,
                  height: h,
                  backgroundColor: isZero ? '#222226' : '#d1d3d8',
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function PhotoEditView() {
  const navigate = useNavigate()
  const location = useLocation()
  const { albumId = '', photoId = '' } = useParams<{ albumId: string; photoId: string }>()

  const photoUrl: string =
    (location.state as { photoUrl?: string } | null)?.photoUrl ?? FALLBACK_PHOTO

  const [activeTab, setActiveTab] = useState<Tab>('filter')
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [selectedAuto, setSelectedAuto] = useState<string | null>(null)
  const [colorValue, setColorValue] = useState(0)
  const [cropAngle, setCropAngle] = useState(0)
  const [cropShape, setCropShape] = useState<'circle' | 'trap-v' | 'trap-h'>('circle')
  const [elementInput, setElementInput] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [colorHistory, setColorHistory] = useState<number[]>([])
  const [colorFuture, setColorFuture] = useState<number[]>([])
  const [cropHistory, setCropHistory] = useState<number[]>([])
  const [cropFuture, setCropFuture] = useState<number[]>([])
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)
  const [isSaveOptionsOpen, setIsSaveOptionsOpen] = useState(false)

  const canUndo =
    (activeTab === 'color' && colorHistory.length > 0) ||
    (activeTab === 'crop' && cropHistory.length > 0)
  const canRedo =
    (activeTab === 'color' && colorFuture.length > 0) ||
    (activeTab === 'crop' && cropFuture.length > 0)

  const handleColorCommit = (before: number, after: number) => {
    if (before === after) return
    setColorHistory((h) => [...h, before])
    setColorFuture([])
  }

  const handleCropCommit = (before: number, after: number) => {
    if (before === after) return
    setCropHistory((h) => [...h, before])
    setCropFuture([])
  }

  const handleBack = () => setIsExitModalOpen(true)
  const handleDone = () => setIsExitModalOpen(true)
  const handleCancelModal = () => setIsExitModalOpen(false)
  const handleConfirmSave = () => {
    setIsExitModalOpen(false)
    setIsSaveOptionsOpen(true)
  }
  const handleSaveAsNew = () => navigate(`/host/albums/${albumId}/photos/${photoId}`)
  const handleSaveAsExisting = () => navigate(`/host/albums/${albumId}/photos/${photoId}`)

  const handleUndo = () => {
    if (activeTab === 'color' && colorHistory.length > 0) {
      const prev = colorHistory[colorHistory.length - 1]
      setColorHistory((h) => h.slice(0, -1))
      setColorFuture((f) => [...f, colorValue])
      setColorValue(prev)
    } else if (activeTab === 'crop' && cropHistory.length > 0) {
      const prev = cropHistory[cropHistory.length - 1]
      setCropHistory((h) => h.slice(0, -1))
      setCropFuture((f) => [...f, cropAngle])
      setCropAngle(prev)
    }
  }

  const handleRedo = () => {
    if (activeTab === 'color' && colorFuture.length > 0) {
      const next = colorFuture[colorFuture.length - 1]
      setColorFuture((f) => f.slice(0, -1))
      setColorHistory((h) => [...h, colorValue])
      setColorValue(next)
    } else if (activeTab === 'crop' && cropFuture.length > 0) {
      const next = cropFuture[cropFuture.length - 1]
      setCropFuture((f) => f.slice(0, -1))
      setCropHistory((h) => [...h, cropAngle])
      setCropAngle(next)
    }
  }

  const toggleTag = (tag: string) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[402px] flex-col bg-white pb-[110px]">
      {/* Header — Figma: left-[20px] w-[362px] h-[40px] centered in 60px */}
      <header className="relative flex h-[60px] shrink-0 items-center justify-center">
        <div className="relative flex h-[40px] w-[362px] items-center justify-center gap-[10px] p-[10px]">

          {/* Back — size-[40px] → rotate-180 → size-[28px] overflow-clip */}
          <button
            type="button"
            onClick={handleBack}
            aria-label="뒤로 가기"
            className="absolute left-0 top-0 flex size-[40px] flex-col items-center justify-center"
          >
            <div className="flex items-center justify-center">
              <div className="rotate-180">
                <div className="relative size-[28px] overflow-hidden">
                  <div className="absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4">
                    <div className="absolute inset-[-5.95%_-11.9%]">
                      <img src="/icons/photo-edit-back.svg" alt="" className="block max-w-none size-full" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Title */}
          <h1 className="max-w-[110px] text-center text-[20px] font-bold tracking-[-0.4px] text-[#222226]">
            {TAB_LABELS[activeTab]}
          </h1>

          {/* Right actions — gap-[20px] px-[10px], undo+redo hidden on filter tab */}
          <div className="absolute right-0 top-0 flex h-[40px] items-center gap-[20px] px-[10px]">
            {activeTab !== 'filter' && (
              <>
                {/* Undo */}
                <button
                  type="button"
                  onClick={handleUndo}
                  aria-label="실행 취소"
                  disabled={!canUndo}
                  className={`flex size-[20px] shrink-0 items-center justify-center rounded-full border-[1.67px] transition-colors ${
                    canUndo ? 'border-[#616369]' : 'border-[#b7bdc6] opacity-40'
                  }`}
                >
                  <div className="relative size-[12.5px] overflow-hidden">
                    <div className="absolute inset-[15%_14.17%_18.33%_15%]">
                      <div className="absolute inset-[-8.4%_-7.91%]">
                        <img
                          src="/icons/photo-edit-undo.svg"
                          alt=""
                          className="block max-w-none size-full"
                          style={canUndo ? { filter: 'brightness(0)' } : undefined}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>
                </button>
                {/* Redo */}
                <button
                  type="button"
                  onClick={handleRedo}
                  aria-label="다시 실행"
                  disabled={!canRedo}
                  className={`flex size-[20px] shrink-0 items-center justify-center rounded-full border-[1.67px] transition-colors ${
                    canRedo ? 'border-[#616369]' : 'border-[#b7bdc6] opacity-40'
                  }`}
                >
                  <div className="relative size-[12.5px] overflow-hidden">
                    <div className="absolute inset-[15%_14.16%_18.33%_15%]">
                      <div className="absolute inset-[-8.4%_-7.9%_-8.4%_-7.91%]">
                        <img
                          src="/icons/photo-edit-redo.svg"
                          alt=""
                          className="block max-w-none size-full"
                          style={canRedo ? { filter: 'brightness(0)' } : undefined}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>
                </button>
              </>
            )}
            {/* Done — size-[20px] */}
            <button
              type="button"
              onClick={handleDone}
              aria-label="완료"
              className="relative size-[20px] shrink-0"
            >
              <div className="absolute inset-[-4.17%]">
                <img src="/icons/photo-edit-done.svg" alt="" className="block max-w-none size-full" aria-hidden="true" />
              </div>
            </button>
          </div>

        </div>
      </header>

      {/* Photo area */}
      <div className="flex h-[505px] w-full shrink-0 items-center justify-center bg-[#f4f6fa]">
        <div
          className={`relative shrink-0 overflow-hidden ${
            activeTab === 'crop'
              ? 'w-[382px] border-[1.4px] border-[#222226]'
              : 'aspect-[402/302] w-full'
          }`}
          style={activeTab === 'crop' ? { height: '286.975px' } : undefined}
        >
          <img
            src={photoUrl}
            alt=""
            style={
              activeTab === 'crop'
                ? { transform: `rotate(${cropAngle}deg) scale(1.1)` }
                : undefined
            }
            className="h-full w-full object-cover"
            aria-hidden="true"
          />
          {/* Portrait overlay */}
          {activeTab === 'portrait' && (
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-black/50" />
              <div
                className="absolute border-2 border-white"
                style={{ top: '18%', left: '28%', width: '44%', height: '50%' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'filter' && (
        <PresetThumbnails
          presets={FILTER_PRESETS}
          photoUrl={photoUrl}
          selected={selectedFilter}
          onSelect={setSelectedFilter}
        />
      )}

      {activeTab === 'color' && (
        <RulerSlider
          label="따뜻함"
          value={colorValue}
          onChange={setColorValue}
          onCommit={handleColorCommit}
        />
      )}

      {activeTab === 'crop' && (
        <div className="flex flex-col gap-4 py-[10px]">
          <div className="flex items-center justify-center gap-[24px] px-[20px]">
            {(
              [
                {
                  id: 'circle' as const,
                  label: '기울기',
                  icon: '/icons/crop-circle.svg',
                  inset: { top: '33%', right: '21%', bottom: '31%', left: '19%' },
                },
                {
                  id: 'trap-v' as const,
                  label: '수직 원근 보정',
                  icon: '/icons/crop-trapezoid-v.svg',
                  inset: { top: '23%', right: '31%', bottom: '22%', left: '33%' },
                },
                {
                  id: 'trap-h' as const,
                  label: '수평 원근 보정',
                  icon: '/icons/crop-trapezoid-h.svg',
                  inset: { top: '33%', right: '22%', bottom: '31%', left: '23%' },
                },
              ]
            ).map(({ id, label, icon, inset }) => {
              const isActive = cropShape === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCropShape(id)}
                  aria-label={label}
                  aria-pressed={isActive}
                  className={`relative shrink-0 size-[52px] overflow-hidden rounded-[100px] border-[1.4px] border-[#a2a5ad] transition-colors ${
                    isActive ? 'bg-[#222226]' : 'bg-[#f4f6fa]'
                  }`}
                >
                  <div className="absolute" style={inset}>
                    <img
                      src={icon}
                      alt=""
                      className="size-full"
                      style={
                        isActive
                          ? { filter: 'brightness(0) invert(1)' }
                          : id === 'circle'
                            ? { filter: 'brightness(0)' }
                            : undefined
                      }
                      aria-hidden="true"
                    />
                  </div>
                </button>
              )
            })}
          </div>
          <RulerSlider
            label="기울기"
            value={cropAngle}
            onChange={setCropAngle}
            onCommit={handleCropCommit}
            min={-45}
            max={45}
          />
        </div>
      )}

      {activeTab === 'auto' && (
        <PresetThumbnails
          presets={AUTO_PRESETS}
          photoUrl={photoUrl}
          selected={selectedAuto}
          onSelect={setSelectedAuto}
        />
      )}

      {activeTab === 'element' && (
        <div className="flex flex-col gap-3 px-[20px] py-[10px]">
          <div className="flex items-start gap-2">
            <div className="flex flex-1 flex-wrap gap-2">
              {ELEMENT_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium leading-none transition-colors ${
                    activeTags.includes(tag)
                      ? 'bg-[#222226] text-white'
                      : 'bg-[#f4f6fa] text-[#222226]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                aria-label="태그 추가"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f6fa]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3V13M3 8H13" stroke="#222226" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="새로고침"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f6fa]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2.5 7.5C2.5 4.739 4.739 2.5 7.5 2.5C9.084 2.5 10.5 3.207 11.48 4.33L13 5.5" stroke="#222226" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13 2.5V5.5H10" stroke="#222226" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.5 8.5C13.5 11.261 11.261 13.5 8.5 13.5C6.916 13.5 5.5 12.793 4.52 11.67L3 10.5" stroke="#222226" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 13.5V10.5H6" stroke="#222226" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
          <input
            type="text"
            value={elementInput}
            onChange={(e) => setElementInput(e.target.value)}
            placeholder="요소를 직접 입력해보세요"
            className="w-full rounded-xl bg-[#f4f6fa] px-4 py-3 text-[14px] text-[#222226] placeholder:text-[#a2a5ad] focus:outline-none"
          />
          <button
            type="button"
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#222226] text-[16px] font-medium text-white"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L11.9 7.6L17.5 9.5L11.9 11.4L10 17L8.1 11.4L2.5 9.5L8.1 7.6L10 2Z" fill="white" />
              <path d="M16 14L16.8 16.2L19 17L16.8 17.8L16 20L15.2 17.8L13 17L15.2 16.2L16 14Z" fill="white" />
            </svg>
            AI 편집하기
          </button>
        </div>
      )}

      {activeTab === 'portrait' && (
        <div className="flex flex-col gap-3 px-[20px] py-[10px]">
          <p className="text-center text-[13px] leading-relaxed text-[#616369]">
            편집하고 싶은 얼굴 영역을 드래그하여 선택하세요
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className="flex h-[52px] flex-1 items-center justify-center rounded-2xl bg-[#f4f6fa] text-[16px] font-medium text-[#222226]"
            >
              추가하기
            </button>
            <button
              type="button"
              className="flex h-[52px] flex-1 items-center justify-center rounded-2xl bg-[#222226] text-[16px] font-medium text-white"
            >
              다음으로
            </button>
          </div>
        </div>
      )}

      {/* Exit/save modal */}
      {isExitModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-edit-save-title"
          className="fixed inset-0 z-30 mx-auto flex w-full max-w-[402px] items-center justify-center px-[20px]"
        >
          <button
            type="button"
            aria-label="닫기"
            onClick={handleCancelModal}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative flex w-full flex-col items-center gap-5 rounded-[18px] bg-white px-[16px] py-[20px]">
            <h2
              id="photo-edit-save-title"
              className="text-center text-[20px] font-bold leading-normal text-[#222226]"
            >
              보정 설정을 저장할까요?
            </h2>
            <p className="text-center text-[14px] leading-[1.5] text-[#616369]">
              현재 선택한 보정 설정이 사진에 적용됩니다.
              <br />
              저장 후에도 다시 수정할 수 있어요.
            </p>
            <div className="flex w-full items-center gap-4">
              <button
                type="button"
                onClick={handleCancelModal}
                className="flex h-11 flex-1 items-center justify-center rounded-[16px] bg-[#f4f6fa] text-[18px] font-medium text-[#222226]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="flex h-11 flex-1 items-center justify-center rounded-[16px] bg-[#222226] text-[18px] font-medium text-white"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save options (replaces toolbar after confirming save) */}
      {isSaveOptionsOpen ? (
        <div className="fixed bottom-[22px] left-1/2 -translate-x-1/2 flex w-[calc(100%-40px)] max-w-[362px] flex-col gap-[8px]">
          <button
            type="button"
            onClick={handleSaveAsNew}
            className="flex h-[60px] w-full items-center justify-center rounded-[16px] bg-[#222226] text-[18px] font-semibold tracking-[-0.36px] text-white"
          >
            새로운 사진으로 저장
          </button>
          <button
            type="button"
            onClick={handleSaveAsExisting}
            className="flex h-[60px] w-full items-center justify-center rounded-[16px] bg-[#f4f6fa] text-[18px] font-semibold tracking-[-0.36px] text-[#222226]"
          >
            기존 사진으로 저장
          </button>
        </div>
      ) : (
        /* Bottom toolbar — fixed pill */
        <nav
          aria-label="보정 탭"
          className="fixed bottom-[22px] left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[362px]"
        >
          <div className="flex items-center gap-[18px] rounded-[100px] bg-[#222226] p-[10px]">
            {TABS.map((tab) => {
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  aria-label={TAB_LABELS[tab]}
                  aria-pressed={isActive}
                  className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full transition-colors ${
                    isActive ? 'bg-[#f4f6fa]' : ''
                  }`}
                >
                  {TAB_ICON_HAS_INNER_PADDING[tab] ? (
                    <div className="flex size-[33.6px] shrink-0 items-center justify-center overflow-hidden rounded-[80px] p-[4.8px]">
                      <img
                        src={TAB_ICON_SRC[tab]}
                        alt=""
                        className="block size-full"
                        style={tabIconStyle(tab, isActive)}
                        aria-hidden="true"
                      />
                    </div>
                  ) : (
                    <div className="relative size-[33.6px] shrink-0 overflow-hidden">
                      <img
                        src={TAB_ICON_SRC[tab]}
                        alt=""
                        className="absolute inset-0 block max-w-none size-full"
                        style={tabIconStyle(tab, isActive)}
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </main>
  )
}
