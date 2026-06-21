import { useState } from "react";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import { useI18nStore } from "../../../app/i18nStore";

function dateValue(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export default function ReportFilterBar({ includeDates = true, onApply }) {
  const [filters, setFilters] = useState({ from: dateValue(-30), to: dateValue(), province: "", city: "" });
  const update = (key) => (event) => setFilters({ ...filters, [key]: event.target.value });
  const { t } = useI18nStore();
  return (
    <form className="mb-5 grid gap-3 md:grid-cols-5" onSubmit={(event) => { event.preventDefault(); onApply(filters); }}>
      {includeDates && <Input label={t("common.fromDate", "From")} type="date" value={filters.from} onChange={update("from")} />}
      {includeDates && <Input label={t("common.toDate", "To")} type="date" value={filters.to} onChange={update("to")} />}
      <Input label={t("location.provinceName", "Province")} value={filters.province} onChange={update("province")} />
      <Input label={t("location.cityName", "City")} value={filters.city} onChange={update("city")} />
      <Button type="submit" className="self-end">{t("common.filter", "Apply filters")}</Button>
    </form>
  );
}
