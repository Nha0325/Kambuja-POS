import { useState } from "react";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import Select from "../../../shared/ui/Select";
import Combobox from "../../../shared/ui/Combobox";
import { createShop } from "../services/shopService";
import { useI18nStore } from "../../../app/i18nStore";
import { CAMBODIA_PROVINCES, getDistrictsForProvince } from "../../location/utils/cambodiaLocations";

const provLabel = (p) => p.nameKh + " / " + p.nameEn;
const provSearch = (p) => p.nameKh + " " + p.nameEn + " " + p.code;
const distLabel = (d) => d.nameKh + " / " + d.nameEn;
const distSearch = (d) => d.nameKh + " " + d.nameEn + " " + d.code;

export default function CreateShopForm({ onSuccess, onCancel }) {
  const { t } = useI18nStore();

  const [form, setForm] = useState({
    name: "",
    ownerUserId: "",
    phone: "",
    address: "",
    province: null,  // province object
    city: null,      // district object
    status: "ACTIVE",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const districts = getDistrictsForProvince(form.province?.code);

  const clearError = (key) =>
    setErrors((prev) => ({ ...prev, [key]: "" }));

  const updateText = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    clearError(key);
  };

  const setProvince = (prov) => {
    setForm((prev) => ({ ...prev, province: prov, city: null }));
    clearError("province");
    clearError("city");
  };

  const setDistrict = (dist) => {
    setForm((prev) => ({ ...prev, city: dist }));
    clearError("city");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t("validation.shopNameRequired", "Shop name is required");
    if (!form.ownerUserId.trim()) e.ownerUserId = t("validation.ownerNameRequired", "Owner name is required");
    if (!form.phone.trim()) e.phone = t("validation.phoneRequired", "Phone is required");
    if (!form.address.trim()) e.address = t("validation.addressRequired", "Address is required");
    if (!form.province) e.province = t("validation.provinceCityRequired", "Province/city is required");
    if (!form.city) e.city = t("validation.districtKhanRequired", "District/khan is required");
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length > 0) { setErrors(ve); return; }
    setLoading(true);
    setSubmitError("");
    try {
      await createShop({
        name: form.name.trim(),
        ownerUserId: form.ownerUserId.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        province: form.province?.nameEn ?? "",
        city: form.city?.nameEn ?? "",
        status: form.status,
      });
      onSuccess();
    } catch (err) {
      setSubmitError(err.response?.data?.message ?? err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <p className="text-sm text-slate-500 italic">
        {t("shops.autoCode", "Shop code will be generated automatically.")}
      </p>

      <div className="grid gap-1">
        <Input label={t("shops.shopName", "Shop name")} value={form.name} onChange={updateText("name")} />
        {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
      </div>

      <div className="grid gap-1">
        <Input label={t("shops.ownerName", "Owner name")} value={form.ownerUserId} onChange={updateText("ownerUserId")} />
        {errors.ownerUserId && <p className="text-xs text-rose-600">{errors.ownerUserId}</p>}
      </div>

      <div className="grid gap-1">
        <Input label={t("shops.phone", "Phone number")} value={form.phone} onChange={updateText("phone")} type="tel" />
        {errors.phone && <p className="text-xs text-rose-600">{errors.phone}</p>}
      </div>

      <div className="grid gap-1">
        <Input label={t("shops.address", "Address")} value={form.address} onChange={updateText("address")} />
        {errors.address && <p className="text-xs text-rose-600">{errors.address}</p>}
      </div>

      <Combobox
        label={t("shops.provinceCity", "Province/city")}
        value={form.province}
        onChange={setProvince}
        options={CAMBODIA_PROVINCES}
        getOptionLabel={provLabel}
        getOptionSearchText={provSearch}
        placeholder={t("shops.searchProvinceCity", "Search province/city...")}
        error={errors.province}
        emptyMessage={t("common.noData", "No results")}
      />

      <Combobox
        label={t("shops.districtKhan", "District/khan")}
        value={form.city}
        onChange={setDistrict}
        options={districts}
        getOptionLabel={distLabel}
        getOptionSearchText={distSearch}
        placeholder={
          form.province
            ? t("shops.searchDistrictKhan", "Search district/khan...")
            : t("validation.selectProvinceCityFirst", "Select province/city first")
        }
        disabled={!form.province}
        error={errors.city}
        emptyMessage={t("common.noData", "No results")}
      />

      <Select
        label={t("shops.status", "Status")}
        value={form.status}
        onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
      >
        <option value="ACTIVE">{t("common.active", "Active")}</option>
        <option value="INACTIVE">{t("common.inactive", "Inactive")}</option>
      </Select>

      {submitError && <p className="text-sm text-rose-700">{submitError}</p>}

      <div className="flex gap-3">
        <Button type="button" tone="slate" onClick={onCancel}>{t("common.cancel", "Cancel")}</Button>
        <Button type="submit" disabled={loading}>
          {loading ? t("common.loading", "Loading...") : t("common.create", "Create")}
        </Button>
      </div>
    </form>
  );
}
