import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { cashierService } from "../../services/users/cashier.service"
import formatDate from "../../utils/formatters/formatDate"
import useCurrent from "../../hooks/auth/useCurrent"
import { useTranslation } from "react-i18next";

function TodaySales() {
  const { t } = useTranslation();
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

  return (
    <section className="w-full max-w-full p-4 sm:p-6 bg-[#f8f9ff] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('today_shift_sales')}</h1>
          {user?.username && <p className="text-sm text-slate-500">{t('cashier')}: <span className="font-semibold capitalize">{user.username}</span></p>}
        </div>
        <button 
          onClick={() => { setLoading(true); fetchSales(); }} 
          className="px-4 py-2 bg-white border border-[#d7dced] rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          {loading ? t('refreshing') : t('refresh')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white border border-[#d7dced] rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">{t('total_sales')}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalSalesCount}</p>
        </div>
        <div className="p-4 bg-white border border-[#d7dced] rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">{t('total_revenue')}</p>
          <p className="text-2xl font-bold text-[#0058be] mt-1">{formatUsd(totalRevenue)}</p>
        </div>
      </div>

      <div className="bg-white border border-[#d7dced] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-[#d7dced] text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-4 py-3">{t('invoice_id')}</th>
                <th className="px-4 py-3">{t('time')}</th>
                <th className="px-4 py-3 text-center">{t('items')}</th>
                <th className="px-4 py-3 text-right">{t('total')}</th>
                <th className="px-4 py-3 text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d7dced]">
              {sales.map((sale) => (
                <tr key={sale._id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-800">{sale.invoiceNumber}</td>
                  <td className="px-4 py-3">{formatDate(sale.createdAt, "HH:mm")}</td>
                  <td className="px-4 py-3 text-center">{sale.items?.length || 0}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatUsd(sale.totalCost)}</td>
                  <td className="px-4 py-3 text-center">
                    <Link className="inline-flex items-center justify-center px-3 py-1 bg-white border border-[#d7dced] rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 transition" to={`/cashier/invoice/${sale._id}`}>{t('receipt')}</Link>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">{t('no_sales_today')}</td>
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
