function Table({ children, className = "" }) {
  return (
    <div className="overflow-x-auto border border-gray-200 bg-white">
      <table className={`table ${className}`}>{children}</table>
    </div>
  )
}

export default Table
