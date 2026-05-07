import { SnappyLogo } from '@/shared/ui/snappy-logo'

interface GuestOnboardingViewProps {
  onUploadStart: () => void
  onViewMyPhotos: () => void
}

export function GuestOnboardingView({
  onUploadStart,
  onViewMyPhotos,
}: GuestOnboardingViewProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#222226]">
      <div className="mx-auto flex w-full max-w-[402px] grow flex-col px-5 pt-6 pb-8">
        <header className="flex h-10 items-center justify-center">
          <SnappyLogo />
        </header>

        <main className="grow">
          <section className="mt-10 flex flex-col items-center gap-2">
            <div className="size-[140px] overflow-hidden rounded-[26.667px] bg-[#a2a5ad]" />
            <div className="flex w-full flex-col items-center">
              <p className="px-2.5 py-2.5 text-center text-[18px] font-medium tracking-[-0.36px]">
                민수 &amp; 지연 Wedding
              </p>
              <p className="pb-2.5 text-center text-[14px] tracking-[-0.28px] text-[#a2a5ad]">
                촬영하신 사진을 자유롭게 업로드해주세요
              </p>
            </div>
          </section>

          <section className="mt-12 flex flex-col gap-2">
            <div className="flex items-center gap-0.5 px-5">
              <InfoCircleIcon />
              <span className="text-[12px] font-semibold tracking-[-0.24px]">
                업로드 안내
              </span>
            </div>
            <div className="flex flex-col gap-1 text-[10px] tracking-[-0.2px]">
              <div className="flex flex-col gap-2 rounded-[16px] bg-[#f4f6fa] px-5 py-3">
                <p>• 직접 촬영한 사진을 업로드할 수 있어요</p>
                <p>• 여러 장을 한 번에 업로드할 수 있어요</p>
                <p>• 업로드한 사진은 소중히 보관합니다</p>
              </div>
              <div className="flex flex-col gap-2 rounded-[16px] bg-[#f4f6fa] px-5 py-3">
                <div className="flex gap-3">
                  <span className="w-16 text-[#616369]">업로드 가능 기간</span>
                  <span>2026.05.16 - 2026.05.23</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-16 text-[#616369]">지원 형식</span>
                  <span>JPG, PNG, HEIC</span>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer>
          <p className="py-2.5 text-center text-[10px] tracking-[-0.2px] text-[#a2a5ad] whitespace-nowrap">
            내 사진을 수정하거나 삭제하려면 업로드 시 설정한 비밀번호가 필요해요
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onUploadStart}
              className="h-[60px] w-full rounded-[16px] bg-[#222226] text-[18px] font-semibold tracking-[-0.36px] text-white"
            >
              사진 업로드 시작
            </button>
            <button
              type="button"
              onClick={onViewMyPhotos}
              className="h-[60px] w-full rounded-[16px] bg-[#f4f6fa] text-[18px] font-semibold tracking-[-0.36px] text-[#222226]"
            >
              내가 올린 사진 보기
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

function InfoCircleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <circle cx="8.5" cy="8.5" r="7.75" stroke="#222226" strokeWidth="0.5" />
      <path
        d="M8.5 7.5V12"
        stroke="#222226"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="8.5" cy="5.5" r="0.75" fill="#222226" />
    </svg>
  )
}
