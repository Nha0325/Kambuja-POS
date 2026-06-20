import ReceiptPreview from "../../features/pos/components/ReceiptPreview";
import { useCartStore } from "../../features/pos/store/cartStore";
import PageTitle from "../../shared/layout/PageTitle";
export default function ReceiptPage() { const receipt = useCartStore((state) => state.lastPayment?.receipt); return <><PageTitle title="Receipt" /><ReceiptPreview receipt={receipt} /></>; }
