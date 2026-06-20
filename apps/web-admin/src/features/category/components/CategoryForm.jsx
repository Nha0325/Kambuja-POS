import { useState } from "react";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import { createCategory } from "../services/categoryService";

export default function CategoryForm({ onCreated }) {
  const [form, setForm] = useState({ name: "", description: "", image: "", status: 1 });
  return <form className="mb-5 grid gap-3 md:grid-cols-3" onSubmit={async (event) => { event.preventDefault(); const created = await createCategory(form); onCreated?.(created); setForm({ ...form, name: "", description: "" }); }}><Input label="Name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><Input label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><Button type="submit" className="self-end">Add category</Button></form>;
}
