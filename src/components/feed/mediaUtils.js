export function mediaUrl(media) {
  return media?.download_url || media?.downloadUrl || media?.storage_path || ''
}

export function isVideo(media) {
  return media?.media_type === 'video' || String(media?.mime_type || '').startsWith('video/')
}

export function isAudio(media) {
  return media?.media_type === 'audio' || String(media?.mime_type || '').startsWith('audio/')
}
