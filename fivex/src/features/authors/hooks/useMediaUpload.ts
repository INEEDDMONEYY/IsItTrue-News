import { useMutation } from '@tanstack/react-query'
import { mediaApi } from '../api/media.api'
import type { ImagePreset } from '@/lib/compressImage'

/**
 * Wraps the media upload endpoint in a mutation so components get
 * isPending/error state for free without needing a shared cache entry.
 */
export function useMediaUpload({
  profilePhoto = false,
  imagePreset,
}: { profilePhoto?: boolean; imagePreset?: ImagePreset } = {}) {
  const mutation = useMutation({
    // Profile images go through the open, image-only endpoint so any signed-in role can use them.
    mutationFn: (file: File) =>
      profilePhoto || imagePreset
        ? mediaApi.uploadProfilePhoto(file, imagePreset ?? 'avatar')
        : mediaApi.upload(file),
  })

  return {
    upload: mutation.mutateAsync,
    isUploading: mutation.isPending,
  }
}
