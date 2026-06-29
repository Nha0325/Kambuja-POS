import dayjs from "dayjs";
import { useSaleReport } from "../../../hooks/reports/useSaleReport";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { adminSurface } from "../adminPageUi";

function SaleReport() {
  const [startDate, setStartDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [data, setData] = useState([]); 
  const [shifts, setShifts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const totalDifference = shifts.reduce((sum, shift) => sum + Number(shift.difference || 0), 0);
  const totalExpected = shifts.reduce((sum, shift) => sum + Number(shift.cashExpected || 0), 0);
  const totalCounted = shifts.reduce((sum, shift) => sum + Number(shift.cashCounted || 0), 0);
  
  const { fetchSaleReport, isLoading } = useSaleReport();
  
  // Load today's sales automatically on component mount
  useEffect(() => {
    let isMounted = true;
    const loadInitial = async () => {
      const res = await fetchSaleReport(dayjs().format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD"));
      if (res && isMounted) {
        setData(res.result || []);
        setTotalAmount(res.totalAmount || 0);
        setShifts(res.shifts || []);
      }
    };
    loadInitial();
    return () => { isMounted = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("YYYY-MM-DD HH:mm");
  };

  const handleFilter = async (e) => {
    e.preventDefault();
    const res = await fetchSaleReport(startDate, endDate);
 
    if (res) {
      const newItems = res.result || [];
      setData(newItems);
      setTotalAmount(res.totalAmount || 0);
      setShifts(res.shifts || []);
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

        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 w-full">
          {/* Date Filters - Top Left */}
          <form onSubmit={handleFilter} className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-3 w-full lg:w-auto">
          <div className="min-w-0 w-full sm:w-auto">
            <label htmlFor="sale-report-startDate" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#6B7280]">
              Start Date
            </label>
            <input
              id="sale-report-startDate"
              name="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`${adminSurface.input} w-full sm:w-48`}
              required
            />
          </div>
          <div className="min-w-0 w-full sm:w-auto">
            <label htmlFor="sale-report-endDate" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#6B7280]">
              End Date
            </label>
            <input
              id="sale-report-endDate"
              name="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`${adminSurface.input} w-full sm:w-48`}
              required
            />
          </div>
          <div className="flex gap-2 w-full col-span-2 sm:col-span-1 sm:w-auto mt-2 sm:mt-0">
            <button disabled={isLoading} className={`${adminSurface.primaryButton} flex-1 sm:flex-none`}>
              {isLoading ? "..." : "Filter"}
            </button>
            <button
              type="button"
              onClick={() => {
                setData([]);
                setShifts([]);
                setTotalAmount(0);
                setEndDate(dayjs().format("YYYY-MM-DD"));
                setStartDate(dayjs().format("YYYY-MM-DD"));
              }}
              className={`${adminSurface.secondaryButton} flex-1 sm:flex-none text-red-600 hover:text-red-700 dark:text-red-500`}
            >
              Clear
            </button>
          </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full lg:w-auto">
            {[
              ["Sales", data.length, "", "🧾"],
              ["Total Amount", `$${Number(totalAmount || 0).toFixed(2)}`, "", "💰"],
              ["Shift Diff", `${totalDifference > 0 ? '+' : ''}$${totalDifference.toFixed(2)}`, totalDifference < 0 ? "text-red-500" : totalDifference > 0 ? "text-green-500" : "", "⚖️"],
            ].map(([label, value, colorClass, icon]) => (
              <div key={label} className={`${adminSurface.statCard} w-full sm:w-48 lg:w-56 p-4 sm:p-6`}>
                <div className={adminSurface.statIcon}>{icon}</div>
                <p className={`mt-4 ${adminSurface.statLabel}`}>{label}</p>
                <p className={`mt-3 truncate text-2xl font-bold ${colorClass || "text-slate-900 dark:text-[#F8FAFC]"}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>



        <div className={adminSurface.tableShell}>
          <div className={adminSurface.toolbar}>
            <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">Sale results</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#A9A6BB]">{data.length} row(s) displayed</p>
          </div>
          <div className={adminSurface.tableWrap}>
            <table className={`${adminSurface.table} min-w-[1080px]`}>
              <thead className={adminSurface.tableHead}>
                <tr>
                  <th className={adminSurface.th}>N.o</th>
                  <th className={adminSurface.th}>Invoice</th>
                  <th className={adminSurface.th}>Sale By</th>
                  <th className={adminSurface.th}>Total Cost</th>
                  <th className={adminSurface.th}>Created Date</th>
                </tr>
              </thead>

              {data?.length > 0 && (
                <tbody>
                  {data?.map((item, index) => (
                    <tr key={index} className={adminSurface.row}>
                      <td className={adminSurface.td}>{index + 1}</td>
                      <td className={`${adminSurface.td} font-semibold text-slate-900 dark:text-[#F8FAFC]`}>{item?.invoiceNumber}</td>
                      <td className={`${adminSurface.td} capitalize text-slate-700 dark:text-[#A9A6BB]`}>{item?.user?.username}</td>
                      <td className={`${adminSurface.td} font-semibold text-red-600 dark:text-red-500`}>
                        ${Number(item?.totalCost || 0).toFixed(2)}
                      </td>
                      <td className={`${adminSurface.td} text-slate-700 dark:text-[#A9A6BB]`}>{formatDate(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              )}

              {data?.length <= 0 && (
                <tbody>
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-slate-500 dark:text-[#A9A6BB]">
                      No Data!
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
          <div className={`${adminSurface.footer} justify-end sm:justify-end`}>
            <h1 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] text-right w-full">
              Total Amount:{" "}
              <span className="text-red-500 font-semibold">${Number(totalAmount || 0).toFixed(2)}
              </span>
            </h1>
          </div>
        </div>

        {/* SHIFT CLOSURES TABLE */}
        <div className={`${adminSurface.tableShell} mt-8`}>
          <div className={adminSurface.toolbar}>
            <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">Shift Closures</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#A9A6BB]">Cashier shift balances and differences</p>
          </div>
          <div className={adminSurface.tableWrap}>
            <table className={`${adminSurface.table} min-w-[900px]`}>
              <thead className={adminSurface.tableHead}>
                <tr>
                  <th className={adminSurface.th}>Cashier</th>
                  <th className={adminSurface.th}>Status</th>
                  <th className={adminSurface.th}>Sales</th>
                  <th className={adminSurface.th}>Expected Cash</th>
                  <th className={adminSurface.th}>Counted Cash</th>
                  <th className={adminSurface.th}>Difference</th>
                  <th className={adminSurface.th}>Note</th>
                  <th className={adminSurface.th}>Closed At</th>
                </tr>
              </thead>
              <tbody>
                {shifts?.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-500 dark:text-[#A9A6BB]">
                      No shift closures found for this date range.
                    </td>
                  </tr>
                ) : (
                  shifts?.map((shift, i) => {
                    const diff = Number(shift.difference || 0);
                    const isShortage = diff < 0;
                    const isSurplus = diff > 0;
                    return (
                    <tr key={i} className={`${adminSurface.row} ${isShortage ? 'bg-red-50 dark:bg-red-500/5' : ''}`}>
                      <td className={`${adminSurface.td} font-medium text-slate-900 dark:text-[#F8FAFC]`}>
                        {shift.cashier?.username || "-"}
                      </td>
                      <td className={adminSurface.td}>
                        <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold tracking-wider ${shift.status === 'CLOSED' ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400'}`}>
                          {shift.status}
                        </span>
                      </td>
                      <td className={adminSurface.td}>{shift.salesCount || 0}</td>
                      <td className={adminSurface.td}>${Number(shift.cashExpected || 0).toFixed(2)}</td>
                      <td className={adminSurface.td}>${Number(shift.cashCounted || 0).toFixed(2)}</td>
                      <td className={adminSurface.td}>
                        <span className={`inline-flex items-center gap-1 font-bold text-sm ${isShortage ? 'text-red-600 dark:text-red-400' : isSurplus ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {isShortage && <span className="text-[10px] font-bold bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded">⚠ SHORTAGE</span>}
                          {isSurplus && <span className="text-[10px] font-bold bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded">SURPLUS</span>}
                          {diff > 0 ? '+' : ''}${Math.abs(diff).toFixed(2)}
                        </span>
                      </td>
                      <td className={adminSurface.td}>{shift.note || "-"}</td>
                      <td className={adminSurface.td}>{formatDate(shift.closedAt)}</td>
                    </tr>
                    );
                  })
                )}
              </tbody>
              {shifts?.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <td colSpan="3" className={`${adminSurface.td} font-bold text-slate-700 dark:text-slate-300`}>Total</td>
                    <td className={`${adminSurface.td} font-bold text-slate-900 dark:text-[#F8FAFC]`}>${totalExpected.toFixed(2)}</td>
                    <td className={`${adminSurface.td} font-bold text-slate-900 dark:text-[#F8FAFC]`}>${totalCounted.toFixed(2)}</td>
                    <td className={adminSurface.td}>
                      <span className={`font-bold text-sm ${totalDifference < 0 ? 'text-red-600 dark:text-red-400' : totalDifference > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-600'}`}>
                        {totalDifference > 0 ? '+' : ''}${Math.abs(totalDifference).toFixed(2)}
                      </span>
                    </td>
                    <td colSpan="2" className={adminSurface.td}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

      </div>
  );
}

export default SaleReport;
