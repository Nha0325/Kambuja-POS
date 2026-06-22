function Badge({ children, tone = "neutral" }) {
  const tones = {
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
    neutral: "badge-neutral",
  }
  return <span className={`badge badge-sm ${tones[tone] || tones.neutral}`}>{children}</span>
}

export default Badge
