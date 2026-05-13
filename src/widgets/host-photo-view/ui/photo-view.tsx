import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { getPhotoDetail } from '@/shared/api/photo'

const MIN_SCALE = 1
const MAX_SCALE = 6

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function PhotoView() {
  const navigate = useNavigate()
  const location = useLocation()
  const { photoId } = useParams<{ photoId: string }>()

  const stateUrl = (location.state as { photoUrl?: string } | null)?.photoUrl
  const [src, setSrc] = useState<string | null>(stateUrl ?? null)
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    if (stateUrl || !photoId) return
    let cancelled = false
    getPhotoDetail(photoId)
      .then((detail) => {
        if (cancelled) return
        setSrc(detail.url ?? detail.thumbnailUrl ?? null)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [stateUrl, photoId])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  const [isInteracting, setIsInteracting] = useState(false)
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map())
  const pinchStateRef = useRef<{
    initialDist: number
    initialScale: number
    centerX: number
    centerY: number
    initialTx: number
    initialTy: number
  } | null>(null)
  const lastTapRef = useRef<{ t: number; x: number; y: number } | null>(null)

  const resetTransform = () => {
    setScale(1)
    setTx(0)
    setTy(0)
  }

  const handleBack = () => navigate(-1)

  const applyZoomAround = (
    nextScale: number,
    focalClientX: number,
    focalClientY: number,
  ) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) {
      setScale(clamp(nextScale, MIN_SCALE, MAX_SCALE))
      return
    }
    const clamped = clamp(nextScale, MIN_SCALE, MAX_SCALE)
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const ratio = clamped / scale
    const nextTx = focalClientX - cx - (focalClientX - cx - tx) * ratio
    const nextTy = focalClientY - cy - (focalClientY - cy - ty) * ratio
    setScale(clamped)
    if (clamped === 1) {
      setTx(0)
      setTy(0)
    } else {
      setTx(nextTx)
      setTy(nextTy)
    }
  }

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    const factor = event.deltaY < 0 ? 1.15 : 1 / 1.15
    applyZoomAround(scale * factor, event.clientX, event.clientY)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })
    setIsInteracting(true)
    if (pointersRef.current.size === 2) {
      const [a, b] = Array.from(pointersRef.current.values())
      const dx = b.x - a.x
      const dy = b.y - a.y
      pinchStateRef.current = {
        initialDist: Math.hypot(dx, dy) || 1,
        initialScale: scale,
        centerX: (a.x + b.x) / 2,
        centerY: (a.y + b.y) / 2,
        initialTx: tx,
        initialTy: ty,
      }
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const prev = pointersRef.current.get(event.pointerId)
    if (!prev) return
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })

    if (pointersRef.current.size === 2 && pinchStateRef.current) {
      const [a, b] = Array.from(pointersRef.current.values())
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.hypot(dx, dy) || 1
      const pinch = pinchStateRef.current
      const nextScale = clamp(
        pinch.initialScale * (dist / pinch.initialDist),
        MIN_SCALE,
        MAX_SCALE,
      )
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const ratio = nextScale / pinch.initialScale
        const nextTx =
          pinch.centerX - cx - (pinch.centerX - cx - pinch.initialTx) * ratio
        const nextTy =
          pinch.centerY - cy - (pinch.centerY - cy - pinch.initialTy) * ratio
        setScale(nextScale)
        if (nextScale === 1) {
          setTx(0)
          setTy(0)
        } else {
          setTx(nextTx)
          setTy(nextTy)
        }
      } else {
        setScale(nextScale)
      }
      return
    }

    if (pointersRef.current.size === 1 && scale > 1) {
      const dx = event.clientX - prev.x
      const dy = event.clientY - prev.y
      setTx((v) => v + dx)
      setTy((v) => v + dy)
    }
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId)
    if (pointersRef.current.size < 2) {
      pinchStateRef.current = null
    }
    if (pointersRef.current.size === 0) {
      setIsInteracting(false)
    }

    if (event.pointerType === 'touch' && pointersRef.current.size === 0) {
      const now = Date.now()
      const last = lastTapRef.current
      if (
        last &&
        now - last.t < 300 &&
        Math.hypot(event.clientX - last.x, event.clientY - last.y) < 24
      ) {
        if (scale > 1) {
          resetTransform()
        } else {
          applyZoomAround(2, event.clientX, event.clientY)
        }
        lastTapRef.current = null
      } else {
        lastTapRef.current = { t: now, x: event.clientX, y: event.clientY }
      }
    }
  }

  const handleDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (scale > 1) {
      resetTransform()
    } else {
      applyZoomAround(2, event.clientX, event.clientY)
    }
  }

  return (
    <main className="fixed inset-0 z-50 flex flex-col bg-black">
      <header className="relative z-10 flex h-[60px] items-center px-5">
        <button
          type="button"
          onClick={handleBack}
          aria-label="닫기"
          className="flex h-10 w-10 items-center justify-center text-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </button>
      </header>

      <div
        ref={containerRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        className="relative flex flex-1 items-center justify-center touch-none select-none overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        {!imgLoaded && (
          <div
            aria-hidden="true"
            className="shimmer h-[60%] w-[80%] rounded-md opacity-30"
          />
        )}
        {src && (
          <img
            src={src}
            alt=""
            draggable={false}
            onLoad={() => setImgLoaded(true)}
            style={{
              transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isInteracting ? 'none' : 'transform 0.1s ease-out',
            }}
            className={`absolute max-h-full max-w-full will-change-transform ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />
        )}
      </div>
    </main>
  )
}
