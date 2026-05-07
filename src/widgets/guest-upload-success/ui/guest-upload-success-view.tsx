import { SnappyLogo } from '@/shared/ui/snappy-logo'

interface GuestUploadSuccessViewProps {
  albumTitle: string
  uploadCount: number
  uploaderName: string
  onViewMyPhotos: () => void
  onUploadMore: () => void
}

export function GuestUploadSuccessView({
  albumTitle,
  uploadCount,
  uploaderName,
  onViewMyPhotos,
  onUploadMore,
}: GuestUploadSuccessViewProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#222226]">
      <div className="mx-auto flex w-full max-w-[402px] grow flex-col px-5 pt-6 pb-8">
        <header className="flex h-10 items-center justify-center">
          <SnappyLogo />
        </header>

        <section className="mt-[86px] flex flex-col items-center gap-3">
          <div className="flex items-center justify-center rounded-full bg-[#212121] p-[10px]">
            <CheckIcon />
          </div>
          <div className="flex w-full flex-col items-center">
            <p className="py-2.5 text-center text-[18px] font-medium tracking-[-0.36px]">
              사진 업로드가 완료되었어요!
            </p>
            <p className="pb-2.5 text-center text-[14px] tracking-[-0.28px] text-[#a2a5ad]">
              소중한 추억이 주최자에게 전달되었어요
            </p>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-col gap-2 rounded-[16px] bg-[#f4f6fa] px-5 py-3 text-[14px] leading-[1.4] tracking-[-0.28px]">
            <div className="flex gap-3">
              <span className="w-[90px] text-[#616369]">앨범 제목</span>
              <span className="text-[#222226]">{albumTitle}</span>
            </div>
            <div className="flex gap-3">
              <span className="w-[90px] text-[#616369]">업로드 수량</span>
              <span className="text-[#222226]">총 {uploadCount}장</span>
            </div>
            <div className="flex gap-3">
              <span className="w-[90px] text-[#616369]">업로드자</span>
              <span className="text-[#222226]">{uploaderName}</span>
            </div>
          </div>
        </section>

        <div className="grow" />

        <p className="py-2.5 text-center text-[10px] tracking-[-0.2px] text-[#a2a5ad]">
          사진 수정 및 삭제는 비밀번호 인증 후 가능합니다
        </p>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onViewMyPhotos}
            className="h-[60px] w-full rounded-[16px] bg-[#222226] text-[18px] font-semibold tracking-[-0.36px] text-white"
          >
            내가 올린 사진 보기
          </button>
          <button
            type="button"
            onClick={onUploadMore}
            className="h-[60px] w-full rounded-[16px] bg-[#f4f6fa] text-[18px] font-semibold tracking-[-0.36px] text-[#222226]"
          >
            사진 더 올리기
          </button>
        </div>
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
      <path
        d="M14 27L23 36L40 18"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
