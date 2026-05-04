import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CHEVRON_RIGHT = '/icons/chevron-right.svg'
const DOWNLOAD_ICON = '/icons/download.svg'

const SAMPLE_PHOTO = '/images/album-cover-sample.png'

const HEADER_TITLE = '사진 저장하기'
const MOCK_MESSAGE = '오늘 정말 아름다웠어, 결혼 축하해!'
const MOCK_UPLOADER_NAME = '김민준'

type SaveTab = 'polaroid' | 'plain'

export function PhotoSaveView() {
  const navigate = useNavigate()

  const [tab, setTab] = useState<SaveTab>('polaroid')
  const [showMessage, setShowMessage] = useState(true)
  const [showUploader, setShowUploader] = useState(true)
  const [showTakenAt, setShowTakenAt] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)

  const handleBack = () => navigate(-1)
  const handleSave = () => setIsCompleteModalOpen(true)
  const handleGoHome = () => {
    setIsCompleteModalOpen(false)
    navigate('/')
  }
  const handleGoBack = () => {
    setIsCompleteModalOpen(false)
    navigate(-1)
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[402px] flex-col bg-[#f4f6fa]">
      <header className="relative flex h-[60px] items-center justify-center px-5">
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로 가기"
          className="absolute left-5 flex h-10 w-10 items-center justify-center"
        >
          <img
            src={CHEVRON_RIGHT}
            alt=""
            className="h-[15.67px] w-[8.67px] -scale-x-100"
            aria-hidden="true"
          />
        </button>
        <h1 className="text-[20px] font-bold tracking-[-0.4px] text-[#222226]">
          {HEADER_TITLE}
        </h1>
      </header>

      <div className="flex justify-center pt-3">
        <div
          role="tablist"
          aria-label="저장 형식"
          className="flex items-center gap-2 rounded-2xl bg-white p-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'polaroid'}
            onClick={() => setTab('polaroid')}
            className={[
              'flex h-7 w-[120px] items-center justify-center rounded-lg px-[10px] text-[14px] font-medium',
              tab === 'polaroid'
                ? 'bg-[#d7dbe2] text-[#222226]'
                : 'bg-white text-[#616369]',
            ].join(' ')}
          >
            폴라로이드
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'plain'}
            onClick={() => setTab('plain')}
            className={[
              'flex h-7 w-[120px] items-center justify-center rounded-lg px-[10px] text-[14px] font-medium',
              tab === 'plain'
                ? 'bg-[#d7dbe2] text-[#222226]'
                : 'bg-white text-[#616369]',
            ].join(' ')}
          >
            일반 사진
          </button>
        </div>
      </div>

      {tab === 'polaroid' ? (
        <div className="mt-6 flex flex-col items-center gap-6 px-5">
          <div
            className="flex w-full flex-col items-center justify-center gap-[10px] bg-white p-[14px]"
            style={{ filter: 'drop-shadow(0px 4px 5px rgba(0,0,0,0.15))' }}
          >
            <div className="aspect-[300/225] w-full overflow-hidden">
              <img
                src={SAMPLE_PHOTO}
                alt=""
                className="h-full w-full object-cover"
                aria-hidden="true"
              />
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-1 py-[4px]">
              {showMessage && (
                <p
                  className="text-[24px] leading-[1.4] text-[#222226]"
                  style={{ fontFamily: "'THEFACESHOP INKLIPQUID', cursive" }}
                >
                  {MOCK_MESSAGE}
                </p>
              )}
              {showUploader && (
                <p
                  className="text-[20px] leading-[1.4] text-[#878787]"
                  style={{ fontFamily: "'THEFACESHOP INKLIPQUID', cursive" }}
                >
                  From. {MOCK_UPLOADER_NAME}
                </p>
              )}
              {showTakenAt && (
                <p
                  className="text-[20px] leading-[1.4] text-[#878787]"
                  style={{ fontFamily: "'THEFACESHOP INKLIPQUID', cursive" }}
                >
                  2026.05.16
                </p>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col items-center p-[10px]">
            <div className="flex w-[289px] flex-col items-start gap-5">
              <ToggleRow
                label="축하 메세지 보이기"
                checked={showMessage}
                onChange={setShowMessage}
              />
              <ToggleRow
                label="업로더 이름 보이기"
                checked={showUploader}
                onChange={setShowUploader}
              />
              <ToggleRow
                label="촬영 날짜 보이기"
                checked={showTakenAt}
                onChange={setShowTakenAt}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center px-5">
          <div className="aspect-[362/272] w-full overflow-hidden">
            <img
              src={SAMPLE_PHOTO}
              alt=""
              className="h-full w-full object-cover"
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      <div className="mt-auto px-5 pb-5 pt-6">
        <button
          type="button"
          onClick={handleSave}
          className="flex h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-[#222226] text-[18px] font-medium text-white transition-opacity hover:opacity-90 active:opacity-80"
        >
          <img
            src={DOWNLOAD_ICON}
            alt=""
            className="h-6 w-6 [filter:invert(1)]"
            aria-hidden="true"
          />
          갤러리에 저장하기
        </button>
      </div>

      {isCompleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-save-complete-title"
          className="fixed inset-0 z-30 mx-auto flex w-full max-w-[402px] items-center justify-center px-5"
        >
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setIsCompleteModalOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative flex w-full flex-col items-center gap-5 rounded-[18px] bg-white px-4 py-5">
            <h2
              id="photo-save-complete-title"
              className="text-[20px] font-bold leading-normal text-[#222226]"
            >
              사진 저장이 완료되었습니다
            </h2>
            <p className="text-center text-[14px] leading-[1.5] text-[#616369]">
              선택한 사진이 갤러리에 저장되었어요.
              <br />
              계속해서 사진을 확인하거나 홈으로 이동해보세요.
            </p>
            <div className="flex w-full items-center gap-4">
              <button
                type="button"
                onClick={handleGoHome}
                className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#f4f6fa] text-[18px] font-medium text-[#222226]"
              >
                홈으로 가기
              </button>
              <button
                type="button"
                onClick={handleGoBack}
                className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#222226] text-[18px] font-medium text-white"
              >
                이전으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

type ToggleRowProps = {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}

function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <p className="text-[14px] font-semibold text-black">{label}</p>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={[
          'relative h-[26px] w-[48px] rounded-full transition-colors',
          checked ? 'bg-[#222226]' : 'bg-[#d7dbe2]',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-[3px] h-5 w-5 rounded-full bg-white transition-all',
            checked ? 'left-[25px]' : 'left-[3px]',
          ].join(' ')}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}
