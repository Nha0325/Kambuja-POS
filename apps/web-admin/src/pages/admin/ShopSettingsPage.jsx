import ShopSettingsForm from "../../features/settings/components/ShopSettingsForm";
import TelegramSettingForm from "../../features/settings/components/TelegramSettingForm";
import PageTitle from "../../shared/layout/PageTitle";
export default function ShopSettingsPage() { return <><PageTitle title="Shop settings" /><div className="grid gap-6"><ShopSettingsForm /><TelegramSettingForm /></div></>; }
