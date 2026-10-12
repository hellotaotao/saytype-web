import { useState, type MouseEvent } from 'react'
import { getFallbackDownloadUrl, releasePageUrl, resolveLatestDownloadUrl, type DownloadPlatform } from './downloads'

// Link props that start the newest installer for a platform. The href is the
// release page, so the link still works without JavaScript or with a modifier key.
export function useDownload(platform: DownloadPlatform | null) {
  const [isResolving, setIsResolving] = useState(false)
  const href = platform ? getFallbackDownloadUrl(platform) : releasePageUrl

  const onClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      !platform ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    if (isResolving) {
      return
    }

    setIsResolving(true)
    const downloadUrl = await resolveLatestDownloadUrl(platform)
    window.location.assign(downloadUrl)
  }

  return { href, onClick, isResolving }
}
