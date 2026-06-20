import CreateAdminForm from "../../features/admins/components/CreateAdminForm";
import PageTitle from "../../shared/layout/PageTitle";

export default function CreateAdminPage() {
  return <><PageTitle title="Create admin" description="Assign the business owner to an existing shop." /><CreateAdminForm /></>;
}
