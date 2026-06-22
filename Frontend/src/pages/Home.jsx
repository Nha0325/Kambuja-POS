import SalesReportChart from "../components/RevenueChart.jsx";
import { FaFileInvoice, FaHandshake } from "react-icons/fa6";
import useFetchGeneralReport from "../hooks/useFetchGeneralReport";
import { use30DaysAgoReport } from "../hooks/use30DaysAgoReport";

function Home() {
  const { data } = useFetchGeneralReport();
  const { data: thirtyDaysSales, isLoading: isChartLoading } = use30DaysAgoReport();
  const currency = "៛";

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold capitalize">General Report</h1>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="bg-white flex justify-between items-start p-3 shadow-sm rounded-lg py-5">
          <div className="space-y-1">
            <p className="text-sm text-slate-600">Today Revenue</p>
            <h2 className="text-3xl font-semibold">
              {data?.totalSaleToday?.toLocaleString() || 0} {currency}
            </h2>
          </div>
          <div className="p-2 bg-slate-200/30 rounded-full">
            <span className="text-3xl font-bold text-slate-700">{currency}</span>
          </div>
        </div>

        <div className="bg-white flex justify-between items-start p-3 shadow-sm rounded-lg py-5">
          <div className="space-y-1">
            <p className="text-sm text-slate-600">Due Invoice</p>
            <h2 className="text-3xl font-semibold">
              {data?.totalDueAmountSale?.toLocaleString() || 0} {currency}
            </h2>
          </div>
          <div className="p-2 bg-slate-200/30 rounded-full">
            <span className="text-3xl font-bold text-slate-700">{currency}</span>
          </div>
        </div>

        <div className="bg-white flex justify-between items-start p-3 shadow-sm rounded-lg py-5">
          <div className="space-y-1">
            <p className="text-sm text-slate-600">Due Purchase</p>
            <h2 className="text-3xl font-semibold">
              {data?.totalDueAmountPurchase?.toLocaleString() || 0} {currency}
            </h2>
          </div>
          <div className="p-2 bg-slate-200/30 rounded-full">
            <span className="text-3xl font-bold text-slate-700">{currency}</span>
          </div>
        </div>

        <div className="bg-white flex justify-between items-start p-3 shadow-sm rounded-lg py-5">
          <div className="space-y-1">
            <p className="text-sm text-slate-600">Monthly Revenue</p>
            <h2 className="text-3xl font-semibold">
              {data?.totalMonthlySale?.toLocaleString() || 0} {currency}
            </h2>
          </div>
          <div className="p-2 bg-slate-200/30 rounded-full">
            <span className="text-3xl font-bold text-slate-700">{currency}</span>
          </div>
        </div>

        <div className="bg-blue-400 text-white flex justify-between items-start p-3 shadow-sm rounded-lg py-5">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold">{data?.totalSuppliers || 0}</h2>
            <p className="text-sm font-semibold">Suppliers</p>
          </div>
          <div className="p-2">
            <span className="text-3xl">
              <FaHandshake />
            </span>
          </div>
        </div>

        <div className="bg-slate-700 text-white flex justify-between items-start p-3 shadow-sm rounded-lg py-5">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold">{data?.totalPurchase || 0}</h2>
            <p className="text-sm font-semibold">Purchase Due Invoice</p>
          </div>
          <div className="p-2">
            <span className="text-3xl">
              <FaFileInvoice />
            </span>
          </div>
        </div>

        <div className="bg-green-400 text-white flex justify-between items-start p-3 shadow-sm rounded-lg py-5">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold">{data?.totalSaleDue || 0}</h2>
            <p className="text-sm font-semibold">Sales Due Invoice</p>
          </div>
          <div className="p-2">
            <span className="text-3xl">
              <FaFileInvoice />
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white px-4 py-8 rounded-lg shadow-sm mt-4 min-h-[400px] min-w-0">
        <SalesReportChart data={thirtyDaysSales} isLoading={isChartLoading} />
      </div>
    </div>
  );
}

export default Home;
