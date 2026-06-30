import { useCallback, useRef, useState } from 'react'
import { uploadMedia } from '../../../services/firebaseStorage'

export function useMediaUpload(backendToken) {
  const controllerRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const reset = useCallback(() => {
    setProgress(0)
    setError('')
  }, [])

  const cancel = useCallback(() => {
    controllerRef.current?.abort()
  }, [])

  const upload = useCallback(
    async (file, options = {}) => {
      if (!backendToken) {
        throw new Error('You must be signed in to upload files.')
      }

      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller

      setError('')
      setProgress(0)
      setIsUploading(true)

      try {
        const result = await uploadMedia(file, {
          ...options,
          backendToken,
          signal: controller.signal,
          onProgress: (nextProgress) => {
            setProgress(nextProgress)
          },
        })

        setProgress(100)
        return result
      } catch (uploadError) {
        const message = uploadError instanceof Error ? uploadError.message : 'Upload failed.'
        setError(message)
        throw uploadError
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null
        }
        setIsUploading(false)
      }
    },
    [backendToken],
  )

  return {
    upload,
    cancel,
    reset,
    progress,
    isUploading,
    error,
  }
}
