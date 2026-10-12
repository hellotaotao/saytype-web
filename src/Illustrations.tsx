import type { Locale } from './i18n'
import './Illustrations.css'

const micPath = 'M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5.3-3a5.3 5.3 0 0 1-10.6 0H5a7 7 0 0 0 6 6.9V21h2v-3.1a7 7 0 0 0 6-6.9h-1.7Z'

function Mic() {
  return <svg className="ill-mic" viewBox="0 0 24 24"><path d={micPath} /></svg>
}

function Wave({ bars }: { bars: number }) {
  return <span className="ill-wave">{Array.from({ length: bars }, (_, index) => <i key={index} />)}</span>
}

function Typed({ text }: { text: string }) {
  return <><span className="ill-caret ill-caret-before" /><span className="ill-typed">{text}</span><span className="ill-caret ill-caret-after" /></>
}

const appsCopy = {
  en: {
    label: 'Illustration: SayType inserts dictated text into whichever app has the cursor — an email, an AI assistant prompt, and a team chat.',
    mail: { title: 'New message', to: 'To', toValue: 'Maya Chen', subject: 'Subject', subjectValue: 'Contract', text: 'Thanks, Maya. I’ll send the signed contract this afternoon.' },
    ai: { title: 'Assistant', reply: 'Parser updated. Anything else?', text: 'Refactor this function but keep the error handling.' },
    chat: { title: 'design-review', first: 'Are you joining the review?', second: 'We’re starting in room 4.', text: 'On my way, 十分钟到！' },
  },
  zh: {
    label: '示意图：光标在哪个应用，SayType 就把说出的文字输入到哪里——邮件、AI 助手的输入框、团队聊天。',
    mail: { title: '新邮件', to: '收件人', toValue: 'Maya Chen', subject: '主题', subjectValue: '合同', text: '谢谢 Maya，合同我今天下午签好发你。' },
    ai: { title: 'AI 助手', reply: '解析器更新好了，还要改别的吗？', text: '重构这个函数，保留原来的 error handling。' },
    chat: { title: '设计评审', first: '你来参加评审吗？', second: '我们在 4 号会议室。', text: '马上到，十分钟！' },
  },
} as const

export function AppsScene({ locale }: { locale: Locale }) {
  const copy = appsCopy[locale]

  return (
    <div className="ill apps-scene" role="img" aria-label={copy.label}>
      <div className="ill-stage" aria-hidden="true">
        <div className="as-card as-mail">
          <div className="as-head"><i />{copy.mail.title}</div>
          <p className="as-field"><b>{copy.mail.to}</b>{copy.mail.toValue}</p>
          <p className="as-field"><b>{copy.mail.subject}</b>{copy.mail.subjectValue}</p>
          <p className="as-body">{copy.mail.text}</p>
        </div>
        <div className="as-card as-ai">
          <div className="as-head"><i />{copy.ai.title}</div>
          <p className="as-reply">{copy.ai.reply}</p>
          <p className="as-input">{copy.ai.text}</p>
        </div>
        <div className="as-card as-chat">
          <div className="as-head"><i />{copy.chat.title}</div>
          <p className="as-message"><i />{copy.chat.first}</p>
          <p className="as-message"><i />{copy.chat.second}</p>
          <p className="as-input">{copy.chat.text}<span className="ill-caret" /></p>
        </div>
        <div className="as-pill"><Mic /><Wave bars={14} /></div>
      </div>
    </div>
  )
}

export function BenefitIcon({ mark }: { mark: 'offline' | 'local' | 'unlimited' }) {
  if (mark === 'offline') return (
    <svg className="benefit-icon" viewBox="0 0 32 32"><path d="M4 12.5a17 17 0 0 1 24 0M8.5 17a10.6 10.6 0 0 1 15 0M13 21.5a4.3 4.3 0 0 1 6 0M16 25.6v.1M6 5l20 22" /></svg>
  )
  if (mark === 'local') return (
    <svg className="benefit-icon" viewBox="0 0 32 32"><path d="M6.5 7.5h19v13h-19zM3 24.5h26M13 14.5h6v3.5h-6zM14.2 14.5v-1.3a1.8 1.8 0 0 1 3.6 0v1.3" /></svg>
  )
  return (
    <svg className="benefit-icon" viewBox="0 0 32 32"><path d="M16 16c-2.2-3-4.2-5-7-5a5 5 0 0 0 0 10c2.8 0 4.8-2 7-5Zm0 0c2.2 3 4.2 5 7 5a5 5 0 0 0 0-10c-2.8 0-4.8 2-7 5Z" /></svg>
  )
}

const stepCopy = {
  en: { listening: 'Listening...', title: 'Notes', text: 'Sounds good, see you at ten.' },
  zh: { listening: '正在聆听...', title: '备忘录', text: '好的，十点见。' },
} as const

export function StepScene({ step, locale }: { step: 'hold' | 'speak' | 'release'; locale: Locale }) {
  const copy = stepCopy[locale]

  if (step === 'hold') return (
    <div className="ill step-scene step-scene-hold">
      <div className="ill-stage"><div className="ss-keys"><kbd>Ctrl</kbd><span>+</span><kbd>Shift</kbd></div></div>
    </div>
  )
  if (step === 'speak') return (
    <div className="ill step-scene step-scene-speak">
      <div className="ill-stage"><div className="ss-prompt"><Mic /><span className="ss-prompt-text">{copy.listening}</span><Wave bars={18} /></div></div>
    </div>
  )
  return (
    <div className="ill step-scene step-scene-release">
      <div className="ill-stage">
        <div className="ss-doc">
          <div className="as-titlebar"><i /><i /><i /><span>{copy.title}</span></div>
          <p><Typed text={copy.text} /></p>
        </div>
      </div>
    </div>
  )
}
