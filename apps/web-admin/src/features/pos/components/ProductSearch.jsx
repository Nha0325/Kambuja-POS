import Input from "../../../shared/ui/Input";
export default function ProductSearch({ value, onChange }) {
  return <Input label="Search products" value={value} onChange={(event) => onChange(event.target.value)} />;
}
