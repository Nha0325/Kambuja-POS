import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery } from "../../hooks/useQuery";
import useStorage from "../../hooks/useStorage";
import { useCollection } from "../../hooks/useCollection";
import { useFindById } from "../../hooks/useFindById";
import { apiUrl } from "../../configs/env";

function EditProduct() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const [note, setNote] = useState("");
  const [oldImageUrl, setOldImageUrl] = useState("");

  const route = useParams();
  const navigate = useNavigate();

  const { data: categories } = useQuery("categories", "", 1, 100);
  const { uploadFile, removeFile } = useStorage();
  const { update, isLoading } = useCollection("products");
  const { data: product, isLoading: isFinding } = useFindById("products", route.id);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name,
        category,
        costPrice: Number(costPrice),
        salePrice: Number(salePrice),
        currentStock: Number(currentStock),
        note,
      };

      if (image) {
        const res = await uploadFile(image);
        data.imageUrl = res?.filename;

        if (oldImageUrl) {
          await removeFile(oldImageUrl);
        }
      }

      const updateDoc = await update(route.id, data);
      if (updateDoc) {
        toast.success("Product updated successfully!");
        clearForm();
        navigate("/admin/products");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  function clearForm() {
    setName("");
    setCategory("");
    setCostPrice("");
    setSalePrice("");
    setNote("");
    setImage(null);
    setPreview(null);
  }

  useEffect(() => {
    if (product && isFinding === false) {
      setName(product?.name || "");
      setCategory(product?.category?._id || "");
      setCostPrice(product?.costPrice || "");
      setCurrentStock(product?.currentStock ?? 0);
      setSalePrice(product?.salePrice || "");
      setNote(product?.note || "");

      if (product?.imageUrl) {
        setPreview(`${apiUrl}/upload/${product?.imageUrl}`);
        setOldImageUrl(product?.imageUrl);
      }
    }
  }, [product, isFinding]);

  return (
    <div className="w-full max-w-full p-3 sm:p-4">
      <h1 className="text-xl font-semibold text-black">Edit Product</h1>

      <form onSubmit={handleSubmit} className="mt-4 grid w-full max-w-5xl grid-cols-1 items-start gap-4 md:grid-cols-2">
        {/* Left Side Controls */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Product Name*</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-sm input-bordered w-full rounded"
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Category*</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select select-sm select-bordered w-full rounded"
              required
            >
              <option value="" disabled>Choose Category</option>
              {categories?.map((item) => (
                <option key={item?._id} value={item?._id}>{item?.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Cost Price*</label>
            <input
              type="number"
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              className="input input-sm input-bordered w-full rounded"
              placeholder="0.00"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Sale Price*</label>
            <input
              type="number"
              step="0.01"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              className="input input-sm input-bordered w-full rounded"
              placeholder="0.00"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Current Stock</label>
            <input
              type="number"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
              className="input input-sm input-bordered w-full rounded"
              placeholder="0"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="textarea textarea-sm textarea-bordered w-full rounded h-20"
              placeholder="Type product note here..."
            ></textarea>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Link to="/admin/products" className="btn btn-sm w-full sm:w-auto">Cancel</Link>
            <button type="submit" disabled={isLoading} className="btn btn-sm btn-neutral w-full sm:w-auto">
              {isLoading ? <span className="loading loading-spinner loading-xs"></span> : "Update"}
            </button>
          </div>
        </div>

        {/* Right Side Image View */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium mb-2">Product Image*</label>
          {preview ? (
            <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50 sm:h-64">
              <img
                src={preview}
                alt="Preview"
                className="object-contain max-w-full max-h-full p-2"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-error text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-red-600 transition"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition hover:border-gray-400 hover:bg-gray-50 sm:h-64">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload new image</span></p>
                <p className="text-xs text-gray-400">PNG, JPG, JPEG</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
      </form>
    </div>
  );
}

export default EditProduct;
