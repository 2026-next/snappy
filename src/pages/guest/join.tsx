import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { joinByAccessCode } from '@/shared/api/guest'

type JoinStatus = 'loading' | 'error'

const INVALID_LINK_MESSAGE = '유효하지 않은 초대 링크예요.'
const NOT_FOUND_MESSAGE = '초대 정보를 찾을 수 없어요. 링크를 다시 확인해주세요.'

export function GuestJoinPage() {
  const { accessCode = '' } = useParams<{ accessCode: string }>()
  const navigate = useNavigate()
  const initialStatus: JoinStatus = accessCode ? 'loading' : 'error'
  const [status, setStatus] = useState<JoinStatus>(initialStatus)
  const [errorMessage, setErrorMessage] = useState<string>(
    accessCode ? '' : INVALID_LINK_MESSAGE,
  )

  useEffect(() => {
    if (!accessCode) return

    let cancelled = false

    void (async () => {
      try {
        const event = await joinByAccessCode(accessCode)
        if (cancelled) return
        navigate(`/guest/${event.id}/onboarding`, { replace: true })
      } catch {
        if (cancelled) return
        setStatus('error')
        setErrorMessage(NOT_FOUND_MESSAGE)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [accessCode, navigate])

  if (status === 'loading') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-screen items-center justify-center bg-white text-[#222226]"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-2 border-[#222226] border-t-transparent" />
          <p className="text-[14px] tracking-[-0.28px] text-[#616369]">
            초대 정보를 불러오고 있어요...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-5 text-[#222226]">
      <p className="text-center text-[18px] font-semibold tracking-[-0.36px]">
        {errorMessage}
      </p>
      <button
        type="button"
        onClick={() => navigate('/', { replace: true })}
        className="h-[52px] w-full max-w-[320px] rounded-[16px] bg-[#222226] text-[16px] font-medium text-white"
      >
        홈으로 돌아가기
      </button>
    </div>
  )
}
