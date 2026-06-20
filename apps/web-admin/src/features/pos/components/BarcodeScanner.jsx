import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import { useCartStore } from "../store/cartStore";
import { useBarcodeScanner } from "../hooks/useBarcodeScanner";

export default function BarcodeScanner() {
  const addItem = useCartStore((state) => state.addItem);
  const scanner = useBarcodeScanner(addItem);
  return <div className="grid gap-2"><div className="flex items-end gap-2"><Input label="Scan barcode / QR" value={scanner.code} onChange={(event) => scanner.setCode(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); scanner.scan(); } }} /><Button onClick={scanner.scan}>Lookup</Button></div>{scanner.error && <p className="text-sm text-rose-700">{scanner.error}</p>}</div>;
}
