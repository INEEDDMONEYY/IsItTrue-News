export type ImagePreset = 'avatar' | 'banner'

const PRESETS: Record<ImagePreset, { width: number; height: number; crop: boolean }> = {
  // Shown in a circle, so just cap the size.
  avatar: { width: 800, height: 800, crop: false },
  // Profile headers render roughly 4:1, so cover-crop to that ratio.
  banner: { width: 1600, height: 400, crop: true },
}

function encode(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/**
 * Downscales (and for banners, center-crops) an image in the browser before
 * upload. Falls back to the original file whenever it can't improve on it.
 */
export async function compressImage(file: File, preset: ImagePreset): Promise<File> {
  // A canvas redraw would flatten animated GIFs and rasterize SVGs.
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file

  const { width: maxWidth, height: maxHeight, crop } = PRESETS[preset]

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return file
  }

  let sx = 0
  let sy = 0
  let sw = bitmap.width
  let sh = bitmap.height

  if (crop) {
    const targetRatio = maxWidth / maxHeight
    if (sw / sh > targetRatio) {
      const croppedWidth = sh * targetRatio
      sx = (sw - croppedWidth) / 2
      sw = croppedWidth
    } else {
      const croppedHeight = sw / targetRatio
      sy = (sh - croppedHeight) / 2
      sh = croppedHeight
    }
  }

  const scale = Math.min(1, maxWidth / sw, maxHeight / sh)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(sw * scale))
  canvas.height = Math.max(1, Math.round(sh * scale))

  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    return file
  }
  context.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  // Safari can't encode WebP and silently returns PNG, so fall back to JPEG.
  let blob = await encode(canvas, 'image/webp', 0.85)
  if (!blob || blob.type !== 'image/webp') {
    blob = await encode(canvas, 'image/jpeg', 0.85)
  }
  if (!blob) return file

  const unchanged = !crop && scale === 1 && blob.size >= file.size
  if (unchanged) return file

  const extension = blob.type === 'image/webp' ? 'webp' : 'jpg'
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'
  return new File([blob], `${baseName}.${extension}`, { type: blob.type })
}
