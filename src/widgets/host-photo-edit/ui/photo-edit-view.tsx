import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import {
  type AnalysisJob,
  type EnhancementJob,
  type PhotoVersion,
  type SuggestedEnhancement,
  createEnhancement,
  listPhotoVersions,
  pollAnalysisJob,
  pollEnhancementJob,
} from '@/shared/api/photo-ai'
import { uploadFiles } from '@/shared/api/upload'
import { bakeEditedPhoto } from '@/widgets/host-photo-edit/lib/bake-photo'

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

const FILTER_CSS: Record<string, string> = {
  'iPhone 4S':      'contrast(1.1) brightness(1.05) saturate(1.2)',
  'iPhone 5':       'contrast(1.05) brightness(1.1) saturate(1.1)',
  'iPhone 6':       'brightness(1.08) contrast(1.02) saturate(0.92)',
  'iPhone SE':      'brightness(1.05) contrast(1.06) saturate(1.05) hue-rotate(5deg)',
  'Old Phone Flash':'brightness(1.3) contrast(0.85) saturate(0.75) sepia(0.15)',
  '35mm Film':      'sepia(0.25) contrast(1.1) brightness(0.95) saturate(0.85)',
  'Warm Film':      'sepia(0.35) saturate(1.4) brightness(1.05) contrast(1.05)',
  'Soft Grain':     'brightness(1.12) contrast(0.88) saturate(0.88)',
  'Flash Film':     'brightness(1.28) contrast(1.18) saturate(0.85)',
  'Vintage Brown':  'sepia(0.55) contrast(1.1) brightness(0.92) saturate(0.75)',
}

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


