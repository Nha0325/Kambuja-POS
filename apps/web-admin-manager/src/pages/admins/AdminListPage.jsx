import AdminTable from "../../features/admins/components/AdminTable";
import PageTitle from "../../shared/layout/PageTitle";

export default function AdminListPage() {
  return <><PageTitle title="Admins" description="Business owners created by the platform manager." /><AdminTable /></>;
}
