import SalesReportChart from "../../../components/dashboard/RevenueChart.jsx";
import { Link } from "react-router";
import { 
  LuBanknote, 
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
import { useTranslation } from "react-i18next";

const currency = "$";
const formatCurrency = (value) => `${currency}${Number(value || 0).toFixed(2)}`;

function DashboardMetric({ label, value, icon: Icon, accentClass = "bg-cyan-100 dark:bg-blue-50 text-cyan-600 dark:text-[#06b6d4]" }) {
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
    <div className="flex min-h-[120px] items-center justify-between rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 dark:from-[#06b6d4] dark:to-[#AF68E0] p-6 text-white shadow-md dark:shadow-lg dark:shadow-[#06b6d4]/20 relative overflow-hidden">
      <div className="relative z-10">
        <p className="text-sm font-medium opacity-90">{label}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </div>
      <Icon size={48} className="absolute right-4 bottom-4 opacity-20 rotate-[-10deg]" />
    </div>
  );
}

function Home() {
  const { t } = useTranslation();
  const { data: report } = useFetchGeneralReport();
  const { data: thirtyDaysSales, isLoading: isChartLoading } = use30DaysAgoReport();
  const { data: recentSales, isLoading: isSalesLoading } = useFetchData("sales", 1, 5, "");

  const metrics = [
    {
      label: t('today_revenue'),
      value: formatCurrency(report?.totalSaleToday),
      icon: LuTrendingUp,
      accentClass: "bg-cyan-100 text-cyan-600 dark:bg-[#06b6d4]/10 dark:text-[#06b6d4]",
    },
    {
      label: t('due_purchases'),
      value: formatCurrency(report?.totalDueAmountPurchase),
      icon: LuShoppingCart,
      accentClass: "bg-red-100 text-red-600 dark:bg-[#EF4444]/10 dark:text-[#EF4444]",
    },
    {
      label: t('monthly_revenue'),
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC] sm:text-3xl">{t('dashboard')}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-[#A9A6BB]">
            {t('dashboard_desc')}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#1A1D22] px-5 text-sm font-semibold text-slate-700 dark:text-[#F8FAFC] transition hover:bg-slate-50 dark:hover:bg-[#2A2E36] shadow-sm"
          >
            <LuCalendar size={18} /> {t('today')}
          </button>
          <Link
            to="/admin/sales"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-600 dark:bg-[#06b6d4] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 dark:hover:bg-[#253A8F]"
          >
            <LuListChecks size={18} /> {t('view_sales')}
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <DashboardMetric key={metric.label} {...metric} />
        ))}
      </div>

      {/* Secondary Metrics / Gradients */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GradientCard
          label={t('total_suppliers')}
          value={report?.totalSuppliers || 0}
          icon={LuTruck}
        />
        <div className="flex min-h-[120px] items-center justify-between rounded-2xl bg-white dark:bg-[#1A1D22] p-6 text-slate-900 dark:text-white shadow-sm dark:shadow-lg relative overflow-hidden border border-slate-200 dark:border-[#2A2E36]">
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 dark:text-[#A9A6BB]">{t('products_in_system')}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-[#F8FAFC]">{report?.totalProducts || 0}</p>
          </div>
          <LuPackage size={48} className="absolute right-4 bottom-4 opacity-10 rotate-[10deg] text-cyan-500 dark:text-[#06b6d4]" />
        </div>
        <div className="flex min-h-[120px] items-center justify-between rounded-2xl bg-white dark:bg-[#1A1D22] p-6 text-slate-900 dark:text-white shadow-sm dark:shadow-lg relative overflow-hidden border border-slate-200 dark:border-[#2A2E36]">
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 dark:text-[#A9A6BB]">{t('low_stock_alerts')}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-bold text-amber-500 dark:text-[#F59E0B]">{report?.lowStock || 0}</p>
              <span className="text-sm text-slate-400 dark:text-[#6B7280]">{t('items')}</span>
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
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">{t('recent_sales_transactions')}</h2>
            <p className="text-sm text-slate-500 dark:text-[#A9A6BB]">{t('recent_sales_desc')}</p>
          </div>
          <Link to="/admin/sales" className="text-sm font-semibold text-cyan-600 dark:text-[#06b6d4] hover:underline">
            {t('view_all_sales')}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 dark:bg-[#111318] text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#6B7280]">
              <tr>
                <th className="px-5 py-4 border-b border-slate-200 dark:border-[#2A2E36]">{t('invoice_id')}</th>
                <th className="px-5 py-4 border-b border-slate-200 dark:border-[#2A2E36]">{t('cashier')}</th>
                <th className="px-5 py-4 border-b border-slate-200 dark:border-[#2A2E36]">{t('date')}</th>
                <th className="px-5 py-4 border-b border-slate-200 dark:border-[#2A2E36] text-right">{t('amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2A2E36]">
              {isSalesLoading && (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-500 dark:text-[#A9A6BB]" colSpan={4}>
                    {t('loading_recent_sales')}
                  </td>
                </tr>
              )}

              {!isSalesLoading && recentSales?.length === 0 && (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-500 dark:text-[#4E4E50]" colSpan={4}>
                    {t('no_recent_sales')}
                  </td>
                </tr>
              )}

              {!isSalesLoading &&
                recentSales?.map((sale) => (
                  <tr key={sale?._id} className="transition-colors hover:bg-slate-50 dark:hover:bg-[#22262D]">
                    <td className="px-5 py-4 font-semibold uppercase text-slate-900 dark:text-[#F8FAFC]">{sale?.invoiceNumber || "-"}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-[#A9A6BB]">{sale?.user?.username || "-"}</td>
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
