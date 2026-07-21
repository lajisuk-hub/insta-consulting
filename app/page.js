'use client'

import { useState } from 'react'
import {
  PRICE_TEXT,
  PRICE_DETAIL,
  BANK_INFO,
  KAKAO_LINK,
  CONTACT_PHONE,
  RECEIVE_EMAIL,
} from './config'

const QUESTIONS = [
  {
    key: 'q1',
    title: '어린이집 인스타그램 운영을 하고자 하는 이유는 무엇인가요?',
    help: '원아 모집, 학부모 소통, 우리 원 알리기 등 지금 마음속에 있는 이유를 편하게 적어 주세요. 길게 적을수록 방향을 정확히 잡아 드릴 수 있습니다.',
    placeholder:
      '예) 신입 원아 모집이 예전 같지 않아서 우리 원을 알리고 싶습니다. 학부모님들께 아이들의 하루를 자연스럽게 보여드리고 싶기도 합니다.',
  },
  {
    key: 'q2',
    title: '인스타그램에 담고 싶은 내용은 무엇인가요?',
    help: '담고 싶은 내용이 없으셔도 괜찮습니다. 컨설팅에서 추천해 드립니다. 떠오르는 것이 있으면 몇 가지만 적어 주세요.',
    placeholder:
      '예) 아이들 놀이 장면, 급식·간식, 계절 행사, 교사 이야기 …\n(생각나는 것이 없으면 "아직 없습니다"라고만 적으셔도 됩니다)',
  },
  {
    key: 'q3',
    title: '우리 원의 특징을 마음껏 자랑해 주세요.',
    help: '원아 연령, 교사의 장점, 원장님의 장점, 입소문 나는 점, 특색 프로그램 등 무엇이든 좋습니다. 자랑거리가 곧 인스타그램의 글감이 됩니다.',
    placeholder:
      '예) 만 1세~5세 90명 규모입니다. 교사 평균 근속이 7년이라 아이들이 안정적으로 지냅니다. 원장이 유아교육 박사과정이라 놀이 중심 프로그램을 직접 설계합니다. 텃밭 활동으로 입소문이 났습니다.',
  },
]

const TOTAL = 7 // 안내 · 결제 · 인적사항 · 질문3 · 확인

const emptyForm = {
  name: '',
  phone: '',
  center: '',
  address: '',
  email: '',
  position: '',
  q1: '',
  q2: '',
  q3: '',
}

