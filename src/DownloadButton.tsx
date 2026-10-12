import { useEffect, useState } from 'react'
import { homeCopy, type HomeCopyKey } from './content/homeCopy'
import type { Locale } from './i18n'
import './DownloadButton.css'
import { detectDownloadPlatform, type DownloadPlatform } from './downloads'
import { useDownload } from './useDownload'

const downloadPlatforms = {
  macos: { label: 'Download for Mac', name: 'Mac' },
  windows: { label: 'Download for Windows', name: 'Windows' },
  linux: { label: 'Download for Linux', name: 'Linux' },
} as const

function getCurrentDownloadPlatform(): DownloadPlatform | null {
  if (typeof navigator === 'undefined') {
    return 'macos'
  }

  const navigatorWithUserAgentData = navigator as Navigator & {
    userAgentData?: { platform?: string }
  }
  const platform = navigatorWithUserAgentData.userAgentData?.platform ?? navigator.platform

  return detectDownloadPlatform(platform, navigator.userAgent)
}

export default function DownloadButton({ locale, label: customLabel }: { locale: Locale; label?: HomeCopyKey }) {
  const t = homeCopy(locale)
  const [platform, setPlatform] = useState<DownloadPlatform | null>('macos')
  useEffect(() => { setPlatform(getCurrentDownloadPlatform()) }, [])
  const { href, onClick, isResolving } = useDownload(platform)
  const platformDetails = platform ? downloadPlatforms[platform] : null
  const label = t(customLabel ?? platformDetails?.label ?? 'View downloads')

  return (
    <a
      className="download-button"
      href={href}
      aria-label={
        [customLabel ? t(customLabel) : null, t(platformDetails ? `Download TypeAloud for ${platformDetails.name}` : 'View TypeAloud downloads')].filter(Boolean).join(' — ')
      }
      aria-busy={isResolving || undefined}
      onClick={onClick}
    >
      {platform === 'macos' ? (
        <img src="/apple-logo.png" alt="" width="26" height="27" />
      ) : (
        <svg className="download-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14" />
        </svg>
      )}
      <span>{isResolving ? t('Preparing download…') : label}</span>
    </a>
  )
}

