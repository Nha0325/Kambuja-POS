import SalesReportChart from "../components/RevenueChart.jsx";
import { Link } from "react-router";
import { FaChartLine, FaFileInvoice, FaHandshake, FaMoneyBillTrendUp } from "react-icons/fa6";
import { IoCalendarOutline, IoReceiptOutline, IoStatsChart } from "react-icons/io5";
import useFetchData from "../hooks/useFetchData";
import useFetchGeneralReport from "../hooks/useFetchGeneralReport";
import { use30DaysAgoReport } from "../hooks/use30DaysAgoReport";
import formatDate from "../utils/formatDate";

const currency = "៛";

const formatCurrency = (value) => `${Number(value || 0).toLocaleString()} ${currency}`;

function DashboardMetric({ label, value, icon: Icon, accent = "bg-[#eff4ff] text-[#0058be]" }) {
  return (
    <div className="flex min-h-32 items-center justify-between rounded-xl border border-[#d7dced] bg-white p-5 shadow-sm transition hover:border-[#c6c6cd]">
      <div className="min-w-0">
        <p className="text-sm text-[#45464d]">{label}</p>
        <p className="mt-2 break-words text-2xl font-bold text-[#0b1c30] sm:text-3xl">{value}</p>
      </div>
      <div className={`ml-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${accent}`}>
        <Icon />
      </div>
    </div>
  );
}

function CountCard({ label, value, icon: Icon, className }) {
  return (
    <div className={`flex min-h-28 items-center justify-between rounded-xl p-5 text-white shadow-sm ${className}`}>
      <div>
        <p className="text-3xl font-bold">{value}</p>
        <p className="mt-1 text-sm font-medium opacity-90">{label}</p>
      </div>
      <Icon className="text-4xl opacity-70" />
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
      icon: FaMoneyBillTrendUp,
    },
    {
      label: "Due Invoice",
      value: formatCurrency(report?.totalDueAmountSale),
      icon: FaFileInvoice,
      accent: "bg-[#fff7ed] text-[#c2410c]",
    },
    {
      label: "Due Purchase",
      value: formatCurrency(report?.totalDueAmountPurchase),
      icon: IoReceiptOutline,
      accent: "bg-[#fef2f2] text-[#ba1a1a]",
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(report?.totalMonthlySale),
      icon: FaChartLine,
      accent: "bg-[#ecfdf5] text-[#047857]",
    },
  ];

  return (
    <div className="w-full max-w-full space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0058be]">Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold text-[#0b1c30] sm:text-3xl">General Report</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#45464d]">
            Review revenue, dues, supplier totals, and recent sales activity.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#c6c6cd] bg-white px-4 py-2 text-sm font-semibold text-[#0b1c30] transition hover:bg-[#eff4ff]"
          >
            <IoCalendarOutline />
            Today
          </button>
          <Link
            to="/admin/sales"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#0b1c30] bg-[#0b1c30] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#213145]"
          >
            <IoReceiptOutline />
            View Sales
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <DashboardMetric key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CountCard
          label="Suppliers"
          value={report?.totalSuppliers || 0}
          icon={FaHandshake}
          className="bg-[#2170e4]"
        />
        <CountCard
          label="Purchase Due Invoice"
          value={report?.totalPurchase || 0}
          icon={FaFileInvoice}
          className="bg-[#213145]"
        />
        <CountCard
          label="Sales Due Invoice"
          value={report?.totalSaleDue || 0}
          icon={IoStatsChart}
          className="bg-[#009668]"
        />
      </div>

      <div className="rounded-xl border border-[#d7dced] bg-white p-5 shadow-sm">
        <SalesReportChart data={thirtyDaysSales} isLoading={isChartLoading} />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#d7dced] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#d7dced] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#0b1c30]">Recent Sales Transactions</h2>
            <p className="text-sm text-[#45464d]">Latest invoices from the sales endpoint.</p>
          </div>
          <Link to="/admin/sales" className="text-sm font-semibold text-[#0058be] hover:underline">
            View All Sales
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-[#eff4ff] text-xs font-semibold uppercase tracking-[0.08em] text-[#5b6472]">
              <tr>
                <th className="px-5 py-3">Invoice ID</th>
                <th className="px-5 py-3">Cashier</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {isSalesLoading && (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-[#45464d]" colSpan={5}>
                    Loading recent sales...
                  </td>
                </tr>
              )}

              {!isSalesLoading && recentSales?.length === 0 && (
                <tr>
                  <td className="px-5 py-10 text-center text-sm text-[#45464d]" colSpan={5}>
                    No recent sales found.
                  </td>
                </tr>
              )}

              {!isSalesLoading &&
                recentSales?.map((sale) => (
                  <tr key={sale?._id} className="border-b border-[#e5eeff] text-sm transition hover:bg-[#f8f9ff]">
                    <td className="px-5 py-4 font-semibold uppercase text-[#0b1c30]">{sale?.invoiceNumber || "-"}</td>
                    <td className="px-5 py-4 text-[#45464d]">{sale?.user?.username || "-"}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full border border-[#d7dced] bg-[#f8f9ff] px-2.5 py-1 text-xs font-semibold capitalize text-[#213145]">
                        {sale?.paymentStatus || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#45464d]">
                      {sale?.createdAt ? formatDate(sale.createdAt, "DD/MMM/YYYY HH:mm") : "-"}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-[#0b1c30]">
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
