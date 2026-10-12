import type { Locale } from './i18n'
import './DictationDemo.css'

const demoCopy = {
  en: {
    label: 'Animated demo: hold the shortcut, speak a sentence that mixes two languages, release, and SayType inserts the text at the cursor.',
    app: 'Notes',
    menu: ['File', 'Edit', 'View'],
    title: 'Weekly sync',
    existing: 'Beta feedback is in. Two blockers left before launch.',
    spoken: 'Let’s move the standup to Wednesday, 我会把 roadmap 发到 Slack。',
    listening: 'Listening...',
    recording: 'Recording 0:04',
    transcribing: 'Transcribing audio...',
  },
  zh: {
    label: '动画演示：按住快捷键，说一句混用两种语言的话，松开后 SayType 把文字输入到光标处。',
    app: '备忘录',
    menu: ['文件', '编辑', '显示'],
    title: '周会记录',
    existing: 'Beta 反馈已经收齐，上线前还剩两个 blocker。',
    spoken: '下周的 standup 改到周三，我会把 roadmap 发到 Slack。',
    listening: '正在聆听...',
    recording: '录音中 0:04',
    transcribing: '正在转写...',
  },
} as const

const waveBars = Array.from({ length: 22 }, (_, index) => index)

export default function DictationDemo({ locale }: { locale: Locale }) {
  const copy = demoCopy[locale]

  return (
    <div className="dictation-demo" role="img" aria-label={copy.label}>
      <div className="dd-stage" aria-hidden="true">
        <div className="dd-screen">
          <div className="dd-menubar">
            <img className="dd-apple" src="/apple-logo.png" alt="" width="26" height="27" />
            <strong>{copy.app}</strong>
            {copy.menu.map((item) => <span key={item}>{item}</span>)}
            <img src="/saytype-icon.png" alt="" width="42" height="42" />
            <time>9:41</time>
          </div>
          <div className="dd-window">
            <div className="dd-titlebar"><i /><i /><i /><span>{copy.title}</span></div>
            <div className="dd-doc">
              <p className="dd-doc-title">{copy.title}</p>
              <p>{copy.existing}</p>
              <p>
                <span className="dd-caret dd-caret-before" />
                <span className="dd-inserted">{copy.spoken}</span>
                <span className="dd-caret dd-caret-after" />
              </p>
            </div>
          </div>
          <div className="dd-prompt-layer">
            <div className="dd-prompt">
              <svg className="dd-mic" viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5.3-3a5.3 5.3 0 0 1-10.6 0H5a7 7 0 0 0 6 6.9V21h2v-3.1a7 7 0 0 0 6-6.9h-1.7Z" /></svg>
              <div className="dd-prompt-text">
                <span className="dd-prompt-title">
                  <span className="dd-listening">{copy.listening}</span>
                  <span className="dd-transcribing">{copy.transcribing}</span>
                </span>
                <span className="dd-prompt-status">{copy.recording}<i /></span>
                <span className="dd-prompt-model">Qwen3-ASR 0.6B</span>
              </div>
              <div className="dd-wave">
                {waveBars.map((bar) => <i key={bar} />)}
              </div>
            </div>
            <div className="dd-bubble">{copy.spoken}</div>
          </div>
          <div className="dd-keys">
            <kbd>Ctrl</kbd><span>+</span><kbd>Shift</kbd>
          </div>
        </div>
      </div>
    </div>
  )
}
