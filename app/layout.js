import './globals.css'

export const metadata = {
  title: '인스타그램 컨설팅 사전 질문지 | 영유아교육디자인연구소',
  description:
    '어린이집 인스타그램 계정 운영을 도와드리는 컨설팅 사전 질문지입니다.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
