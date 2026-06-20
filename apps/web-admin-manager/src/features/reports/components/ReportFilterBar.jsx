import { useState } from "react";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";

function dateValue(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export default function ReportFilterBar({ includeDates = true, onApply }) {
  const [filters, setFilters] = useState({ from: dateValue(-30), to: dateValue(), province: "", city: "" });
  const update = (key) => (event) => setFilters({ ...filters, [key]: event.target.value });
  return (
    <form className="mb-5 grid gap-3 md:grid-cols-5" onSubmit={(event) => { event.preventDefault(); onApply(filters); }}>
      {includeDates && <Input label="From" type="date" value={filters.from} onChange={update("from")} />}
      {includeDates && <Input label="To" type="date" value={filters.to} onChange={update("to")} />}
      <Input label="Province" value={filters.province} onChange={update("province")} />
      <Input label="City" value={filters.city} onChange={update("city")} />
      <Button type="submit" className="self-end">Apply filters</Button>
    </form>
  );
}
