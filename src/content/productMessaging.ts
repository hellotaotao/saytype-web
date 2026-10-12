export type TargetUser = {
  id: string
  title: string
  need: string
  value: string
}

export type PainPoint = {
  id: string
  problem: string
  consequence: string
}

export type ValueMapping = {
  painPointId: string
  featureId: string
  value: string
}

export type WorkflowStep = {
  label: string
  title: string
  description: string
}

export type ProductFeature = {
  id: string
  title: string
  description: string
}

export type PermissionDetail = {
  title: string
  description: string
}

export type PlatformDetail = {
  name: 'macOS' | 'Windows' | 'Linux'
  status: string
  detail: string
}

export type ProviderDetail = {
  name: 'Local Qwen3' | 'Local Nemotron' | 'Groq' | 'OpenAI'
  models: string[]
  note: string
}

export type ProductMessaging = {
  productName: 'TypeAloud'
  currentReality: string
  hero: {
    eyebrow: string
    headline: string
    subheadline: string
    primaryCta: string
    secondaryCta: string
    proofPoints: string[]
  }
  targetUsers: TargetUser[]
  painPoints: PainPoint[]
  valueMappings: ValueMapping[]
  workflow: WorkflowStep[]
  features: ProductFeature[]
  permissions: PermissionDetail[]
  platforms: PlatformDetail[]
  providers: ProviderDetail[]
  workflowExample: {
    sourceApp: string
    dictated: string
    inserted: string
  }
  cta: {
    headline: string
    description: string
    note: string
  }
}