export default function Page() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setError('')
  }

  const go = (n) => {
    setError('')
    setStep(n)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
  }

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('복사했습니다.')
    } catch (e) {
      alert(text)
    }
  }

  // ── 단계별 다음으로 이동 (검증 포함) ──
  const next = () => {
    if (step === 2) {
      if (!form.name.trim() || !form.phone.trim() || !form.center.trim()) {
        setError('이름, 연락처, 어린이집 이름은 꼭 적어 주세요.')
        return
      }
      if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        setError('메일주소 형식을 확인해 주세요. (예: abc@naver.com)')
        return
      }
    }
    if (step >= 3 && step <= 5) {
      const q = QUESTIONS[step - 3]
      if (!form[q.key].trim()) {
        setError('내용을 적어 주셔야 다음으로 넘어갈 수 있습니다.')
        return
      }
    }
    go(step + 1)
  }

  const submit = async () => {
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || '전송에 실패했습니다.')
      }
      setDone(true)
      if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
    } catch (err) {
      setError(
        String(err.message || err) +
          ' — 잠시 후 다시 눌러 보시고, 계속 안 되면 카카오톡으로 알려 주세요.'
      )
    } finally {
      setSending(false)
    }
  }

  if (done) {
    return (
      <div className="wrap">
        <Brand />
        <div className="card done">
          <div className="emoji">💌</div>
          <h1>제출이 완료되었습니다</h1>
          <p className="lead">
            작성해 주신 내용이 영유아교육디자인연구소로 전달되었습니다.
          </p>
          <div className="hint" style={{ textAlign: 'left' }}>
            일정에 맞추어 <b>소장이 직접 전화</b>로 우리 원 운영방안 계획을
            전달드릴 예정입니다.
            <br />
            <br />
            아직 보내지 않으셨다면 <b>고유번호증</b>과 <b>메일주소</b>를
            카카오톡으로 보내 주세요.
          </div>
          <a href={KAKAO_LINK} target="_blank" rel="noreferrer">
            <button className="primary" style={{ width: '100%' }}>
              카카오톡으로 자료 보내기
            </button>
          </a>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="wrap">
      <Brand />
      <div className="progress">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <span key={i} className={i <= step ? 'on' : ''} />
        ))}
      </div>

      <div className="card">
        {step === 0 && <Intro />}
        {step === 1 && <Payment copy={copy} />}
        {step === 2 && <Personal form={form} set={set} />}
        {step >= 3 && step <= 5 && (
          <Question q={QUESTIONS[step - 3]} index={step - 2} form={form} set={set} />
        )}
        {step === 6 && <Review form={form} go={go} />}

        {error && <div className="err">{error}</div>}

        <div className="btns">
          {step > 0 && (
            <button className="ghost" onClick={() => go(step - 1)} disabled={sending}>
              이전
            </button>
          )}
          {step < 6 ? (
            <button className="primary" onClick={next}>
              {step === 0 ? '시작하기' : '다음'}
            </button>
          ) : (
            <button className="primary" onClick={submit} disabled={sending}>
              {sending ? '보내는 중…' : '작성 완료 · 보내기'}
            </button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

function Brand() {
  return (
    <div className="brand">
      <span className="logo">영유아교육디자인연구소</span>
    </div>
  )
}

function Footer() {
  return (
    <div className="footer">
      영유아교육디자인연구소 · 인스타그램 컨설팅
      <br />
      문의 {CONTACT_PHONE}
    </div>
  )
}

// ── 1. 안내 ──
function Intro() {
  return (
    <>
      <div className="step-label">1 / 7 · 안내</div>
      <h1>
        인스타그램 컨설팅
        <br />
        사전 질문지
      </h1>
      <p className="lead">
        영유아교육디자인연구소의 인스타그램 컨설팅은 <b>계정 운영이 막막한
        분들의 최소한의 계정 운영을 직접적으로 도와드리는 시스템</b>입니다.
      </p>
      <p className="lead">
        우선 <b>나의 관점을 자세하게 작성</b>해 주시면, 일정에 맞게{' '}
        <b>소장이 직접 전화로 우리 원 운영방안 계획을 전달</b>드릴 예정입니다.
      </p>

      <div className="hint">
        <b>이렇게 진행됩니다</b>
        <ul className="list">
          <li>결제 안내를 확인하고 입금해 주세요.</li>
          <li>고유번호증과 메일주소를 카카오톡으로 보내 주세요.</li>
          <li>질문 3가지에 편하게 답을 적어 주세요. (한 쪽에 하나씩)</li>
          <li>소장이 직접 전화로 운영방안 계획을 전달드립니다.</li>
        </ul>
      </div>

      <p className="muted">
        작성하시는 데 약 10분 정도 걸립니다. 정답은 없으니 떠오르는 대로
        편하게 적어 주세요.
      </p>
    </>
  )
}

// ── 2. 결제 안내 ──
function Payment({ copy }) {
  const account = BANK_INFO.replace(/\s*\(.*\)$/, '')
  return (
    <>
      <div className="step-label">2 / 7 · 결제 안내</div>
      <h2>결제 안내</h2>

      <div className="pay-box">
        <div className="price">{PRICE_TEXT}</div>
        <p className="muted" style={{ marginBottom: 12 }}>
          {PRICE_DETAIL}
        </p>
        <div className="row">
          <b>입금 계좌</b>
          <span>
            {BANK_INFO}{' '}
            <button className="copy-btn" onClick={() => copy(account)}>
              복사
            </button>
          </span>
        </div>
        <div className="row">
          <b>입금자명</b>
          <span>어린이집 이름 또는 원장님 성함으로 넣어 주세요.</span>
        </div>
      </div>

      <div className="notice">
        <b>📌 기관 증빙자료 요청</b>
        <br />
        <b>고유번호증</b>과 <b>메일주소</b>를 카카오톡으로 전달해 주세요!
        <br />
        <span className="muted">(세금계산서 발행에 필요합니다)</span>
      </div>

      <a href={KAKAO_LINK} target="_blank" rel="noreferrer">
        <button className="ghost" style={{ width: '100%' }}>
          카카오톡으로 보내기
        </button>
      </a>
      <p className="muted" style={{ marginTop: 10 }}>
        카카오톡이 어려우시면 문자 {CONTACT_PHONE} 로 보내 주셔도 됩니다.
      </p>
    </>
  )
}

// ── 3. 인적사항 ──
function Personal({ form, set }) {
  return (
    <>
      <div className="step-label">3 / 7 · 신청자 정보</div>
      <h2>신청자 정보를 적어 주세요</h2>
      <p className="muted" style={{ marginBottom: 18 }}>
        연락드릴 때 사용합니다. ★ 표시는 꼭 적어 주세요.
      </p>

      <label className="field">
        <span className="name">★ 작성자 이름</span>
        <input type="text" value={form.name} onChange={set('name')} placeholder="예) 홍길동" />
      </label>

      <label className="field">
        <span className="name">★ 연락처(휴대폰)</span>
        <input
          type="tel"
          value={form.phone}
          onChange={set('phone')}
          placeholder="예) 010-1234-5678"
        />
      </label>

      <label className="field">
        <span className="name">직위</span>
        <input
          type="text"
          value={form.position}
          onChange={set('position')}
          placeholder="예) 원장 / 교사"
        />
      </label>

      <label className="field">
        <span className="name">★ 어린이집 이름</span>
        <input
          type="text"
          value={form.center}
          onChange={set('center')}
          placeholder="예) 멘토어린이집"
        />
      </label>

      <label className="field">
        <span className="name">어린이집 주소</span>
        <input
          type="text"
          value={form.address}
          onChange={set('address')}
          placeholder="예) 대구광역시 수성구 ○○로 12"
        />
      </label>

      <label className="field">
        <span className="name">메일주소</span>
        <input
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="예) abc@naver.com"
        />
      </label>
    </>
  )
}

// ── 4~6. 질문 ──
function Question({ q, index, form, set }) {
  const value = form[q.key]
  return (
    <>
      <div className="step-label">
        {index + 3} / 7 · 질문 {index}
      </div>
      <h2>
        {index}. {q.title}
      </h2>
      <div className="hint">{q.help}</div>
      <textarea value={value} onChange={set(q.key)} placeholder={q.placeholder} />
      <div className="counter">{value.length}자</div>
    </>
  )
}

// ── 7. 확인 및 제출 ──
function Review({ form, go }) {
  const rows = [
    ['작성자 이름', form.name],
    ['연락처', form.phone],
    ['직위', form.position],
    ['어린이집 이름', form.center],
    ['어린이집 주소', form.address],
    ['메일주소', form.email],
    ['1. 인스타그램 운영을 하고자 하는 이유', form.q1],
    ['2. 인스타그램에 담고 싶은 내용', form.q2],
    ['3. 우리 원의 특징 자랑', form.q3],
  ]
  return (
    <>
      <div className="step-label">7 / 7 · 확인 후 보내기</div>
      <h2>작성하신 내용을 확인해 주세요</h2>

      <div className="notice">
        이 자료는 <b>영유아교육디자인연구소 컨설팅 의뢰</b>로 메일 전송됩니다.
        <br />
        <span className="muted">받는 곳 : {RECEIVE_EMAIL}</span>
      </div>

      <div style={{ marginTop: 8 }}>
        {rows.map(([q, a]) => (
          <div className="review-item" key={q}>
            <div className="q">{q}</div>
            <div className="a">{a ? a : <span className="muted">(적지 않음)</span>}</div>
          </div>
        ))}
      </div>

      <p className="muted" style={{ marginTop: 14 }}>
        고칠 내용이 있으면 <b>이전</b> 버튼으로 돌아가시거나{' '}
        <button
          className="copy-btn"
          onClick={() => go(2)}
          style={{ verticalAlign: 'baseline' }}
        >
          처음 질문으로
        </button>{' '}
        눌러 주세요.
      </p>
    </>
  )
}
