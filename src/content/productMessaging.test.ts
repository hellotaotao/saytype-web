import { describe, expect, it } from 'vitest'
import { productMessaging } from './productMessaging'

const serializedMessaging = JSON.stringify(productMessaging).toLowerCase()

describe('productMessaging', () => {
  it('matches the selected launch hero direction', () => {
    expect(productMessaging.hero.headline).toBe('Local transcription. Speak naturally. Mix languages.')
    expect(productMessaging.hero.subheadline).toBe('Turn your voice into text on your device, right in the app you’re using—even when you mix languages.')
    expect(productMessaging.hero.primaryCta).toBe('Download for free')
    expect(productMessaging.hero.secondaryCta).toBe('See how it works')
  })

  it('names SayType consistently and describes the current desktop reality', () => {
    expect(productMessaging.productName).toBe('SayType')
    expect(productMessaging.currentReality).toContain('Tauri')
    expect(productMessaging.currentReality).toContain('Qwen3')
    expect(productMessaging.currentReality).toContain('Groq')
  })

  it('covers the intended target users', () => {
    expect(productMessaging.targetUsers.map((user) => user.id)).toEqual(
      expect.arrayContaining([
        'developers',
        'writers',
        'bilingual-workers',
        'support-ops',
        'desktop-power-users',
      ]),
    )
  })

  it('captures real pain points and maps each one to a concrete feature value', () => {
    expect(productMessaging.painPoints.map((point) => point.id)).toEqual(
      expect.arrayContaining([
        'native-dictation',
        'fragmented-voice',
        'slow-typing',
        'browser-tools',
      ]),
    )

    for (const painPoint of productMessaging.painPoints) {
      const mapping = productMessaging.valueMappings.find(
        (entry) => entry.painPointId === painPoint.id,
      )
      expect(mapping, `Missing value mapping for ${painPoint.id}`).toBeDefined()
      expect(
        productMessaging.features.some((feature) => feature.id === mapping?.featureId),
      ).toBe(true)
    }
  })

  it('leads with local benefits while documenting the dictation workflow', () => {
    expect(productMessaging.hero.proofPoints).toEqual(
      expect.arrayContaining([
        'No account or API key for local transcription',
        'No subscription or transcription quotas',
        'Offline after the model download',
      ]),
    )

    expect(serializedMessaging).toContain('active app')
    expect(serializedMessaging).toContain('cursor')
    expect(serializedMessaging).toContain('waveform')
    expect(serializedMessaging).toContain('local qwen3')
    expect(serializedMessaging).toContain('history')
    expect(serializedMessaging).not.toContain('clipboard fallback')
  })

  it('keeps provider and model details aligned with the app settings', () => {
    const local = productMessaging.providers.find((provider) => provider.name === 'Local Qwen3')
    const groq = productMessaging.providers.find((provider) => provider.name === 'Groq')
    const openai = productMessaging.providers.find((provider) => provider.name === 'OpenAI')

    expect(local?.models).toEqual(['Qwen3-ASR 0.6B (recommended)', 'Qwen3-ASR 1.7B (experimental)'])
    expect(productMessaging.providers.find((provider) => provider.name === 'Local Nemotron')?.note).toContain('Experimental')
    expect(serializedMessaging).not.toContain('select a microphone from settings')
    expect(groq?.models).toEqual(['whisper-large-v3', 'whisper-large-v3-turbo'])
    expect(openai?.models).toEqual(['gpt-transcribe'])
  })

  it('is explicit about platforms, permissions, and the local-first privacy boundary', () => {
    expect(productMessaging.platforms.map((platform) => platform.name)).toEqual([
      'macOS',
      'Windows',
      'Linux',
    ])
    expect(serializedMessaging).toContain('microphone')
    expect(serializedMessaging).toContain('accessibility')
    expect(serializedMessaging).toContain('cgevent')
    expect(serializedMessaging).toContain('apple silicon')
    expect(serializedMessaging).toContain('audio stays on your machine')
    expect(serializedMessaging).toContain('api key')
  })
})
