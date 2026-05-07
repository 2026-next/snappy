import { type EventResponse } from '@/shared/api/event'

type EventPickerModalProps = {
  events: EventResponse[]
  onSelect: (eventId: string) => void
  onClose: () => void
}

function formatEventDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

export function EventPickerModal({
  events,
  onSelect,
  onClose,
}: EventPickerModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-picker-title"
      className="fixed inset-0 z-30 mx-auto flex w-full max-w-[402px] items-center justify-center px-5"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative flex w-full flex-col gap-4 rounded-[18px] bg-white px-4 py-5">
        <h2
          id="event-picker-title"
          className="text-center text-[20px] font-bold leading-normal text-[#222226]"
        >
          관리할 앨범을 선택하세요
        </h2>
        <ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
          {events.map((event) => (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => onSelect(event.id)}
                className="flex w-full items-center justify-between rounded-2xl bg-[#f4f6fa] px-5 py-4 text-left transition-opacity hover:opacity-80 active:opacity-70"
              >
                <span className="text-[16px] font-semibold tracking-[-0.32px] text-[#222226]">
                  {event.name}
                </span>
                <span className="text-[12px] tracking-[-0.24px] text-[#a2a5ad]">
                  {formatEventDate(event.eventDate)}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-full items-center justify-center rounded-2xl bg-[#222226] text-[18px] font-medium text-white"
        >
          취소
        </button>
      </div>
    </div>
  )
}
