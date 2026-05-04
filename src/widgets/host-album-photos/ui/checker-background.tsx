export function CheckerBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        backgroundImage:
          'linear-gradient(45deg, #e6eaf0 25%, transparent 25%), linear-gradient(-45deg, #e6eaf0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e6eaf0 75%), linear-gradient(-45deg, transparent 75%, #e6eaf0 75%)',
        backgroundSize: '14px 14px',
        backgroundPosition: '0 0, 0 7px, 7px -7px, -7px 0',
      }}
    />
  )
}
