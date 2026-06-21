import ProvinceCityFilter from "../../features/location/components/ProvinceCityFilter";
import PageTitle from "../../shared/layout/PageTitle";
import { useI18nStore } from "../../app/i18nStore";

export default function CityFilterPage() {
  const { t } = useI18nStore();
  return (
    <>
      <PageTitle title={t("location.cities", "Cities")} />
      <ProvinceCityFilter cityOnly />
    </>
  );
}
