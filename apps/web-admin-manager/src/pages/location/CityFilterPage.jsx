import ProvinceCityFilter from "../../features/location/components/ProvinceCityFilter";
import PageTitle from "../../shared/layout/PageTitle";

export default function CityFilterPage() {
  return <><PageTitle title="City filter" /><ProvinceCityFilter cityOnly /></>;
}
