import dayjs from "dayjs";
import { useSaleReport } from "../../../hooks/reports/useSaleReport";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { adminSurface } from "../adminPageUi";

function SaleReport() {
  const [startDate, setStartDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [data, setData] = useState([]); 
  const [totalAmount, setTotalAmount] = useState(0);

  const { fetchSaleReport, isLoading } = useSaleReport();
  
  // Load today's sales automatically on component mount
  useEffect(() => {
    let isMounted = true;
    const loadInitial = async () => {
      const res = await fetchSaleReport(dayjs().format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD"));
      if (res && isMounted) {
        setData(res.result || []);
        setTotalAmount(res.totalAmount || 0);
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

        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 w-full">
          {/* Date Filters - Top Left */}
          <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
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
          <div className="flex gap-2 w-full sm:w-auto">
            <button disabled={isLoading} className={`${adminSurface.primaryButton} flex-1 sm:flex-none`}>
              {isLoading ? "..." : "Filter"}
            </button>
            <button
              type="button"
              onClick={() => {
                setData([]);
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

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {[
              ["Sales", data.length],
              ["Total amount", `$${Number(totalAmount || 0).toFixed(2)}`],
            ].map(([label, value]) => (
              <div key={label} className={`${adminSurface.statCard} flex-1 sm:w-48 lg:w-56`}>
                <div className={adminSurface.statIcon}>{String(label).slice(0, 1)}</div>
                <p className={`mt-4 ${adminSurface.statLabel}`}>{label}</p>
                <p className="mt-3 truncate text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">{value}</p>
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
      </div>
  );
}

export default SaleReport;
