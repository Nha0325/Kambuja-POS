import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import { formatMoney } from "../../../shared/utils/formatMoney";
import { formatDate } from "../../../shared/utils/formatDate";
import { printReceipt } from "../../../shared/utils/printReceipt";

export default function ReceiptPreview({ receipt }) {
  if (!receipt) return <p>No receipt is available.</p>;
  return <Card className="max-w-md print:border-0 print:shadow-none"><h2 className="text-center text-xl font-bold">Kambuja POS</h2><p className="mt-4">Receipt: {receipt.receiptNo}</p><p>Date: {formatDate(receipt.issuedAt)}</p><dl className="my-5 grid grid-cols-2 gap-2 border-y border-slate-200 py-4"><dt>Subtotal</dt><dd className="text-right">{formatMoney(receipt.subtotal)}</dd><dt>Discount</dt><dd className="text-right">{formatMoney(receipt.discountAmount)}</dd><dt>Tax</dt><dd className="text-right">{formatMoney(receipt.taxAmount)}</dd><dt className="font-bold">Total</dt><dd className="text-right font-bold">{formatMoney(receipt.grandTotal)}</dd></dl><Button className="w-full print:hidden" onClick={printReceipt}>Print receipt</Button></Card>;
}
