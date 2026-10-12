import { describe, expect, it } from 'vitest'
import {
  detectDownloadPlatform,
  getFallbackDownloadUrl,
  isMainlandChinaTimeZone,
  latestReleaseApiUrl,
  mirrorIndexUrl,
  releasePageUrl,
  resolveLatestDownloadUrl,
  selectReleaseAsset,
} from './downloads'

const releaseAssets = [
  {
    name: 'SayType_1.8.5_universal.dmg.sig',
    browser_download_url: 'https://example.com/macos-signature',
  },
  {
    name: 'SayType_1.8.5_universal.dmg',
    browser_download_url: 'https://example.com/macos',
  },
  {
    name: 'SayType_1.8.5_x64_en-US.msi',
    browser_download_url: 'https://example.com/windows-msi',
  },
  {
    name: 'SayType_1.8.5_x64-setup.exe',
    browser_download_url: 'https://example.com/windows',
  },
  {
    name: 'SayType_1.8.5_amd64.AppImage.sig',
    browser_download_url: 'https://example.com/linux-signature',
  },
  {
    name: 'SayType_1.8.5_amd64.AppImage',
    browser_download_url: 'https://example.com/linux',
  },
]

describe('download platform detection', () => {
  it('detects supported desktop operating systems', () => {
    expect(detectDownloadPlatform('MacIntel', 'Mozilla/5.0 (Macintosh)')).toBe('macos')
    expect(detectDownloadPlatform('Win32', 'Mozilla/5.0 (Windows NT 10.0)')).toBe(
      'windows',
    )
    expect(detectDownloadPlatform('Linux x86_64', 'Mozilla/5.0 (X11; Linux x86_64)')).toBe(
      'linux',
    )
  })

  it('does not send mobile devices a desktop installer', () => {
    expect(detectDownloadPlatform('iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS)')).toBeNull()
    expect(
      detectDownloadPlatform(
        'MacIntel',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Mobile/15E148',
      ),
    ).toBeNull()
    expect(detectDownloadPlatform('Linux armv8l', 'Mozilla/5.0 (Linux; Android 15)')).toBeNull()
  })

  it('does not select an x64 installer for unsupported ARM desktops', () => {
    expect(
      detectDownloadPlatform('Linux aarch64', 'Mozilla/5.0 (X11; Linux aarch64)'),
    ).toBeNull()
    expect(detectDownloadPlatform('Win32', 'Mozilla/5.0 (Windows NT 10.0; ARM64)')).toBeNull()
  })
})

describe('release asset selection', () => {
  it.each([
    ['macos', 'https://example.com/macos'],
    ['windows', 'https://example.com/windows'],
    ['linux', 'https://example.com/linux'],
  ] as const)('selects the preferred %s installer', (platform, expectedUrl) => {
    expect(selectReleaseAsset(platform, releaseAssets)?.browser_download_url).toBe(expectedUrl)
  })

  it.each(['macos', 'windows', 'linux'] as const)('uses the latest release page for %s fallback', (platform) => {
    expect(getFallbackDownloadUrl(platform)).toBe(releasePageUrl)
  })

  it.each([null, {}, { assets: [] }, { assets: [null, { name: 4 }] }])('handles malformed or missing assets', async (release) => {
    await expect(resolveLatestDownloadUrl('macos', async () => ({ ok: true, json: async () => release }))).resolves.toBe(releasePageUrl)
  })

  it('handles a rejected release response', async () => {
    await expect(resolveLatestDownloadUrl('macos', async () => ({ ok: false, json: async () => ({}) }))).resolves.toBe(releasePageUrl)
  })

  it('resolves the latest installer from GitHub release metadata', async () => {
    const fetchRelease = async (url: string) => {
      expect(url).toBe(latestReleaseApiUrl)

      return {
        ok: true,
        json: async () => ({ assets: releaseAssets }),
      }
    }

    await expect(resolveLatestDownloadUrl('windows', fetchRelease)).resolves.toBe(
      'https://example.com/windows',
    )
  })

  it('falls back to the latest release page when release metadata is unavailable', async () => {
    const fetchRelease = async () => {
      throw new Error('offline')
    }

    await expect(resolveLatestDownloadUrl('macos', fetchRelease)).resolves.toBe(
      getFallbackDownloadUrl('macos'),
    )
  })
})

