function Card({ children, className = "" }) {
  return <article className={`rounded-md border border-gray-200 bg-white p-4 ${className}`}>{children}</article>
}

export default Card
