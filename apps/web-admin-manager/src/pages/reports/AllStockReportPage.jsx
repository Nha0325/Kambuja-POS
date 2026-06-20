import { useState } from "react";
import AllStockReportTable from "../../features/reports/components/AllStockReportTable";
import ReportFilterBar from "../../features/reports/components/ReportFilterBar";
import { getStockReports } from "../../features/reports/services/reportService";
import PageTitle from "../../shared/layout/PageTitle";

export default function AllStockReportPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  return <><PageTitle title="All stock report" /><ReportFilterBar includeDates={false} onApply={({ province, city }) => getStockReports({ province, city }).then(setRows).catch((requestError) => setError(requestError.response?.data?.message ?? requestError.message))} />{error && <p className="mb-4 text-rose-700">{error}</p>}<AllStockReportTable rows={rows} /></>;
}