describe('mainland China mirror', () => {
  const mirrorIndex = {
    tag: 'v1.19.2',
    paths: [
      'releases/v1.19.2/SayType_1.19.2_universal.dmg',
      'releases/v1.19.2/SayType_1.19.2_x64-setup.exe',
      'releases/v1.19.2/SayType_1.19.2_x64_en-US.msi',
      'releases/v1.19.2/SayType_universal.app.tar.gz',
    ],
  }
  const serve = (calls: string[], mirror: unknown, github: unknown) => async (url: string) => {
    calls.push(url)
    const body = url === mirrorIndexUrl ? mirror : github
    return { ok: body !== undefined, json: async () => body }
  }

  it('recognises mainland time zones only', () => {
    for (const timeZone of ['Asia/Shanghai', 'Asia/Urumqi', 'PRC']) {
      expect(isMainlandChinaTimeZone(timeZone)).toBe(true)
    }
    for (const timeZone of ['Asia/Hong_Kong', 'Asia/Taipei', 'Australia/Adelaide', 'UTC', undefined]) {
      expect(isMainlandChinaTimeZone(timeZone)).toBe(false)
    }
  })

  it('serves mainland visitors from the mirror without asking GitHub', async () => {
    const calls: string[] = []
    const fetchRelease = serve(calls, mirrorIndex, { assets: releaseAssets })

    await expect(resolveLatestDownloadUrl('macos', fetchRelease, 'Asia/Shanghai')).resolves.toBe(
      '/download/releases/v1.19.2/SayType_1.19.2_universal.dmg',
    )
    await expect(resolveLatestDownloadUrl('windows', fetchRelease, 'Asia/Shanghai')).resolves.toBe(
      '/download/releases/v1.19.2/SayType_1.19.2_x64-setup.exe',
    )
    expect(calls).toEqual([mirrorIndexUrl, mirrorIndexUrl])
  })

  it('sends mainland visitors to GitHub for what the mirror lacks', async () => {
    const calls: string[] = []
    const fetchRelease = serve(calls, mirrorIndex, { assets: releaseAssets })

    await expect(resolveLatestDownloadUrl('linux', fetchRelease, 'Asia/Shanghai')).resolves.toBe('https://example.com/linux')
    expect(calls).toEqual([mirrorIndexUrl, latestReleaseApiUrl])

    await expect(
      resolveLatestDownloadUrl('macos', serve([], undefined, { assets: releaseAssets }), 'Asia/Shanghai'),
    ).resolves.toBe('https://example.com/macos')
  })

  it('keeps GitHub first elsewhere and uses the mirror when GitHub fails', async () => {
    const calls: string[] = []
    await expect(
      resolveLatestDownloadUrl('macos', serve(calls, mirrorIndex, { assets: releaseAssets }), 'Australia/Adelaide'),
    ).resolves.toBe('https://example.com/macos')
    expect(calls).toEqual([latestReleaseApiUrl])

    await expect(resolveLatestDownloadUrl('macos', serve([], mirrorIndex, undefined), 'Australia/Adelaide')).resolves.toBe(
      '/download/releases/v1.19.2/SayType_1.19.2_universal.dmg',
    )
  })

  it.each([null, {}, { paths: 'x' }, { paths: [7, '../evil.dmg', 'runtime/x.dmg'] }])(
    'ignores a malformed mirror index',
    async (index) => {
      await expect(resolveLatestDownloadUrl('macos', serve([], index, undefined), 'Asia/Shanghai')).resolves.toBe(releasePageUrl)
    },
  )
})