export const productMessaging: ProductMessaging = {
  productName: 'TypeAloud',
  currentReality:
    'TypeAloud is a Tauri desktop voice input app. On Apple Silicon Macs it can run Qwen3 transcription locally after a one-time model download; Groq and OpenAI remain optional cloud engines using your own key.',
  hero: {
    eyebrow: 'Local transcription. No account. No subscription.',
    headline: 'Local transcription. Speak naturally. Mix languages.',
    subheadline: 'Turn your voice into text on your device, right in the app you’re using—even when you mix languages.',
    primaryCta: 'Download for free',
    secondaryCta: 'See how it works',
    proofPoints: [
      'No account or API key for local transcription',
      'No subscription or transcription quotas',
      'Offline after the model download',
      'Local Qwen3 mode keeps audio on your Mac',
    ],
  },
  targetUsers: [
    {
      id: 'developers',
      title: 'Developers',
      need: 'Long comments, PR notes, standup updates, issue triage, and architecture notes without leaving the editor.',
      value: 'Dictate structured text directly into IDEs, terminals, docs, and chat tools.',
    },
    {
      id: 'writers',
      title: 'Writers',
      need: 'Draft faster across notes, manuscripts, outlines, and research tools.',
      value: 'Capture paragraphs in place instead of moving ideas through a separate dictation app.',
    },
    {
      id: 'bilingual-workers',
      title: 'Bilingual workers',
      need: 'Switch between languages for messages, docs, and support replies.',
      value: 'Qwen detects the spoken language automatically. Nemotron and cloud engines offer a language setting; the interface language is configured separately.',
    },
    {
      id: 'support-ops',
      title: 'Support and ops teams',
      need: 'Turn live context into clear tickets, handoff notes, and customer replies.',
      value: 'Speak operational updates into the exact system already open.',
    },
    {
      id: 'desktop-power-users',
      title: 'Desktop power users',
      need: 'Reduce repetitive typing across many native and web apps.',
      value: 'Use one global voice input method instead of app-by-app voice tools.',
    },
  ],
  painPoints: [
    {
      id: 'native-dictation',
      problem: 'Native dictation can be inconsistent across apps and operating systems.',
      consequence: 'Users hesitate to rely on it for long, precise desktop writing.',
    },
    {
      id: 'fragmented-voice',
      problem: 'Voice input is often locked inside one browser tab, app, or editor.',
      consequence: 'People copy text around instead of staying in their current workflow.',
    },
    {
      id: 'slow-typing',
      problem: 'Typing long notes, explanations, code comments, and replies is slow.',
      consequence: 'High-context work gets postponed or shortened.',
    },
    {
      id: 'browser-tools',
      problem: 'Browser voice tools do not reliably insert text into arbitrary desktop apps.',
      consequence: 'They help with drafts, but not with the place where work actually happens.',
    },
  ],
  valueMappings: [
    {
      painPointId: 'native-dictation',
      featureId: 'engine-choice',
      value: 'Choose private local transcription or your own Groq/OpenAI account without changing how you dictate.',
    },
    {
      painPointId: 'fragmented-voice',
      featureId: 'global-hotkey',
      value: 'A global hold-to-record shortcut works from the app you are already using.',
    },
    {
      painPointId: 'slow-typing',
      featureId: 'active-app-insertion',
      value: 'Speak naturally, release the keys, and get text back at the cursor.',
    },
    {
      painPointId: 'browser-tools',
      featureId: 'history',
      value: 'Every completed transcript is kept in History, where it can be copied manually if insertion needs attention.',
    },
  ],
  workflow: [
    {
      label: '01',
      title: 'Keep TypeAloud in the tray',
      description: 'The desktop app stays out of the way in the menu bar or system tray until you need it.',
    },
    {
      label: '02',
      title: 'Hold Ctrl+Shift',
      description: 'Press and hold the global recording shortcut from any app, with shortcut options available in settings.',
    },
    {
      label: '03',
      title: 'Speak with visual feedback',
      description: 'A compact input prompt appears with real-time recording and waveform feedback.',
    },
    {
      label: '04',
      title: 'Release to transcribe',
      description: 'TypeAloud stops recording on release and transcribes with your selected local or cloud engine. Local mode shows progress as text arrives.',
    },
    {
      label: '05',
      title: 'Text appears in place',
      description:
        'On macOS, TypeAloud inserts the transcript into the active app. If an app blocks insertion, the completed text remains available in History to copy.',
    },
    {
      label: '06',
      title: 'Cancel instantly',
      description: 'Press Escape to cancel an active recording or an in-progress transcription request.',
    },
  ],
  features: [
    {
      id: 'global-hotkey',
      title: 'Global hold-to-record hotkey',
      description: 'Hold Ctrl+Shift to record, release to stop, and keep your hands near the keyboard.',
    },
    {
      id: 'active-app-insertion',
      title: 'Active-app text insertion',
      description: 'Transcribed text is sent back to the app and text field that already has your cursor.',
    },
    {
      id: 'live-overlay',
      title: 'Prompt overlay with waveform',
      description: 'A small always-on-top prompt confirms recording state with real-time audio visualization.',
    },
    {
      id: 'engine-choice',
      title: '100% local transcription',
      description: 'Turn speech into text on your Mac. In local mode, your audio and transcript stay on your device.',
    },
    {
      id: 'translation',
      title: 'Speak it. Write it in English.',
      description: 'Hold Shift+Alt to translate speech into English through a cloud provider using your own API key.',
    },
    {
      id: 'microphone-choice',
      title: 'Uses your system’s default microphone',
      description: 'Change your input device in your operating system’s sound settings.',
    },
    {
      id: 'quiet-background',
      title: 'Quiet background operation',
      description: 'TypeAloud runs from the tray, supports auto launch, and downloads verified updates in the background for you to install when ready.',
    },
    {
      id: 'history',
      title: 'History, copy and retry',
      description: 'Copy saved transcripts from History. If transcription fails and audio was saved, retry it with your current engine.',
    },
  ],
  permissions: [
    {
      title: 'Local mode or your own cloud key',
      description: 'Local Qwen3 mode needs no account or API key. Cloud mode sends audio directly to the Groq or OpenAI account you configure.',
    },
    {
      title: 'Microphone access',
      description: 'Microphone permission is required to capture voice input for transcription.',
    },
    {
      title: 'macOS Accessibility permission',
      description:
        'macOS requires Accessibility permission for global hotkeys and full automatic insertion into other apps.',
    },
    {
      title: 'Your audio stays local in local mode',
      description:
        'Qwen3-ASR runs on your machine after its one-time download. TypeAloud has no server in the middle; cloud mode is an explicit choice.',
    },
  ],
  platforms: [
    {
      name: 'macOS',
      status: 'Primary desktop path',
      detail: 'The primary, tested path: menu bar operation, local Qwen3 (Apple Silicon recommended), system-default microphone, Accessibility permission, and CGEvent-based automatic text insertion.',
    },
    {
      name: 'Windows',
      status: 'Experimental',
      detail: 'A build target and native insertion path exist, but it has not received the same real-world validation as macOS.',
    },
    {
      name: 'Linux',
      status: 'Experimental',
      detail: 'A build target exists, but desktop integration and insertion behaviour are still experimental.',
    },
  ],
  providers: [
    {
      name: 'Local Qwen3',
      models: ['Qwen3-ASR 0.6B (recommended)', 'Qwen3-ASR 1.7B (experimental)'],
      note: 'Apple Silicon recommended. Qwen3-ASR 0.6B needs a ~1 GB one-time download; the experimental 1.7B model needs ~2.52 GB. No account or API key; audio stays on your machine. Translation uses a configured cloud provider.',
    },
    {
      name: 'Local Nemotron',
      models: ['Nemotron 3.5 ASR'],
      note: 'Experimental live transcription on macOS arm64 and Windows x64. Accuracy may be lower than Qwen; the dictionary is not applied.',
    },
    {
      name: 'Groq',
      models: ['whisper-large-v3', 'whisper-large-v3-turbo'],
      note: 'Whisper models for fast speech-to-text and translation-mode support.',
    },
    {
      name: 'OpenAI',
      models: ['gpt-transcribe'],
      note: 'The current transcription choice in Settings. English translation uses whisper-1.',
    },
  ],
  workflowExample: {
    sourceApp: 'Cursor, Slack, Linear, Notion, Gmail, terminal notes',
    dictated:
      'The regression is probably in the new permission flow. I am going to add a retry around the accessibility recheck and update the release notes.',
    inserted:
      'The regression is probably in the new permission flow. I am going to add a retry around the accessibility recheck and update the release notes.',
  },
  cta: {
    headline: 'Your voice. No cloud required.',
    description:
      'Use TypeAloud when typing becomes the bottleneck: comments, tickets, docs, replies, notes, and multilingual work across the apps you already use.',
    note: 'macOS is the primary path. Apple Silicon is recommended for local dictation, with a ~1 GB download for Qwen3-ASR 0.6B; microphone access and macOS Accessibility permission are required for the full voice-typing workflow.',
  },
}
