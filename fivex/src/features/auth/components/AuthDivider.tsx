export function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-text-dim uppercase">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}