import { useState } from "react";
import AllSalesReportTable from "../../features/reports/components/AllSalesReportTable";
import ReportFilterBar from "../../features/reports/components/ReportFilterBar";
import { getSalesReports } from "../../features/reports/services/reportService";
import PageTitle from "../../shared/layout/PageTitle";
import { useI18nStore } from "../../app/i18nStore";

export default function AllSalesReportPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const { t } = useI18nStore();
  return (
    <>
      <PageTitle title={t("reports.sales.title", "Sales Report")} />
      <ReportFilterBar onApply={(filters) => getSalesReports(filters).then(setRows).catch((requestError) => setError(requestError.response?.data?.message ?? requestError.message))} />
      {error && <p className="mb-4 text-rose-700">{error}</p>}
      <AllSalesReportTable rows={rows} />
    </>
  );
}
