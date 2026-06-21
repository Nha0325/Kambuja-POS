import { useState } from "react";
import ShopTable from "../../features/shops/components/ShopTable";
import CreateShopForm from "../../features/shops/components/CreateShopForm";
import PageTitle from "../../shared/layout/PageTitle";
import Modal from "../../shared/ui/Modal";
import Button from "../../shared/ui/Button";
import { useI18nStore } from "../../app/i18nStore";
import { useShopStore } from "../../features/shops/store/shopStore";
import { listShops } from "../../features/shops/services/shopService";

export default function AllShopsPage() {
  const { t } = useI18nStore();
  const [open, setOpen] = useState(false);
  const setShops = useShopStore((state) => state.setShops);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <PageTitle title={t("shops.title", "All shops")} />
        <Button onClick={() => setOpen(true)}>{t("shops.createShop", "Create Shop")}</Button>
      </div>
      <ShopTable />
      <Modal open={open} title={t("shops.createShop", "Create Shop")} onClose={() => setOpen(false)}>
        <CreateShopForm 
          onCancel={() => setOpen(false)} 
          onSuccess={() => {
            setOpen(false);
            listShops().then(setShops);
            alert(t("shops.createSuccess", "Shop created successfully"));
          }} 
        />
      </Modal>
    </>
  );
}
