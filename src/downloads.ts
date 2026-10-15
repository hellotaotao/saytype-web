export type DownloadPlatform = 'macos' | 'windows' | 'linux'

export interface ReleaseAsset {
  name: string
  browser_download_url: string
}

interface ReleaseResponse {
  ok: boolean
  json: () => Promise<unknown>
}

type FetchRelease = (url: string) => Promise<ReleaseResponse>

export const latestReleaseApiUrl =
  'https://api.github.com/repos/hellotaotao/typealoud/releases/latest'
export const releasePageUrl = 'https://github.com/hellotaotao/typealoud/releases/latest'
export const sourceRepoUrl = 'https://github.com/hellotaotao/typealoud'

// The mainland-China mirror: TypeAloud's release workflow copies each release's
// macOS and Windows installers into this site's /download path, because GitHub
// is slow or unreachable from mainland China. The index names the current files.
export const mirrorIndexUrl = '/download/releases/current.json'
const mirrorBaseUrl = '/download/'

const fallbackDownloadUrls: Record<DownloadPlatform, string> = {
  macos: releasePageUrl,
  windows: releasePageUrl,
  linux: releasePageUrl,
}

const assetMatchers: Record<DownloadPlatform, RegExp[]> = {
  macos: [/universal\.dmg$/i, /\.dmg$/i],
  windows: [/x64-setup\.exe$/i, /\.exe$/i, /\.msi$/i],
  linux: [/amd64\.AppImage$/i, /\.AppImage$/i, /amd64\.deb$/i, /\.deb$/i],
}

export function detectDownloadPlatform(
  platform: string,
  userAgent: string,
): DownloadPlatform | null {
  const normalizedPlatform = platform.toLowerCase()
  const normalizedUserAgent = userAgent.toLowerCase()

  if (/iphone|ipad|ipod|android|mobile/.test(`${normalizedPlatform} ${normalizedUserAgent}`)) {
    return null
  }

  if (normalizedPlatform.includes('mac') || normalizedUserAgent.includes('macintosh')) {
    return 'macos'
  }

  if (/arm64|aarch64|armv\d/.test(`${normalizedPlatform} ${normalizedUserAgent}`)) {
    return null
  }

  if (normalizedPlatform.includes('win') || normalizedUserAgent.includes('windows')) {
    return 'windows'
  }

  if (normalizedPlatform.includes('linux') || normalizedUserAgent.includes('linux')) {
    return 'linux'
  }

  return null
}

export function selectReleaseAsset(
  platform: DownloadPlatform,
  assets: ReleaseAsset[],
): ReleaseAsset | undefined {
  for (const matcher of assetMatchers[platform]) {
    const asset = assets.find(
      (candidate) => !candidate.name.endsWith('.sig') && matcher.test(candidate.name),
    )

    if (asset) {
      return asset
    }
  }

  return undefined
}

export function getFallbackDownloadUrl(platform: DownloadPlatform): string {
  return fallbackDownloadUrls[platform]
}

function isReleaseAsset(value: unknown): value is ReleaseAsset {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const asset = value as Record<string, unknown>
  return typeof asset.name === 'string' && typeof asset.browser_download_url === 'string'
}

// Mainland China time zones, including the legacy aliases some systems still
// report. The app orders its own download sources by the same list.
export function isMainlandChinaTimeZone(timeZone: string | undefined): boolean {
  return ['Asia/Shanghai', 'Asia/Chongqing', 'Asia/Chungking', 'Asia/Harbin', 'Asia/Urumqi', 'Asia/Kashgar', 'PRC'].includes(
    timeZone ?? '',
  )
}

function currentTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return undefined
  }
}

async function fetchJson(url: string, fetchRelease: FetchRelease): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetchRelease(url)
    if (!response.ok) {
      return null
    }

    const body = await response.json()
    return typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : null
  } catch {
    return null
  }
}

async function resolveGitHubDownloadUrl(platform: DownloadPlatform, fetchRelease: FetchRelease): Promise<string | null> {
  const assets = (await fetchJson(latestReleaseApiUrl, fetchRelease))?.assets
  if (!Array.isArray(assets)) {
    return null
  }

  return selectReleaseAsset(platform, assets.filter(isReleaseAsset))?.browser_download_url ?? null
}

async function resolveMirrorDownloadUrl(platform: DownloadPlatform, fetchRelease: FetchRelease): Promise<string | null> {
  const paths = (await fetchJson(mirrorIndexUrl, fetchRelease))?.paths
  if (!Array.isArray(paths)) {
    return null
  }

  const assets = paths
    .filter((path): path is string => typeof path === 'string' && path.startsWith('releases/'))
    .map((path) => ({ name: path.slice(path.lastIndexOf('/') + 1), browser_download_url: mirrorBaseUrl + path }))
  return selectReleaseAsset(platform, assets)?.browser_download_url ?? null
}

// Visitors in a mainland China time zone get the mirror first and GitHub
// second; everyone else the reverse. The release page is the last resort.
export async function resolveLatestDownloadUrl(
  platform: DownloadPlatform,
  fetchRelease: FetchRelease = (url) => fetch(url),
  timeZone: string | undefined = currentTimeZone(),
): Promise<string> {
  const sources = [resolveGitHubDownloadUrl, resolveMirrorDownloadUrl]
  if (isMainlandChinaTimeZone(timeZone)) {
    sources.reverse()
  }

  for (const resolve of sources) {
    const url = await resolve(platform, fetchRelease)
    if (url) {
      return url
    }
  }

  return getFallbackDownloadUrl(platform)
}
