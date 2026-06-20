import { useState } from "react";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import Select from "../../../shared/ui/Select";
import { createProductCode } from "../services/productService";

export default function ProductCodeBox({ productId }) {
  const [form, setForm] = useState({ code: "", codeType: "BARCODE", primaryCode: true, status: 1 });
  if (!productId) return null;
  return <form className="grid gap-3 rounded-xl border border-slate-200 p-4" onSubmit={async (event) => { event.preventDefault(); await createProductCode({ ...form, productId }); setForm({ ...form, code: "" }); }}><Input label="Barcode / QR / SKU" required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} /><Select label="Code type" value={form.codeType} onChange={(event) => setForm({ ...form, codeType: event.target.value })}>{["BARCODE", "QR_CODE", "SKU"].map((type) => <option key={type}>{type}</option>)}</Select><Button type="submit">Add code</Button></form>;
}
