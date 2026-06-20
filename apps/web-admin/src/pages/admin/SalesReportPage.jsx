import { useState } from "react";
import SalesReportTable from "../../features/report/components/SalesReportTable";
import { getSalesReport } from "../../features/report/services/reportService";
import PageTitle from "../../shared/layout/PageTitle";
import Button from "../../shared/ui/Button";
import Input from "../../shared/ui/Input";

export default function SalesReportPage() {
  const now = new Date().toISOString().slice(0, 10);
  const [filters, setFilters] = useState({ from: now, to: now });
  const [report, setReport] = useState(null);
  return <><PageTitle title="Sales report" /><form className="mb-5 flex items-end gap-3" onSubmit={(event) => { event.preventDefault(); getSalesReport(filters).then(setReport); }}><Input label="From" type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} /><Input label="To" type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} /><Button type="submit">Load report</Button></form><SalesReportTable report={report} /></>;
}
