import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import Select from "../../../shared/ui/Select";
import { listCategories } from "../../category/services/categoryService";
import ProductImageUpload from "./ProductImageUpload";
import { createProduct } from "../services/productService";

export default function ProductForm() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ categoryId: "", name: "", sku: "", unitPrice: "0", costPrice: "0", image: "", description: "", status: "ACTIVE" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => { listCategories().then(setCategories); }, []);
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  return <form className="grid max-w-2xl gap-4 md:grid-cols-2" onSubmit={async (event) => { event.preventDefault(); try { await createProduct({ ...form, unitPrice: Number(form.unitPrice), costPrice: Number(form.costPrice) }); navigate("/admin/products"); } catch (requestError) { setError(requestError.response?.data?.message ?? requestError.message); } }}><Select label="Category" required value={form.categoryId} onChange={update("categoryId")}><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select><Input label="Name" required value={form.name} onChange={update("name")} /><Input label="SKU" required value={form.sku} onChange={update("sku")} /><Input label="Unit price" type="number" min="0" step="0.01" required value={form.unitPrice} onChange={update("unitPrice")} /><Input label="Cost price" type="number" min="0" step="0.01" required value={form.costPrice} onChange={update("costPrice")} /><Input label="Description" value={form.description} onChange={update("description")} /><ProductImageUpload onChange={(image) => setForm({ ...form, image })} />{error && <p className="text-rose-700">{error}</p>}<Button type="submit" className="md:col-span-2">Create product</Button></form>;
}
