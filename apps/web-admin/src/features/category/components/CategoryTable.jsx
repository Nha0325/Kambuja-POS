import { useEffect } from "react";
import DataTable from "../../../shared/tables/DataTable";
import CategoryForm from "./CategoryForm";
import { listCategories } from "../services/categoryService";
import { useCategoryStore } from "../store/categoryStore";

export default function CategoryTable() {
  const categories = useCategoryStore((state) => state.categories);
  const setCategories = useCategoryStore((state) => state.setCategories);
  useEffect(() => { listCategories().then(setCategories); }, [setCategories]);
  return <><CategoryForm onCreated={(created) => setCategories([...categories, created])} /><DataTable rows={categories} columns={[{ key: "name", label: "Name" }, { key: "description", label: "Description" }, { key: "status", label: "Status" }]} /></>;
}
