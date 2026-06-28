import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { cashierService } from "../../services/users/cashier.service"
import formatDate from "../../utils/formatters/formatDate"
import useCurrent from "../../hooks/auth/useCurrent"

function TodaySales() {
  const { data: user } = useCurrent()
  const formatUsd = (value) => `$${Number(value || 0).toFixed(2)}`
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSales = useCallback(() => {
    cashierService.todaySales().then((response) => {
      setSales(response.data?.result || [])
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    fetchSales()
    const interval = setInterval(fetchSales, 10000)
    return () => clearInterval(interval)
  }, [fetchSales])

  const totalSalesCount = sales.length
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalCost || 0), 0)
  const totalPaid = sales.reduce((sum, sale) => sum + (sale.paidAmount || 0), 0)
  const totalDue = sales.reduce((sum, sale) => sum + (sale.dueAmount || 0), 0)

  return (
    <section className="w-full max-w-full p-4 sm:p-6 bg-[#f8f9ff] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Today/Shift Sales</h1>
          {user?.username && <p className="text-sm text-slate-500">Cashier: <span className="font-semibold capitalize">{user.username}</span></p>}
        </div>
        <button 
          onClick={() => { setLoading(true); fetchSales(); }} 
          className="px-4 py-2 bg-white border border-[#d7dced] rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white border border-[#d7dced] rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Sales</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalSalesCount}</p>
        </div>
        <div className="p-4 bg-white border border-[#d7dced] rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Revenue</p>
          <p className="text-2xl font-bold text-[#0058be] mt-1">{formatUsd(totalRevenue)}</p>
        </div>
        <div className="p-4 bg-white border border-[#d7dced] rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Paid Amount</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatUsd(totalPaid)}</p>
        </div>
        <div className="p-4 bg-white border border-[#d7dced] rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Due Amount</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{formatUsd(totalDue)}</p>
        </div>
      </div>

      <div className="bg-white border border-[#d7dced] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-[#d7dced] text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Due</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d7dced]">
              {sales.map((sale) => (
                <tr key={sale._id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-800">{sale.invoiceNumber}</td>
                  <td className="px-4 py-3">{formatDate(sale.createdAt, "HH:mm")}</td>
                  <td className="px-4 py-3 text-center">{sale.items?.length || 0}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatUsd(sale.totalCost)}</td>
                  <td className="px-4 py-3 text-right text-green-600">{formatUsd(sale.paidAmount)}</td>
                  <td className="px-4 py-3 text-right text-red-500">{formatUsd(sale.dueAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                      sale.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 
                      sale.paymentStatus === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {sale.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link className="inline-flex items-center justify-center px-3 py-1 bg-white border border-[#d7dced] rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 transition" to={`/cashier/invoice/${sale._id}`}>Receipt</Link>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-500">No sales today</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default TodaySales
