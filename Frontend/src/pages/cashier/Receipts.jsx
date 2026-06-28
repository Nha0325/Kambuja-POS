import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { api } from "../../utils/config/api"
import formatDate from "../../utils/formatters/formatDate"

function Receipts() {
  const formatUsd = (value) => `$${Number(value || 0).toFixed(2)}`
  const [sales, setSales] = useState([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setIsLoading(true)
        const res = await api.get("/sales?limit=100&page=1")
        const fetchedSales = res.data?.result || res.data?.sales || res.data || []
        setSales(Array.isArray(fetchedSales) ? fetchedSales : [])
      } catch (err) {
        setError(err.message || "Failed to fetch receipts")
      } finally {
        setIsLoading(false)
      }
    }
    fetchSales()
  }, [])

  const filteredSales = useMemo(() => {
    if (!search) return sales
    const query = search.toLowerCase()
    return sales.filter(sale => 
      sale.invoiceNumber?.toLowerCase().includes(query) ||
      sale.paymentStatus?.toLowerCase().includes(query)
    )
  }, [sales, search])

  const totalReceipts = filteredSales.length
  const totalPaidCount = filteredSales.filter(s => s.paymentStatus === "PAID").length
  const totalPartialDueCount = filteredSales.filter(s => s.paymentStatus === "PARTIAL" || s.paymentStatus === "DUE").length
  const totalAmount = filteredSales.reduce((sum, sale) => sum + Number(sale.totalCost || 0), 0)

  return (
    <div className="min-h-screen bg-[#f8f9ff] p-4 sm:p-6 text-slate-800">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Receipts</h1>
          <p className="text-sm text-slate-500">View and reprint past invoices</p>
        </div>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by receipt or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 px-4 py-2 border border-[#d7dced] rounded-lg shadow-sm text-sm outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-[#d7dced] rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Receipts</p>
          <p className="mt-1 text-2xl font-extrabold">{totalReceipts}</p>
        </div>
        <div className="p-4 bg-white border border-[#d7dced] rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Paid</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">{totalPaidCount}</p>
        </div>
        <div className="p-4 bg-white border border-[#d7dced] rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Partial / Due</p>
          <p className="mt-1 text-2xl font-extrabold text-red-600">{totalPartialDueCount}</p>
        </div>
        <div className="p-4 bg-white border border-[#d7dced] rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Amount</p>
          <p className="mt-1 text-2xl font-extrabold text-blue-600">{formatUsd(totalAmount)}</p>
        </div>
      </div>

      <div className="bg-white border border-[#d7dced] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#eff4ff] border-b border-[#d7dced]">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Receipt / Invoice</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
                <th className="px-4 py-3 font-semibold text-right text-slate-700">Total</th>
                <th className="px-4 py-3 font-semibold text-right text-slate-700">Paid</th>
                <th className="px-4 py-3 font-semibold text-right text-slate-700">Change</th>
                <th className="px-4 py-3 font-semibold text-center text-slate-700">Payment Status</th>
                <th className="px-4 py-3 font-semibold text-center text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d7dced]">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">Loading receipts...</td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">No receipts found</td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-bold text-slate-800">
                      {sale.receiptNumber || (sale.invoiceNumber ? `RCT-${sale.invoiceNumber}` : "-")}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(sale.createdAt, "DD/MMM/YYYY HH:mm")}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">{formatUsd(sale.totalCost)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">{formatUsd(sale.paidAmount)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatUsd(sale.changeAmount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded ${
                        sale.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 
                        sale.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {sale.paymentStatus || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link 
                        to={`/cashier/invoice/${sale._id}`} 
                        className="inline-flex items-center justify-center px-3 py-1.5 bg-slate-800 text-white rounded font-semibold text-xs hover:bg-slate-700 transition"
                      >
                        View Receipt
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Receipts
