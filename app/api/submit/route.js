import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHEET_API_URL = process.env.SHEET_API_URL || ''
const APP_TOKEN = process.env.APP_TOKEN || 'haeoragi-insta-2026'

export async function POST(request) {
  let body = {}
  try {
    body = await request.json()
  } catch (e) {}

  const clean = (v) => String(v || '').trim()
  const payload = {
    name: clean(body.name),
    phone: clean(body.phone),
    position: clean(body.position),
    center: clean(body.center),
    address: clean(body.address),
    email: clean(body.email),
    q1: clean(body.q1),
    q2: clean(body.q2),
    q3: clean(body.q3),
  }

  if (!payload.name || !payload.phone || !payload.center) {
    return NextResponse.json(
      { ok: false, error: '이름·연락처·어린이집 이름을 적어 주세요.' },
      { status: 400 }
    )
  }
  if (!payload.q1 || !payload.q2 || !payload.q3) {
    return NextResponse.json(
      { ok: false, error: '질문 3가지에 모두 답해 주세요.' },
      { status: 400 }
    )
  }

  if (!SHEET_API_URL) {
    return NextResponse.json(
      {
        ok: false,
        error:
          '아직 전송 설정(SHEET_API_URL)이 되어 있지 않습니다. 관리자에게 알려 주세요.',
      },
      { status: 500 }
    )
  }

  try {
    const res = await fetch(SHEET_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'submit', token: APP_TOKEN, ...payload }),
      redirect: 'follow',
      cache: 'no-store',
    })
    const text = await res.text()
    let data = {}
    try {
      data = JSON.parse(text)
    } catch (e) {
      throw new Error('전송 서버 응답을 읽지 못했습니다.')
    }
    if (!data.ok) throw new Error(data.error || '전송에 실패했습니다.')
    return NextResponse.json({ ok: true, mailed: Boolean(data.mailed) })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err.message || err) },
      { status: 500 }
    )
  }
}