function PresetThumbnails({
  presets,
  photoUrl,
  selected,
  onSelect,
  filterMap,
}: {
  presets: string[]
  photoUrl: string
  selected: string | null
  onSelect: (name: string) => void
  filterMap?: Record<string, string>
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
              style={filterMap?.[name] ? { filter: filterMap[name] } : undefined}
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

function getWarmthFilter(value: number): string | undefined {
  if (value === 0) return undefined
  const t = Math.abs(value) / 20
  if (value > 0) {
    // 따뜻함: 세피아(주황·갈색 톤) + 채도 살짝 올림
    const sepia = (t * 0.45).toFixed(3)
    const saturate = (1 + t * 0.2).toFixed(3)
    return `sepia(${sepia}) saturate(${saturate})`
  } else {
    // 차가움: 색조를 청록 방향으로 + 채도·밝기 살짝 내림
    const hue = (t * 20).toFixed(1)
    const saturate = (1 - t * 0.12).toFixed(3)
    const brightness = (1 - t * 0.05).toFixed(3)
    return `hue-rotate(${hue}deg) saturate(${saturate}) brightness(${brightness})`
  }
}

function RulerSlider({
  value,
  label,
  onChange,
  onCommit,
  min = -20,
  max = 20,
  showValue = false,
}: {
  value: number
  label?: string
  onChange: (v: number) => void
  onCommit?: (before: number, after: number) => void
  min?: number
  max?: number
  showValue?: boolean
}) {
  const dragRef = useRef<{ x: number; startValue: number; currentValue: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { x: e.clientX, startValue: value, currentValue: value }
    setIsDragging(true)
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
    setIsDragging(false)
  }

  return (
    <div className="flex select-none flex-col items-center py-5">
      {showValue && (
        <p className="mb-5 text-[14px] tracking-[-0.28px] text-black text-center">
          {isDragging ? value : (label ?? value)}
        </p>
      )}
      <div
        className="relative w-full touch-none cursor-grab active:cursor-grabbing"
        style={{
          height: 16,
          overflow: 'hidden',
          maskImage:
            'linear-gradient(to right, transparent 0%, #000 18%, #000 82%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, #000 18%, #000 82%, transparent 100%)',
        }}
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
                  backgroundColor: isZero ? '#222226' : isMajor ? '#a2a5ad' : '#d1d3d8',
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface FaceFrame { id: number; left: number; top: number; width: number; height: number }

export function PhotoEditView() {
  const navigate = useNavigate()
  const location = useLocation()
  const { albumId = '', photoId = '' } = useParams<{ albumId: string; photoId: string }>()

  const navState = location.state as {
    photoUrl?: string
    suggestedPrompt?: string
  } | null
  const originalPhotoUrl: string = navState?.photoUrl ?? FALLBACK_PHOTO
  const suggestedPromptFromState: string =
    typeof navState?.suggestedPrompt === 'string' && navState.suggestedPrompt.trim().length > 0
      ? navState.suggestedPrompt
      : ''

  const [activeTab, setActiveTab] = useState<Tab>(
    suggestedPromptFromState ? 'element' : 'filter',
  )
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [selectedAuto, setSelectedAuto] = useState<string | null>(null)
  const [colorValue, setColorValue] = useState(0)
  const [cropAngle, setCropAngle] = useState(0)
  const [cropScale, setCropScale] = useState(1)
  const [perspV, setPerspV] = useState(0)
  const [perspH, setPerspH] = useState(0)
  const [cropShape, setCropShape] = useState<'circle' | 'trap-v' | 'trap-h'>('circle')
  const [elementInput, setElementInput] = useState(suggestedPromptFromState)
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [aiJob, setAiJob] = useState<EnhancementJob | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [isAiSubmitting, setIsAiSubmitting] = useState(false)
  const [enhancedPhotoUrl, setEnhancedPhotoUrl] = useState<string | null>(null)
  const aiAbortRef = useRef<AbortController | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisJob | null>(null)
  const analysisAbortRef = useRef<AbortController | null>(null)
  const [isVersionsOpen, setIsVersionsOpen] = useState(false)
  const [versions, setVersions] = useState<PhotoVersion[] | null>(null)
  const [versionsLoading, setVersionsLoading] = useState(false)
  const [versionsError, setVersionsError] = useState<string | null>(null)

  const photoUrl = enhancedPhotoUrl ?? originalPhotoUrl

  useEffect(() => {
    return () => {
      aiAbortRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    aiAbortRef.current?.abort()
    setAiJob(null)
    setAiError(null)
    setIsAiSubmitting(false)
    setEnhancedPhotoUrl(null)
    setVersions(null)
    setVersionsError(null)
    setVersionsLoading(false)
    setIsVersionsOpen(false)
  }, [photoId])

  useEffect(() => {
    if (!photoId) return
    analysisAbortRef.current?.abort()
    const controller = new AbortController()
    analysisAbortRef.current = controller
    setAnalysis(null)
    pollAnalysisJob(photoId, { signal: controller.signal })
      .then((job) => {
        if (!controller.signal.aborted) setAnalysis(job)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [photoId])

  const [faceFrames, setFaceFrames] = useState<FaceFrame[]>([
    { id: 1, left: 102, top: 52, width: 75, height: 83 },
  ])
  const nextFrameIdRef = useRef(2)
  const [selectedFrameId, setSelectedFrameId] = useState<number | null>(null)
  const [portraitMode, setPortraitMode] = useState<'select' | 'adjust'>('select')
  const [activeAdjustTool, setActiveAdjustTool] = useState('얼굴형 조정')
  const [adjustValue, setAdjustValue] = useState(0)
  const [editingFrameId, setEditingFrameId] = useState<number | null>(null)
  const [frameAdjustments, setFrameAdjustments] = useState<Record<number, Record<string, number>>>({})
  const [colorHistory, setColorHistory] = useState<number[]>([])
  const [colorFuture, setColorFuture] = useState<number[]>([])
  const [cropHistory, setCropHistory] = useState<number[]>([])
  const [cropFuture, setCropFuture] = useState<number[]>([])
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)
  const [isSaveOptionsOpen, setIsSaveOptionsOpen] = useState(false)
  const [isSaveCompleteOpen, setIsSaveCompleteOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const onResize = () => setKeyboardHeight(Math.max(0, window.innerHeight - vv.height))
    vv.addEventListener('resize', onResize)
    return () => vv.removeEventListener('resize', onResize)
  }, [])

  const isKeyboardOpen = isInputFocused && keyboardHeight > 50

  // Pinch-to-zoom for crop tab
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const pinchRef = useRef<{ dist: number; startScale: number } | null>(null)
  const cropScaleRef = useRef(cropScale)
  cropScaleRef.current = cropScale

  const handlePhotoPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeTab !== 'crop') return
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointersRef.current.size === 2) {
      const pts = [...pointersRef.current.values()]
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y)
      pinchRef.current = { dist, startScale: cropScaleRef.current }
    }
  }

  const handlePhotoPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeTab !== 'crop' || !pointersRef.current.has(e.pointerId)) return
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const pts = [...pointersRef.current.values()]
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y)
      const next = Math.max(0.5, Math.min(4, pinchRef.current.startScale * (dist / pinchRef.current.dist)))
      setCropScale(next)
    }
  }

  const handlePhotoPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId)
    if (pointersRef.current.size < 2) pinchRef.current = null
  }

  // Portrait: face frame resize + move via drag
  const photoContainerRef = useRef<HTMLDivElement>(null)
  const frameDragRef = useRef<{
    frameId: number
    handle: 'top-right' | 'bottom-left' | 'move'
    startX: number
    startY: number
    startFrame: FaceFrame
    moved: boolean
  } | null>(null)

  const startFrameDrag = (
    e: React.PointerEvent<HTMLDivElement>,
    frameId: number,
    handle: 'top-right' | 'bottom-left' | 'move',
  ) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    const frame = faceFrames.find((f) => f.id === frameId)
    if (!frame) return
    frameDragRef.current = { frameId, handle, startX: e.clientX, startY: e.clientY, startFrame: { ...frame }, moved: false }
  }

  const handleFramePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!frameDragRef.current || !photoContainerRef.current) return
    const rawDx = e.clientX - frameDragRef.current.startX
    const rawDy = e.clientY - frameDragRef.current.startY
    if (Math.hypot(rawDx, rawDy) > 4) frameDragRef.current.moved = true
    if (!frameDragRef.current.moved) return
    const rect = photoContainerRef.current.getBoundingClientRect()
    const sx = 402 / rect.width
    const sy = 302 / rect.height
    const dx = rawDx * sx
    const dy = rawDy * sy
    const { handle, startFrame, frameId } = frameDragRef.current
    setFaceFrames((prev) =>
      prev.map((f) => {
        if (f.id !== frameId) return f
        if (handle === 'move') {
          return { ...f, left: startFrame.left + dx, top: startFrame.top + dy }
        }
        if (handle === 'top-right') {
          return {
            ...f,
            top: startFrame.top + dy,
            height: Math.max(30, startFrame.height - dy),
            width: Math.max(30, startFrame.width + dx),
          }
        }
        // bottom-left
        return {
          ...f,
          left: startFrame.left + dx,
          width: Math.max(30, startFrame.width - dx),
          height: Math.max(30, startFrame.height + dy),
        }
      }),
    )
  }

  const handleFramePointerUp = (frameId: number) => {
    if (frameDragRef.current && !frameDragRef.current.moved) {
      if (portraitMode === 'adjust') {
        if (editingFrameId !== frameId) {
          setEditingFrameId(frameId)
          setAdjustValue(frameAdjustments[frameId]?.[activeAdjustTool] ?? 0)
        }
      } else {
        setSelectedFrameId((prev) => (prev === frameId ? null : frameId))
      }
    }
    frameDragRef.current = null
  }

  // Mouse wheel zoom for desktop
  const photoAreaRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = photoAreaRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (activeTab !== 'crop') return
      e.preventDefault()
      setCropScale((prev) => Math.max(0.5, Math.min(4, prev - e.deltaY * 0.002)))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [activeTab])

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

  const aiStatus = aiJob?.status ?? null
  const isAiProcessing =
    isAiSubmitting ||
    aiStatus === 'PENDING' ||
    aiStatus === 'PROCESSING'

  const analysisResult = analysis?.result ?? null
  const hasPerson = analysisResult?.hasPerson ?? false
  const aiSuggestions: SuggestedEnhancement[] =
    analysisResult?.suggestedEnhancements ?? []

  const visibleTabs = useMemo<Tab[]>(
    () =>
      hasPerson
        ? ['filter', 'color', 'crop', 'auto', 'element', 'portrait']
        : ['filter', 'color', 'crop', 'element'],
    [hasPerson],
  )

  useEffect(() => {
    if (activeTab === 'auto' && !hasPerson && analysis?.status === 'SUCCEEDED') {
      setActiveTab('filter')
    }
    if (activeTab === 'portrait' && !hasPerson && analysis?.status === 'SUCCEEDED') {
      setActiveTab('filter')
    }
  }, [activeTab, hasPerson, analysis?.status])

  const handleRunAiEnhancement = async (overridePrompt?: string) => {
    if (!photoId) return
    const prompt = (overridePrompt ?? elementInput).trim()
    if (prompt.length === 0) {
      setAiError('보정 요청을 입력해 주세요')
      return
    }
    if (isAiProcessing) return

    aiAbortRef.current?.abort()
    const controller = new AbortController()
    aiAbortRef.current = controller

    setAiError(null)
    setIsAiSubmitting(true)
    try {
      const created = await createEnhancement(photoId, prompt)
      if (controller.signal.aborted) return
      setAiJob(created)
      const finalJob = await pollEnhancementJob(photoId, created.jobId, {
        signal: controller.signal,
      })
      if (controller.signal.aborted) return
      setAiJob(finalJob)
      if (finalJob.status === 'SUCCEEDED' && finalJob.resultVersion?.url) {
        setEnhancedPhotoUrl(finalJob.resultVersion.url)
      } else if (finalJob.status === 'FAILED') {
        setAiError(finalJob.error?.message ?? 'AI 보정에 실패했어요')
      }
    } catch (err) {
      if (controller.signal.aborted) return
      if (err instanceof Error && err.message === 'aborted') return
      setAiError(err instanceof Error ? err.message : 'AI 보정 요청에 실패했어요')
    } finally {
      if (!controller.signal.aborted) {
        setIsAiSubmitting(false)
      }
    }
  }

  const handleOpenVersions = async () => {
    if (!photoId) return
    setIsVersionsOpen(true)
    if (versions !== null || versionsLoading) return
    setVersionsLoading(true)
    setVersionsError(null)
    try {
      const list = await listPhotoVersions(photoId)
      setVersions(list)
    } catch (err) {
      setVersionsError(err instanceof Error ? err.message : '버전 목록을 불러오지 못했어요')
    } finally {
      setVersionsLoading(false)
    }
  }

  const handleSelectVersion = (version: PhotoVersion) => {
    if (!version.url) return
    setEnhancedPhotoUrl(version.url)
    setIsVersionsOpen(false)
  }

  const aiStatusLabel = useMemo<string | null>(() => {
    if (aiError) return aiError
    if (!aiStatus) return null
    if (aiStatus === 'PENDING') return 'AI 보정 대기 중...'
    if (aiStatus === 'PROCESSING') return 'AI 보정 진행 중...'
    if (aiStatus === 'FAILED') {
      const detail = aiJob?.error?.message?.trim()
      return detail ? `AI 보정에 실패했어요 (${detail})` : 'AI 보정에 실패했어요'
    }
    if (aiStatus === 'SUCCEEDED') return 'AI 보정 완료'
    return null
  }, [aiStatus, aiError, aiJob])

  const handleBack = () => setIsExitModalOpen(true)
  const handleDone = () => setIsExitModalOpen(true)
  const handleCancelModal = () => setIsExitModalOpen(false)
  const handleDiscardAndExit = () => {
    setIsExitModalOpen(false)
    navigate(-1)
  }
  const handleConfirmSave = () => {
    setIsExitModalOpen(false)
    setSaveError(null)
    setIsSaveOptionsOpen(true)
  }
  const persistEdits = async () => {
    if (isSaving) return
    setSaveError(null)
    setIsSaving(true)
    try {
      const { file } = await bakeEditedPhoto({
        photoUrl,
        cssFilter: combinedFilter,
      })
      const result = await uploadFiles([file])
      if (result.failures.length > 0 || result.uploaded.length === 0) {
        const reason = result.failures[0]?.error
        throw reason instanceof Error
          ? reason
          : new Error('보정된 사진을 저장하지 못했어요')
      }
      setIsSaveOptionsOpen(false)
      setIsSaveCompleteOpen(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '저장에 실패했어요')
    } finally {
      setIsSaving(false)
    }
  }
  const handleSaveAsNew = () => {
    void persistEdits()
  }
  const handleSaveAsExisting = () => {
    void persistEdits()
  }
  const handleSaveCompleteHome = () => {
    setIsSaveCompleteOpen(false)
    navigate('/')
  }
  const handleSaveCompleteBack = () => {
    setIsSaveCompleteOpen(false)
    navigate(`/host/albums/${albumId}/photos/${photoId}`)
  }

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

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => {
      const next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      setElementInput(next.join(', '))
      return next
    })
  }

  const ADJUST_TOOL_SCALES: Record<string, number[]> = {
    '얼굴형 조정': [-4, -3, -2, -1, 0, 1, 2, 3, 4],
    '눈크기 조정': [-2, -1, 0, 1, 2, 3, 4],
    '코 조정': [-4, -3, -2, -1, 0, 1, 2, 3, 4],
  }

  // Portrait: detected face positions (402×302 coordinate space)
  const DETECTED_FACES: Omit<FaceFrame, 'id'>[] = [
    { left: 102, top: 52, width: 75, height: 83 },
    { left: 225, top: 31, width: 75, height: 83 },
  ]
  const handleAddFaceFrame = () => {
    const nextPos = DETECTED_FACES[faceFrames.length % DETECTED_FACES.length]
    setFaceFrames((prev) => [...prev, { id: nextFrameIdRef.current++, ...nextPos }])
  }

  // Combine preset filter + warmth filter
  const presetFilterStr = selectedFilter ? (FILTER_CSS[selectedFilter] ?? '') : ''
  const warmthFilterStr = colorValue !== 0 ? (getWarmthFilter(colorValue) ?? '') : ''
  const combinedFilter = [presetFilterStr, warmthFilterStr].filter(Boolean).join(' ') || undefined

  const PERSP_D = 700 // perspective distance (px)
  const perspVDeg = perspV * 0.5  // slider ±20 → ±10°
  const perspHDeg = perspH * 0.5

  // Minimum scale to fully cover the container after rotation + perspective
  const autoAngleScale = (() => {
    const w = 402, h = 302
    // rotation coverage
    const rad = Math.abs(cropAngle) * (Math.PI / 180)
    const angleScale = rad > 0
      ? Math.max((w * Math.cos(rad) + h * Math.sin(rad)) / w,
                 (h * Math.cos(rad) + w * Math.sin(rad)) / h)
      : 1
    // perspective coverage — exact formula: s = 1 / (cosθ − dim/2·sinθ/d)
    // (+1.5% margin for sub-pixel rendering)
    const vRad = Math.abs(perspVDeg * Math.PI / 180)
    const hRad = Math.abs(perspHDeg * Math.PI / 180)
    const perspVScale = vRad > 0 ? 1.015 / (Math.cos(vRad) - (h / 2) * Math.sin(vRad) / PERSP_D) : 1
    const perspHScale = hRad > 0 ? 1.015 / (Math.cos(hRad) - (w / 2) * Math.sin(hRad) / PERSP_D) : 1
    return Math.max(1, angleScale, perspVScale, perspHScale)
  })()
  const effectiveCropScale = Math.max(cropScale, autoAngleScale)

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
      <div
        ref={photoAreaRef}
        className="flex h-[505px] w-full shrink-0 items-center justify-center bg-[#f4f6fa]"
        style={activeTab === 'crop' ? { touchAction: 'none' } : undefined}
        onPointerDown={handlePhotoPointerDown}
        onPointerMove={handlePhotoPointerMove}
        onPointerUp={handlePhotoPointerUp}
        onPointerCancel={handlePhotoPointerUp}
      >
        <div
          ref={photoContainerRef}
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
            style={{
              transform: `perspective(${PERSP_D}px) rotateX(${perspVDeg}deg) rotateY(${perspHDeg}deg) rotate(${cropAngle}deg) scale(${effectiveCropScale})`,
              ...(combinedFilter ? { filter: combinedFilter } : {}),
            }}
            className={`h-full w-full transition-[filter] duration-200 ${
              activeTab === 'crop' ? 'object-cover' : 'object-contain'
            } ${isAiProcessing ? 'blur-md scale-105' : ''}`}
            aria-hidden="true"
          />
          {isAiProcessing && (
            <div
              aria-live="polite"
              className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/30"
            >
              <span
                className="size-10 animate-spin rounded-full border-[3px] border-white border-t-transparent"
                aria-hidden="true"
              />
              <p className="text-[14px] font-medium text-white">
                AI 보정 진행 중...
              </p>
              <p className="text-[12px] text-white/80">
                완료까지 잠시만 기다려주세요
              </p>
            </div>
          )}
          {/* Portrait overlay — SVG mask + face frame borders */}
          {activeTab === 'portrait' && (
            <div
              className="absolute inset-0"
              onPointerDown={() => setSelectedFrameId(null)}
            >
              {/* Dark overlay with transparent holes for each face */}
              <svg
                className="pointer-events-none absolute inset-0"
                width="100%"
                height="100%"
                viewBox="0 0 402 302"
                preserveAspectRatio="none"
              >
                <defs>
                  <mask id="portraitMask">
                    <rect width="402" height="302" fill="white" />
                    {faceFrames.map((f) => (
                      <rect key={f.id} x={f.left} y={f.top} width={f.width} height={f.height} rx="8" ry="8" fill="black" />
                    ))}
                  </mask>
                </defs>
                <rect width="402" height="302" fill="rgba(0,0,0,0.5)" mask="url(#portraitMask)" />
              </svg>
              {/* Face frames: move + resize + select + adjust */}
              {faceFrames.map((f, idx) => {
                const isSelected = selectedFrameId === f.id
                const isEditing = portraitMode === 'adjust' && editingFrameId === f.id
                const isOtherInAdjust = portraitMode === 'adjust' && !isEditing
                const borderColor = isEditing ? 'border-[#ff6666]' : isSelected ? 'border-[#60a5fa]' : 'border-white'
                const cursorClass = isOtherInAdjust ? 'cursor-pointer' : 'cursor-move'
                return (
                  <div key={f.id}>
                    <div
                      className={`absolute rounded-[8px] border-2 ${borderColor} ${cursorClass}`}
                      style={{
                        left: `${(f.left / 402) * 100}%`,
                        top: `${(f.top / 302) * 100}%`,
                        width: `${(f.width / 402) * 100}%`,
                        height: `${(f.height / 302) * 100}%`,
                        pointerEvents: 'auto',
                        touchAction: 'none',
                      }}
                      onPointerDown={(e) => startFrameDrag(e, f.id, 'move')}
                      onPointerMove={handleFramePointerMove}
                      onPointerUp={() => handleFramePointerUp(f.id)}
                      onPointerCancel={() => handleFramePointerUp(f.id)}
                    >
                      {/* Resize handles — hidden in adjust mode */}
                      {portraitMode === 'select' && (
                        <>
                          <div
                            className="absolute -right-[7px] -top-[7px] size-[14px] cursor-nwse-resize rounded-full bg-white"
                            style={{ pointerEvents: 'auto', touchAction: 'none' }}
                            onPointerDown={(e) => startFrameDrag(e, f.id, 'top-right')}
                            onPointerMove={handleFramePointerMove}
                            onPointerUp={() => handleFramePointerUp(f.id)}
                            onPointerCancel={() => handleFramePointerUp(f.id)}
                          />
                          <div
                            className="absolute -bottom-[7px] -left-[7px] size-[14px] cursor-nwse-resize rounded-full bg-white"
                            style={{ pointerEvents: 'auto', touchAction: 'none' }}
                            onPointerDown={(e) => startFrameDrag(e, f.id, 'bottom-left')}
                            onPointerMove={handleFramePointerMove}
                            onPointerUp={() => handleFramePointerUp(f.id)}
                            onPointerCancel={() => handleFramePointerUp(f.id)}
                          />
                        </>
                      )}
                    </div>
                    {/* Face N label — appears below editing frame in adjust mode */}
                    {isEditing && (
                      <div
                        className="absolute flex items-center justify-center rounded-[10px] bg-[#ff6666] px-[4px] py-[2px]"
                        style={{
                          left: `${((f.left + f.width / 2) / 402) * 100}%`,
                          top: `${((f.top + f.height + 4) / 302) * 100}%`,
                          transform: 'translateX(-50%)',
                          pointerEvents: 'none',
                        }}
                      >
                        <span className="text-[12px] leading-normal tracking-[-0.24px] text-white whitespace-nowrap">
                          Face {idx + 1}
                        </span>
                      </div>
                    )}
                    {/* Delete button — appears below selected frame */}
                    {isSelected && portraitMode === 'select' && (
                      <button
                        type="button"
                        aria-label="프레임 삭제"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFaceFrames((prev) => prev.filter((fr) => fr.id !== f.id))
                          setSelectedFrameId(null)
                        }}
                        className="absolute flex cursor-pointer items-center justify-center rounded-[100px] bg-white px-[4px] py-[2px]"
                        style={{
                          left: `${((f.left + f.width / 2) / 402) * 100}%`,
                          top: `${((f.top + f.height + 4) / 302) * 100}%`,
                          transform: 'translateX(-50%)',
                          pointerEvents: 'auto',
                        }}
                      >
                        <div className="relative size-[16px] overflow-hidden">
                          <div className="absolute" style={{ top: '11.46%', right: '13.72%', bottom: '11.46%', left: '13.73%' }}>
                            <div className="absolute" style={{ top: '-4.64%', right: '-4.92%', bottom: '-4.63%', left: '-4.92%' }}>
                              <img src="/icons/trash-mage.svg" alt="" className="block size-full max-w-none" aria-hidden="true" />
                            </div>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                )
              })}
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
          onSelect={(name) => setSelectedFilter((prev) => (prev === name ? null : name))}
          filterMap={FILTER_CSS}
        />
      )}

      {activeTab === 'color' && (
        <RulerSlider
          value={colorValue}
          label="따뜻함"
          onChange={setColorValue}
          onCommit={handleColorCommit}
          showValue
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
          {cropShape === 'circle' && (
            <RulerSlider
              value={cropAngle}
              label="수평 기울기"
              onChange={setCropAngle}
              onCommit={handleCropCommit}
              showValue
            />
          )}
          {cropShape === 'trap-v' && (
            <RulerSlider
              value={perspV}
              label="세로 원근 보정"
              onChange={setPerspV}
              showValue
            />
          )}
          {cropShape === 'trap-h' && (
            <RulerSlider
              value={perspH}
              label="가로 원근 보정"
              onChange={setPerspH}
              showValue
            />
          )}
        </div>
      )}

      {activeTab === 'auto' && (
        <div className="flex flex-col gap-2">
          <PresetThumbnails
            presets={AUTO_PRESETS}
            photoUrl={photoUrl}
            selected={selectedAuto}
            onSelect={setSelectedAuto}
          />
          <div className="px-[20px] pb-[10px]">
            <button
              type="button"
              onClick={() => handleRunAiEnhancement(selectedAuto ?? '')}
              disabled={isAiProcessing || !selectedAuto}
              className="flex h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-[#222226] text-[14px] font-medium text-white disabled:opacity-40"
            >
              {isAiProcessing ? 'AI 보정 진행 중...' : 'AI 보정 적용하기'}
            </button>
            {aiStatusLabel && (
              <p
                className={`mt-2 text-center text-[12px] tracking-[-0.24px] ${
                  aiError || aiStatus === 'FAILED'
                    ? 'text-[#e23a3a]'
                    : 'text-[#616369]'
                }`}
                role="status"
              >
                {aiStatusLabel}
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'element' && (
        <div
          className={
            isKeyboardOpen
              ? 'fixed left-1/2 z-20 flex w-full max-w-[402px] -translate-x-1/2 flex-col gap-[8px] bg-white px-[20px] py-[8px]'
              : 'flex flex-col gap-[8px] px-[20px] py-[10px]'
          }
          style={isKeyboardOpen ? { bottom: keyboardHeight } : undefined}
        >
          {/* AI 추천 보정 */}
          {aiSuggestions.length > 0 ? (
            <div className="flex flex-wrap items-center gap-[4px]">
              {aiSuggestions.map((s) => {
                const label = s.type || '추천 보정'
                const isActive = activeTags.includes(s.suggestedPrompt)
                return (
                  <button
                    key={`${s.type}-${s.suggestedPrompt}`}
                    type="button"
                    onClick={() => toggleTag(s.suggestedPrompt)}
                    className={`flex items-center gap-1 rounded-[16px] px-[12px] py-[8px] text-[12px] font-medium tracking-[-0.24px] transition-colors ${
                      isActive
                        ? 'bg-[#222226] text-white'
                        : 'bg-[#f4f6fa] text-[#222226]'
                    }`}
                  >
                    {s.iconUrl && (
                      <img
                        src={s.iconUrl}
                        alt=""
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    )}
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            analysis &&
            analysis.status === 'SUCCEEDED' && (
              <p className="text-[12px] tracking-[-0.24px] text-[#a2a5ad]">
                AI 추천 보정이 없어요. 직접 입력해보세요.
              </p>
            )
          )}
          {/* 입력 + AI 버튼 행 */}
          <div className="flex items-center gap-[4px]">
            <input
              type="text"
              value={elementInput}
              onChange={(e) => setElementInput(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="요소를 직접 입력해보세요"
              className="h-[38px] flex-1 rounded-[6px] bg-[#f4f6fa] px-[10px] text-[14px] tracking-[-0.28px] text-[#222226] placeholder:text-[#a2a5ad] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleRunAiEnhancement()}
              disabled={isAiProcessing || elementInput.trim().length === 0}
              aria-label="AI 보정 실행"
              data-testid="ai-enhancement-trigger"
              className="flex h-[38px] items-center justify-center rounded-[10px] bg-[#222226] px-[8px] disabled:opacity-40"
            >
              {isAiProcessing ? (
                <span
                  className="size-[18px] animate-spin rounded-full border-[2px] border-white border-t-transparent"
                  aria-hidden="true"
                />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2.4L14.28 9.12L21 11.4L14.28 13.68L12 20.4L9.72 13.68L3 11.4L9.72 9.12L12 2.4Z" fill="white" />
                  <path d="M19.2 16.8L20.16 19.44L22.8 20.4L20.16 21.36L19.2 24L18.24 21.36L15.6 20.4L18.24 19.44L19.2 16.8Z" fill="white" />
                </svg>
              )}
            </button>
          </div>
          {aiStatusLabel && (
            <p
              className={`text-[12px] tracking-[-0.24px] ${
                aiError || aiStatus === 'FAILED' ? 'text-[#e23a3a]' : 'text-[#616369]'
              }`}
              role="status"
              data-testid="ai-enhancement-status"
            >
              {aiStatusLabel}
            </p>
          )}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleOpenVersions}
              className="text-[12px] tracking-[-0.24px] text-[#616369] underline-offset-2 hover:underline"
            >
              이전 보정 보기
            </button>
          </div>
        </div>
      )}

      {activeTab === 'portrait' && portraitMode === 'select' && (
        <div className="flex w-full flex-col items-center px-[20px]">
          <div className="flex items-center justify-center py-[10px]">
            <p className="text-center text-[14px] tracking-[-0.28px] text-[#222226]">
              편집하고 싶은 얼굴 영역을 드래그하여 선택하세요
            </p>
          </div>
          <div className="flex w-[362px] items-center justify-center gap-[24px]">
            <div className="shrink-0 size-[52px] rounded-[100px]" />
            <div className="shrink-0 size-[52px] rounded-[100px]" />
            {/* + 버튼: 얼굴 인식 프레임 추가 */}
            <button
              type="button"
              onClick={handleAddFaceFrame}
              className="flex shrink-0 size-[52px] items-center justify-center rounded-[100px] bg-[#222226] border-[1.4px] border-[#a2a5ad] overflow-hidden"
              aria-label="얼굴 영역 추가"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="shrink-0 size-[52px] rounded-[100px]" />
            {/* > 버튼: 조정 모드로 진입 */}
            <button
              type="button"
              onClick={() => {
                const targetId = selectedFrameId ?? faceFrames[0]?.id ?? null
                if (targetId == null) return
                setEditingFrameId(targetId)
                setSelectedFrameId(null)
                setActiveAdjustTool('얼굴형 조정')
                setAdjustValue(frameAdjustments[targetId]?.['얼굴형 조정'] ?? 0)
                setPortraitMode('adjust')
              }}
              className="flex shrink-0 size-[52px] items-center justify-center rounded-[100px] bg-[#f4f6fa] overflow-hidden"
              aria-label="조정 시작"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 6L15 12L9 18" stroke="#222226" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'portrait' && portraitMode === 'adjust' && (
        <div className="flex w-full flex-col gap-[6px] px-[20px] py-[8px]">
          {/* 세그먼트 탭 */}
          <div className="flex items-center justify-center">
            <div className="flex items-center rounded-[12px] bg-[#f4f6fa] p-[4px]">
              {(['얼굴형 조정', '눈크기 조정', '코 조정'] as const).map((tool) => (
                <button
                  key={tool}
                  type="button"
                  onClick={() => {
                    setActiveAdjustTool(tool)
                    setAdjustValue(editingFrameId != null ? (frameAdjustments[editingFrameId]?.[tool] ?? 0) : 0)
                  }}
                  className={`w-[84px] rounded-[8px] px-[6px] py-[6px] text-[14px] tracking-[-0.28px] transition-colors ${
                    activeAdjustTool === tool
                      ? 'bg-[#d7dbe2] text-[#222226]'
                      : 'text-[#616369]'
                  }`}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>

          {/* < 뒤로 버튼 + 값 스케일 */}
          <div className="flex items-center gap-[10px]">
            {/* < 뒤로 버튼 */}
            <button
              type="button"
              onClick={() => {
                setPortraitMode('select')
                setEditingFrameId(null)
              }}
              className="flex shrink-0 size-[52px] items-center justify-center rounded-[100px] bg-[#f4f6fa]"
              aria-label="선택 모드로 돌아가기"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 6L9 12L15 18" stroke="#222226" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* 값 스케일: -5 ~ +5, 연결선 포함 */}
            <div className="flex flex-1 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center">
                {(ADJUST_TOOL_SCALES[activeAdjustTool] ?? [-4, -3, -2, -1, 0, 1, 2, 3, 4]).map((v, i) => (
                  <div key={v} className="flex items-center">
                    {i > 0 && (
                      <div className="h-px w-[16px] bg-[#d1d3d8] shrink-0" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setAdjustValue(v)
                        if (editingFrameId != null) {
                          setFrameAdjustments((prev) => ({
                            ...prev,
                            [editingFrameId]: { ...prev[editingFrameId], [activeAdjustTool]: v },
                          }))
                        }
                      }}
                      className={`flex shrink-0 size-[28px] items-center justify-center rounded-full text-[14px] tracking-[-0.28px] transition-colors ${
                        adjustValue === v
                          ? 'bg-[#222226] border border-[#a2a5ad] text-white'
                          : 'bg-[#f4f6fa] text-[#b7bdc6]'
                      }`}
                    >
                      {v > 0 ? `+${v}` : v}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'portrait' && (
        <div className="px-[20px] py-[10px]">
          <button
            type="button"
            onClick={() => {
              const parts: string[] = []
              faceFrames.forEach((f, idx) => {
                const adj = frameAdjustments[f.id]
                if (!adj) return
                const entries = Object.entries(adj).filter(([, v]) => v !== 0)
                if (entries.length === 0) return
                const summary = entries
                  .map(([tool, v]) => `${tool} ${v > 0 ? '+' : ''}${v}`)
                  .join(', ')
                parts.push(`얼굴 ${idx + 1}: ${summary}`)
              })
              const prompt =
                parts.length > 0
                  ? `인물 보정 — ${parts.join(' / ')}`
                  : '인물 보정 — 자연스러운 얼굴 보정'
              void handleRunAiEnhancement(prompt)
            }}
            disabled={isAiProcessing}
            className="flex h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-[#222226] text-[14px] font-medium text-white disabled:opacity-40"
          >
            {isAiProcessing ? 'AI 보정 진행 중...' : 'AI 보정 적용하기'}
          </button>
          {aiStatusLabel && (
            <p
              className={`mt-2 text-center text-[12px] tracking-[-0.24px] ${
                aiError || aiStatus === 'FAILED'
                  ? 'text-[#e23a3a]'
                  : 'text-[#616369]'
              }`}
              role="status"
            >
              {aiStatusLabel}
            </p>
          )}
        </div>
      )}

      {isVersionsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-versions-title"
          className="fixed inset-0 z-30 mx-auto flex w-full max-w-[402px] items-end justify-center"
        >
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setIsVersionsOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative flex max-h-[60vh] w-full flex-col gap-3 rounded-t-[18px] bg-white px-5 pb-6 pt-5">
            <h2
              id="photo-versions-title"
              className="text-[18px] font-bold leading-normal tracking-[-0.36px] text-[#222226]"
            >
              이전 보정 버전
            </h2>
            {versionsLoading && (
              <p className="text-[12px] tracking-[-0.24px] text-[#a2a5ad]">
                버전을 불러오는 중...
              </p>
            )}
            {versionsError && (
              <p className="text-[12px] tracking-[-0.24px] text-[#e23a3a]">
                {versionsError}
              </p>
            )}
            {versions && versions.length === 0 && (
              <p className="text-[12px] tracking-[-0.24px] text-[#a2a5ad]">
                보정 버전이 아직 없어요
              </p>
            )}
            <ul className="flex max-h-[44vh] flex-col gap-2 overflow-y-auto">
              {versions?.map((version) => (
                <li key={version.versionId}>
                  <button
                    type="button"
                    onClick={() => handleSelectVersion(version)}
                    disabled={!version.url}
                    className="flex w-full items-center gap-3 rounded-2xl bg-[#f4f6fa] p-3 text-left transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="size-[56px] shrink-0 overflow-hidden rounded-[10px] bg-white">
                      {version.url ? (
                        <img
                          src={version.url}
                          alt=""
                          className="size-full object-cover"
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="text-[13px] font-medium tracking-[-0.26px] text-[#222226]">
                        {version.isOriginal ? '원본' : (version.prompt ?? '보정본')}
                      </p>
                      <p className="text-[11px] tracking-[-0.22px] text-[#616369]">
                        {new Date(version.createdAt).toLocaleString('ko-KR')}
                      </p>
                      {!version.url && (
                        <p className="text-[11px] tracking-[-0.22px] text-[#e23a3a]">
                          미리보기를 불러올 수 없어요
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
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
              보정을 저장할까요?
            </h2>
            <p className="text-center text-[14px] leading-[1.5] text-[#616369]">
              저장하면 현재 보정 설정이 사진에 적용돼요.
              <br />
              저장하지 않으면 변경사항이 사라져요.
            </p>
            <div className="flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmSave}
                className="flex h-11 w-full items-center justify-center rounded-[16px] bg-[#222226] text-[16px] font-medium text-white"
              >
                저장하기
              </button>
              <button
                type="button"
                onClick={handleDiscardAndExit}
                className="flex h-11 w-full items-center justify-center rounded-[16px] bg-[#f4f6fa] text-[16px] font-medium text-[#e23a3a]"
              >
                저장하지 않고 나가기
              </button>
              <button
                type="button"
                onClick={handleCancelModal}
                className="flex h-11 w-full items-center justify-center text-[14px] font-medium text-[#616369]"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {isSaveCompleteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-edit-save-complete-title"
          className="fixed inset-0 z-30 mx-auto flex w-full max-w-[402px] items-center justify-center px-[20px]"
        >
          <button
            type="button"
            aria-label="닫기"
            onClick={handleSaveCompleteBack}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative flex w-full flex-col items-center gap-5 rounded-[18px] bg-white px-[16px] py-[20px]">
            <h2
              id="photo-edit-save-complete-title"
              className="text-center text-[20px] font-bold leading-normal text-[#222226]"
            >
              보정이 저장되었어요
            </h2>
            <p className="text-center text-[14px] leading-[1.5] text-[#616369]">
              계속해서 사진을 확인하거나 홈으로 이동해보세요.
            </p>
            <div className="flex w-full items-center gap-4">
              <button
                type="button"
                onClick={handleSaveCompleteHome}
                className="flex h-11 flex-1 items-center justify-center rounded-[16px] bg-[#f4f6fa] text-[16px] font-medium text-[#222226]"
              >
                홈으로 가기
              </button>
              <button
                type="button"
                onClick={handleSaveCompleteBack}
                className="flex h-11 flex-1 items-center justify-center rounded-[16px] bg-[#222226] text-[16px] font-medium text-white"
              >
                사진 보기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save options / bottom toolbar — hidden while keyboard is open */}
      {!isKeyboardOpen && isSaveOptionsOpen ? (
        <div className="fixed bottom-[22px] left-1/2 -translate-x-1/2 flex w-[calc(100%-40px)] max-w-[362px] flex-col gap-[8px]">
          {saveError && (
            <p
              role="alert"
              className="rounded-[12px] bg-[#fdecec] px-3 py-2 text-center text-[13px] font-medium text-[#e23a3a]"
            >
              {saveError}
            </p>
          )}
          <button
            type="button"
            onClick={handleSaveAsNew}
            disabled={isSaving}
            aria-busy={isSaving}
            className="flex h-[60px] w-full items-center justify-center rounded-[16px] bg-[#222226] text-[18px] font-semibold tracking-[-0.36px] text-white disabled:opacity-60"
          >
            {isSaving ? '저장 중...' : '새로운 사진으로 저장'}
          </button>
          <button
            type="button"
            onClick={handleSaveAsExisting}
            disabled={isSaving}
            aria-busy={isSaving}
            className="flex h-[60px] w-full items-center justify-center rounded-[16px] bg-[#f4f6fa] text-[18px] font-semibold tracking-[-0.36px] text-[#222226] disabled:opacity-60"
          >
            {isSaving ? '저장 중...' : '기존 사진으로 저장'}
          </button>
        </div>
      ) : !isKeyboardOpen ? (
        /* Bottom toolbar — fixed pill */
        <nav
          aria-label="보정 탭"
          className="fixed bottom-[22px] left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[362px]"
        >
          <div className="flex items-center gap-[18px] rounded-[100px] bg-[#222226] p-[10px]">
            {visibleTabs.map((tab) => {
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
      ) : null}
    </main>
  )
}
