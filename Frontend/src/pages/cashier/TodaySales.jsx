import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { cashierService } from "../../services/cashier.service"
import formatDate from "../../utils/formatDate"

function TodaySales() {
  const [sales, setSales] = useState([])

  useEffect(() => {
    cashierService.todaySales()
      .then((response) => setSales(response.data.result || []))
  }, [])

  return (
    <section className="w-full max-w-full p-3 sm:p-4">
      <h1 className="text-xl font-semibold">Today Sales</h1>
      <div className="mt-4 overflow-x-auto border border-gray-200 bg-white">
        <table className="table min-w-[720px]">
          <thead><tr><th>Invoice</th><th>Time</th><th>Total</th><th>Payment</th><th /></tr></thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale._id}>
                <td>{sale.invoiceNumber}</td>
                <td>{formatDate(sale.createdAt)}</td>
                <td>{Number(sale.totalCost || 0).toLocaleString()} ៛</td>
                <td>{sale.paymentStatus}</td>
                <td className="text-right">
                  <Link className="btn btn-xs" to={`/cashier/invoice/${sale._id}`}>Receipt</Link>
                </td>
              </tr>
            ))}
            {sales.length === 0 && <tr><td colSpan="5" className="text-center">No sales today</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default TodaySales
