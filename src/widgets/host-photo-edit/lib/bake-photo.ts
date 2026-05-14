export type BakeOptions = {
  photoUrl: string
  cssFilter?: string
  mimeType?: string
  quality?: number
  fileName?: string
}

export type BakeResult = {
  file: File
  width: number
  height: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('사진을 불러오지 못했어요'))
    img.src = src
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('보정된 이미지를 만들지 못했어요'))
          return
        }
        resolve(blob)
      },
      type,
      quality,
    )
  })
}

export async function bakeEditedPhoto(opts: BakeOptions): Promise<BakeResult> {
  const img = await loadImage(opts.photoUrl)
  const width = img.naturalWidth || img.width
  const height = img.naturalHeight || img.height
  if (!width || !height) {
    throw new Error('이미지 크기를 확인할 수 없어요')
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas를 사용할 수 없어요')
  }

  if (opts.cssFilter) {
    ctx.filter = opts.cssFilter
  }
  ctx.drawImage(img, 0, 0, width, height)
  ctx.filter = 'none'

  const mimeType = opts.mimeType ?? 'image/jpeg'
  const quality = opts.quality ?? 0.92
  const blob = await canvasToBlob(canvas, mimeType, quality)
  const ext = mimeType === 'image/png' ? 'png' : 'jpg'
  const name = opts.fileName ?? `edited-${Date.now()}.${ext}`
  const file = new File([blob], name, { type: mimeType })
  return { file, width, height }
}
