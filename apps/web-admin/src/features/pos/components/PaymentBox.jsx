import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import Select from "../../../shared/ui/Select";
import { formatMoney } from "../../../shared/utils/formatMoney";
import { paySale } from "../services/saleService";
import { generateReceipt } from "../services/receiptService";
import { useCartStore } from "../store/cartStore";

export default function PaymentBox() {
  const sale = useCartStore((state) => state.lastSale);
  const setLastPayment = useCartStore((state) => state.setLastPayment);
  const [method, setMethod] = useState("CASH");
  const [paidAmount, setPaidAmount] = useState(sale?.grandTotal ?? 0);
  const navigate = useNavigate();
  if (!sale) return <p>No completed sale is available for payment.</p>;
  return <form className="grid max-w-lg gap-4" onSubmit={async (event) => { event.preventDefault(); const payment = await paySale({ saleId: sale.id, method, paidAmount: Number(paidAmount), referenceNo: "" }); const receipt = await generateReceipt(sale.id); setLastPayment({ payment, receipt }); navigate("/pos/receipt"); }}><p className="text-2xl font-bold">{formatMoney(sale.grandTotal)}</p><Select label="Payment method" value={method} onChange={(event) => setMethod(event.target.value)}>{["CASH", "ABA", "CARD", "BANK_TRANSFER"].map((item) => <option key={item}>{item}</option>)}</Select><Input label="Paid amount" type="number" min="0.01" step="0.01" required value={paidAmount} onChange={(event) => setPaidAmount(event.target.value)} /><Button type="submit">Save payment</Button></form>;
}
