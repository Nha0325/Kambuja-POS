function Card({ children, className = "" }) {
  return <article className={`rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] p-5 ${className}`}>{children}</article>
}

export default Card
