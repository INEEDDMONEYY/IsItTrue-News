import { useMutation } from '@tanstack/react-query'
import { mediaApi } from '../api/media.api'

/**
 * Wraps the media upload endpoint in a mutation so components get
 * isPending/error state for free without needing a shared cache entry.
 */
export function useMediaUpload() {
  const mutation = useMutation({
    mutationFn: (file: File) => mediaApi.upload(file),
  })

  return {
    upload: mutation.mutateAsync,
    isUploading: mutation.isPending,
  }
}
