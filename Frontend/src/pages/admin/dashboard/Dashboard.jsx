import SalesReportChart from "../../../components/dashboard/RevenueChart.jsx";
import { Link } from "react-router";
import { 
  LuBanknote, 
  LuFileText, 
  LuTrendingUp, 
  LuTruck, 
  LuShoppingCart, 
  LuPackage, 
  LuTriangleAlert,
  LuCalendar,
  LuListChecks
} from "react-icons/lu";
import useFetchData from "../../../hooks/common/useFetchData";
import useFetchGeneralReport from "../../../hooks/reports/useFetchGeneralReport";
import { use30DaysAgoReport } from "../../../hooks/reports/use30DaysAgoReport";
import formatDate from "../../../utils/formatters/formatDate";

const currency = "$";
const formatCurrency = (value) => `${currency}${Number(value || 0).toFixed(2)}`;

function DashboardMetric({ label, value, icon: Icon, accentClass = "bg-violet-100 dark:bg-blue-50 text-violet-600 dark:text-[#3350BF]" }) {
  return (
    <div className="flex min-h-[120px] items-center justify-between rounded-2xl border border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#1A1D22] p-5 shadow-sm transition hover:shadow-md dark:hover:shadow-lg dark:shadow-black/10">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500 dark:text-[#A9A6BB]">{label}</p>
        <p className="mt-2 break-words text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] sm:text-3xl">{value}</p>
      </div>
      <div className={`ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accentClass}`}>
        <Icon size={24} />
      </div>
    </div>
  );
}

function GradientCard({ label, value, icon: Icon }) {
  return (
    <div className="flex min-h-[120px] items-center justify-between rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 dark:from-[#3350BF] dark:to-[#AF68E0] p-6 text-white shadow-md dark:shadow-lg dark:shadow-[#3350BF]/20 relative overflow-hidden">
      <div className="relative z-10">
        <p className="text-sm font-medium opacity-90">{label}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </div>
      <Icon size={48} className="absolute right-4 bottom-4 opacity-20 rotate-[-10deg]" />
    </div>
  );
}

function Home() {
  const { data: report } = useFetchGeneralReport();
  const { data: thirtyDaysSales, isLoading: isChartLoading } = use30DaysAgoReport();
  const { data: recentSales, isLoading: isSalesLoading } = useFetchData("sales", 1, 5, "");

  const metrics = [
    {
      label: "Today Revenue",
      value: formatCurrency(report?.totalSaleToday),
      icon: LuTrendingUp,
      accentClass: "bg-violet-100 text-violet-600 dark:bg-[#3350BF]/10 dark:text-[#22D3EE]",
    },
    {
      label: "Due Invoices (Sale)",
      value: formatCurrency(report?.totalDueAmountSale),
      icon: LuFileText,
      accentClass: "bg-amber-100 text-amber-600 dark:bg-[#F59E0B]/10 dark:text-[#F59E0B]",
    },
    {
      label: "Due Purchases",
      value: formatCurrency(report?.totalDueAmountPurchase),
      icon: LuShoppingCart,
      accentClass: "bg-red-100 text-red-600 dark:bg-[#EF4444]/10 dark:text-[#EF4444]",
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(report?.totalMonthlySale),
      icon: LuBanknote,
      accentClass: "bg-green-100 text-green-600 dark:bg-[#22C55E]/10 dark:text-[#22C55E]",
    },
  ];

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC] sm:text-3xl">Dashboard</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-[#A9A6BB]">
            Platform overview, daily metrics, and recent sales activity.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#1A1D22] px-5 text-sm font-semibold text-slate-700 dark:text-[#F8FAFC] transition hover:bg-slate-50 dark:hover:bg-[#2A2E36] shadow-sm"
          >
            <LuCalendar size={18} /> Today
          </button>
          <Link
            to="/admin/sales"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 dark:bg-[#3350BF] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 dark:hover:bg-[#253A8F]"
          >
            <LuListChecks size={18} /> View Sales
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <DashboardMetric key={metric.label} {...metric} />
        ))}
      </div>

      {/* Secondary Metrics / Gradients */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GradientCard
          label="Total Suppliers"
          value={report?.totalSuppliers || 0}
          icon={LuTruck}
        />
        <div className="flex min-h-[120px] items-center justify-between rounded-2xl bg-white dark:bg-[#1A1D22] p-6 text-slate-900 dark:text-white shadow-sm dark:shadow-lg relative overflow-hidden border border-slate-200 dark:border-[#2A2E36]">
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 dark:text-[#A9A6BB]">Products in System</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-[#F8FAFC]">{report?.totalProducts || 0}</p>
          </div>
          <LuPackage size={48} className="absolute right-4 bottom-4 opacity-10 rotate-[10deg] text-violet-500 dark:text-[#22D3EE]" />
        </div>
        <div className="flex min-h-[120px] items-center justify-between rounded-2xl bg-white dark:bg-[#1A1D22] p-6 text-slate-900 dark:text-white shadow-sm dark:shadow-lg relative overflow-hidden border border-slate-200 dark:border-[#2A2E36]">
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 dark:text-[#A9A6BB]">Low Stock Alerts</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-bold text-amber-500 dark:text-[#F59E0B]">{report?.lowStock || 0}</p>
              <span className="text-sm text-slate-400 dark:text-[#6B7280]">items</span>
            </div>
          </div>
          <LuTriangleAlert size={48} className="absolute right-4 bottom-4 opacity-10 text-amber-500 dark:text-[#F59E0B]" />
        </div>
      </div>

      {/* Chart Section */}
      <div className="w-full min-w-0 overflow-x-auto rounded-2xl border border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#1A1D22] p-6 shadow-sm">
        <div className="min-w-[700px]">
          <SalesReportChart data={thirtyDaysSales} isLoading={isChartLoading} />
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#1A1D22] shadow-sm dark:shadow-lg dark:shadow-black/10">
        <div className="flex flex-col gap-3 border-b border-slate-200 dark:border-[#2A2E36] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">Recent Sales Transactions</h2>
            <p className="text-sm text-slate-500 dark:text-[#A9A6BB]">Latest invoices generated from POS.</p>
          </div>
          <Link to="/admin/sales" className="text-sm font-semibold text-violet-600 dark:text-[#22D3EE] hover:underline">
            View All Sales
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 dark:bg-[#111318] text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#6B7280]">
              <tr>
                <th className="px-5 py-4 border-b border-slate-200 dark:border-[#2A2E36]">Invoice ID</th>
                <th className="px-5 py-4 border-b border-slate-200 dark:border-[#2A2E36]">Cashier</th>
                <th className="px-5 py-4 border-b border-slate-200 dark:border-[#2A2E36]">Status</th>
                <th className="px-5 py-4 border-b border-slate-200 dark:border-[#2A2E36]">Date</th>
                <th className="px-5 py-4 border-b border-slate-200 dark:border-[#2A2E36] text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2A2E36]">
              {isSalesLoading && (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-500 dark:text-[#A9A6BB]" colSpan={5}>
                    Loading recent sales...
                  </td>
                </tr>
              )}

              {!isSalesLoading && recentSales?.length === 0 && (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-500 dark:text-[#4E4E50]" colSpan={5}>
                    No recent sales found.
                  </td>
                </tr>
              )}

              {!isSalesLoading &&
                recentSales?.map((sale) => (
                  <tr key={sale?._id} className="transition-colors hover:bg-slate-50 dark:hover:bg-[#22262D]">
                    <td className="px-5 py-4 font-semibold uppercase text-slate-900 dark:text-[#F8FAFC]">{sale?.invoiceNumber || "-"}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-[#A9A6BB]">{sale?.user?.username || "-"}</td>
                    <td className="px-5 py-4">
                      {sale?.paymentStatus?.toLowerCase() === 'paid' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-[#22C55E]/10 px-2.5 py-1 text-xs font-semibold text-green-700 dark:text-[#22C55E] border border-green-200 dark:border-[#22C55E]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-[#22C55E]"></span> Paid
                        </span>
                      ) : sale?.paymentStatus?.toLowerCase() === 'partial' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-[#F59E0B]/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-[#F59E0B] border border-amber-200 dark:border-[#F59E0B]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-[#F59E0B]"></span> Partial
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-[#EF4444]/10 px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-[#EF4444] border border-red-200 dark:border-[#EF4444]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-[#EF4444]"></span> Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-[#A9A6BB]">
                      {sale?.createdAt ? formatDate(sale.createdAt, "DD MMM, YYYY HH:mm") : "-"}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-[#F8FAFC]">
                      {formatCurrency(sale?.totalCost)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Home;
