import { useState } from "react";
import AllSalesReportTable from "../../features/reports/components/AllSalesReportTable";
import ReportFilterBar from "../../features/reports/components/ReportFilterBar";
import { getSalesReports } from "../../features/reports/services/reportService";
import PageTitle from "../../shared/layout/PageTitle";

export default function AllSalesReportPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  return <><PageTitle title="All sales report" /><ReportFilterBar onApply={(filters) => getSalesReports(filters).then(setRows).catch((requestError) => setError(requestError.response?.data?.message ?? requestError.message))} />{error && <p className="mb-4 text-rose-700">{error}</p>}<AllSalesReportTable rows={rows} /></>;
}
