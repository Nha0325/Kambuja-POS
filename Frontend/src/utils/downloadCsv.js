const formatCsvValue = (value) => {
  if (value === null || typeof value === "undefined") return ""

  const text = String(value).replace(/"/g, '""')
  return /[",\n]/.test(text) ? `"${text}"` : text
}

export const downloadCsv = (filename, columns, rows) => {
  const header = columns.map((column) => formatCsvValue(column.label)).join(",")
  const body = rows.map((row) => (
    columns
      .map((column) => formatCsvValue(column.value(row)))
      .join(",")
  ))

  const blob = new Blob([[header, ...body].join("\n")], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}
