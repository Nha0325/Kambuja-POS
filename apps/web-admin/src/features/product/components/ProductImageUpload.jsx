export default function ProductImageUpload({ onChange }) {
  return <label className="grid gap-1 text-sm font-medium text-slate-700">Product image<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => onChange(reader.result); reader.readAsDataURL(file); }} /></label>;
}
