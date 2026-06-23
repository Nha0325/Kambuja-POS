import dayjs from "dayjs";
import { useSaleReport } from "../../../hooks/useSaleReport";
import { useState } from "react";
import toast from "react-hot-toast";
import { adminSurface } from "../adminPageUi";

function SaleReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]); 
  const [totalAmount, setTotalAmount] = useState(0);

  const { fetchSaleReport, isLoading } = useSaleReport();
  const paidAmount = data.reduce((sum, item) => sum + Number(item?.paidAmount || 0), 0);
  const dueAmount = data.reduce((sum, item) => sum + Number(item?.dueAmount || 0), 0);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("YYYY-MM-DD HH:mm");
  };

  const handleFilter = async (e) => {
    e.preventDefault();
    const res = await fetchSaleReport(startDate, endDate);
 
    if (res) {
      const newItems = res.result || [];
      setData(newItems); // Replace existing data with new filtered data
      // Also append to the total amount
      setTotalAmount(res.totalAmount || 0); // Set total amount to the new filtered total
      toast.success("Filtered Successfully!");
    } else {
      // Error is already handled by toast in useSaleReport hook
    }
  };

  return (
    <div className={adminSurface.page}>
        <div className={adminSurface.header}>
          <div>
            <p className={adminSurface.eyebrow}>Reports</p>
            <h1 className={adminSurface.title}>Sale Report</h1>
            <p className={adminSurface.description}>
              Filter sales by date range and review invoice totals, payment status, and cashier activity.
            </p>
          </div>
        </div>

        <div className={adminSurface.statGrid}>
          {[
            ["Sales", data.length],
            ["Total amount", `$${Number(totalAmount || 0).toFixed(2)}`],
            ["Paid amount", `$${Number(paidAmount || 0).toFixed(2)}`],
            ["Due amount", `$${Number(dueAmount || 0).toFixed(2)}`],
          ].map(([label, value]) => (
            <div key={label} className={adminSurface.statCard}>
              <div className={adminSurface.statIcon}>{String(label).slice(0, 1)}</div>
              <p className={`mt-4 ${adminSurface.statLabel}`}>{label}</p>
              <p className="mt-3 truncate text-2xl font-bold text-[#0b1c30]">{value}</p>
            </div>
          ))}
        </div>

        <div className={adminSurface.card}>
          <form onSubmit={handleFilter} className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">
            <div className="min-w-0">
              <label htmlFor="sale-report-startDate" className="mb-2 block text-sm font-semibold text-[#0b1c30]">
                Start Date
              </label>
              <input
                id="sale-report-startDate"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`${adminSurface.input} h-12 w-full lg:w-56`}
                required
              />
            </div>
            <div className="min-w-0">
              <label htmlFor="sale-report-endDate" className="mb-2 block text-sm font-semibold text-[#0b1c30]">
                End Date
              </label>
              <input
                id="sale-report-endDate"
                name="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`${adminSurface.input} h-12 w-full lg:w-56`}
                required
              />
            </div>
            <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
              <button disabled={isLoading} className={`${adminSurface.primaryButton} flex-1 lg:w-24 lg:flex-none`}>
                {isLoading ? "..." : "Filter"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setData([]);
                  setTotalAmount(0);
                  setEndDate("");
                  setStartDate("");
                }}
                className="btn min-h-11 flex-1 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 hover:bg-red-100 lg:w-24 lg:flex-none"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className={adminSurface.tableShell}>
          <div className={adminSurface.toolbar}>
            <p className="text-sm font-semibold text-[#0b1c30]">Sale results</p>
            <p className="mt-1 text-xs text-[#5b6472]">{data.length} row(s) displayed</p>
          </div>
          <div className={adminSurface.tableWrap}>
            <table className={`${adminSurface.table} min-w-[1080px]`}>
              <thead className={adminSurface.tableHead}>
                <tr>
                  <th className={adminSurface.th}>N.o</th>
                  <th className={adminSurface.th}>Invoice</th>
                  <th className={adminSurface.th}>Sale By</th>
                  <th className={adminSurface.th}>Total Cost</th>
                  <th className={adminSurface.th}>Paid Amount</th>
                  <th className={adminSurface.th}>Due Amount</th>
                  <th className={adminSurface.th}>Change Amount</th>
                  <th className={adminSurface.th}>Payment Status</th>
                  <th className={adminSurface.th}>Created Date</th>
                </tr>
              </thead>

              {data?.length > 0 && (
                <tbody>
                  {data?.map((item, index) => (
                    <tr key={index} className={adminSurface.row}>
                      <td className={adminSurface.td}>{index + 1}</td>
                      <td className={`${adminSurface.td} font-semibold text-[#0b1c30]`}>{item?.invoiceNumber}</td>
                      <td className={`${adminSurface.td} capitalize text-[#45464d]`}>{item?.user?.username}</td>
                      <td className={`${adminSurface.td} font-semibold text-red-600`}>
                        ${Number(item?.totalCost || 0).toFixed(2)}
                      </td>
                      <td className={`${adminSurface.td} font-semibold text-red-600`}>
                        ${Number(item?.paidAmount || 0).toFixed(2)}
                      </td>
                      <td className={`${adminSurface.td} font-semibold text-red-600`}>
                        ${Number(item?.dueAmount || 0).toFixed(2)}
                      </td>
                      <td className={`${adminSurface.td} font-semibold text-red-600`}>
                        ${Number(item?.changeAmount || 0).toFixed(2)}
                      </td>
                      <td className={adminSurface.td}>
                        <span
                          className={`
                                    text-xs font-medium me-2 px-2.5 py-0.5 rounded uppercase
                                    ${
                                      item?.paymentStatus == "paid" &&
                                      "bg-green-100 text-green-800"
                                    }
                                    ${
                                      item?.paymentStatus == "due" &&
                                      "bg-red-100 text-red-800"
                                    }
                                    ${
                                      item?.paymentStatus == "partial" &&
                                      "bg-yellow-100 text-yellow-800"
                                    }
                                    ${
                                      item?.paymentStatus == "overpaid" &&
                                      "bg-blue-100 text-blue-800"
                                    }
                                `}
                        >
                          {item.paymentStatus}
                        </span>
                      </td>
                      <td className={`${adminSurface.td} text-[#45464d]`}>{formatDate(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              )}

              {data?.length <= 0 && (
                <tbody>
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-sm text-[#5b6472]">
                      No Data!
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
          <div className={adminSurface.footer}>
            <h1 className="text-sm font-semibold text-[#0b1c30]">
              Total Amount:{" "}
              <span className="text-red-500 font-semibold">${Number(totalAmount || 0).toFixed(2)}
              </span>
            </h1>
          </div>
        </div>
      </div>
  );
}

export default SaleReport;
