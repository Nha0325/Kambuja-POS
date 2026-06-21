import { useEffect, useMemo, useState } from "react";
import Select from "../../../shared/ui/Select";
import DataTable from "../../../shared/tables/DataTable";
import { listShops } from "../../shops/services/shopService";
import { locationOptions } from "../utils/cambodiaLocations";
import { useI18nStore } from "../../../app/i18nStore";

export default function ProvinceCityFilter({ cityOnly = false }) {
  const [shops, setShops] = useState([]);
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const { t } = useI18nStore();
  useEffect(() => { listShops().then(setShops); }, []);
  const options = useMemo(() => locationOptions(shops), [shops]);
  const filtered = shops.filter((shop) => (!province || shop.province === province) && (!city || shop.city === city));
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        {!cityOnly && <Select label={t("location.provinceName", "Province")} value={province} onChange={(event) => setProvince(event.target.value)}><option value="">{t("location.allProvinces", "All provinces")}</option>{options.provinces.map((item) => <option key={item}>{item}</option>)}</Select>}
        <Select label={t("location.cityName", "City")} value={city} onChange={(event) => setCity(event.target.value)}><option value="">{t("location.cities", "All cities")}</option>{options.cities.map((item) => <option key={item}>{item}</option>)}</Select>
      </div>
      <DataTable rows={filtered} columns={[{ key: "name", label: t("shops.name", "Shop") }, { key: "province", label: t("shops.province", "Province") }, { key: "city", label: t("shops.city", "City") }]} />
    </div>
  );
}
