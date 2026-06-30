import { initializeApp } from 'firebase/app'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { apiEndpoints } from '../repositories/apiEndpoints'
import { mediaRepository } from '../repositories/mediaRepository'
import { httpClient } from './httpClient'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let firebaseApp = null
let storage = null
let auth = null

function assertFirebaseConfigured() {
  const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ]

  const missing = requiredKeys.filter((key) => !firebaseConfig[key])
  if (missing.length > 0) {
    throw new Error(
      `Firebase is not configured. Missing: ${missing.join(', ')}. Add VITE_FIREBASE_* variables to your web .env file.`,
    )
  }
}

function getFirebaseApp() {
  assertFirebaseConfigured()
  firebaseApp = firebaseApp || initializeApp(firebaseConfig)
  return firebaseApp
}

function getStorageClient() {
  if (storage) {
    return storage
  }

  storage = getStorage(getFirebaseApp())
  return storage
}

function getAuthClient() {
  if (auth) {
    return auth
  }

  auth = getAuth(getFirebaseApp())
  return auth
}

async function ensureFirebaseUser(backendToken) {
  const authClient = getAuthClient()

  if (authClient.currentUser) {
    return authClient.currentUser
  }

  if (!backendToken) {
    throw new Error('You must be signed in to upload a profile photo.')
  }

  const response = await httpClient.post(
    apiEndpoints.auth.firebaseToken,
    undefined,
    { token: backendToken },
  )

  const firebaseToken = response?.firebase_token
  if (!firebaseToken) {
    throw new Error('Could not obtain a Firebase token from the server.')
  }

  const credential = await signInWithCustomToken(authClient, firebaseToken)
  return credential.user
}

function sanitizeName(name) {
  return String(name || 'image')
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .slice(0, 120)
}

function toMediaType(file, explicitType) {
  if (explicitType) {
    return explicitType
  }

  const mimeType = String(file?.type || '').toLowerCase()
  if (mimeType.startsWith('image/')) {
    return 'image'
  }

  if (mimeType.startsWith('video/')) {
    return 'video'
  }

  if (mimeType.startsWith('audio/')) {
    return 'audio'
  }

  return 'file'
}

function runUploadTask(task, { signal, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const unsubscribe = task.on(
      'state_changed',
      (snapshot) => {
        if (!onProgress || !snapshot.totalBytes) {
          return
        }

        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        onProgress(progress)
      },
      (error) => {
        unsubscribe()
        reject(error)
      },
      () => {
        unsubscribe()
        resolve(task.snapshot)
      },
    )

    if (signal) {
      const cancelTask = () => task.cancel()
      signal.addEventListener('abort', cancelTask, { once: true })
    }
  })
}

export async function uploadMedia(file, options = {}) {
  if (!file) {
    throw new Error('Please choose a file to upload.')
  }

  if (!options.backendToken) {
    throw new Error('You must be signed in to upload files.')
  }

  const storageClient = getStorageClient()
  const mediaType = toMediaType(file, options.mediaType)

  const reserved = await mediaRepository.reserve(options.backendToken, {
    media_type: mediaType,
    mime_type: file.type || 'application/octet-stream',
    file_size_bytes: file.size,
    original_name: sanitizeName(file.name),
  })

  const mediaId = reserved?.media_id
  const path = reserved?.storage_path
  if (!mediaId || !path) {
    throw new Error('Could not reserve a media slot from the server.')
  }

  await ensureFirebaseUser(options.backendToken)
  const fileRef = ref(storageClient, path)
  const uploadTask = uploadBytesResumable(fileRef, file, {
    contentType: file.type || 'application/octet-stream',
    cacheControl: options.cacheControl || 'public, max-age=3600',
  })

  try {
    await runUploadTask(uploadTask, {
      signal: options.signal,
      onProgress: options.onProgress,
    })
  } catch (uploadError) {
    // Keep DB and storage in sync if upload was cancelled/failed after reservation.
    await mediaRepository.remove(options.backendToken, mediaId).catch(() => {})
    throw uploadError
  }

  const downloadUrl = await getDownloadURL(fileRef)

  await mediaRepository.markReady(options.backendToken, mediaId, {
    download_url: downloadUrl,
    width: options.width,
    height: options.height,
    duration_seconds: options.durationSeconds,
  })

  if (options.parentType && options.parentId) {
    await mediaRepository.attach(options.backendToken, mediaId, {
      parent_type: options.parentType,
      parent_id: options.parentId,
      position: Number.isFinite(options.position) ? options.position : 0,
    })
  }

  return {
    mediaId,
    storagePath: path,
    mediaType,
    downloadUrl,
  }
}

export async function uploadProfileAvatar(file, options = {}) {
  const result = await uploadMedia(file, {
    ...options,
    mediaType: 'image',
  })

  return result.downloadUrl
}
