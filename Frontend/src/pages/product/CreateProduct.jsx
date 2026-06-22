import { useState } from "react";
import useFetchData from "../../hooks/useFetchData";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useStorage from "../../hooks/useStorage";
import useCollection from "../../hooks/useCollection";

function CreateProduct() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [salePrice, setSalePrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [note, setNote] = useState("");
  
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const { data: categories } = useFetchData("categories", 1, 100);
  const { uploadFile } = useStorage();
  const { create, isLoading } = useCollection("products");
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error("Image is required");
      return;
    }

    const uploadRes = await uploadFile(image);
    const filename = uploadRes?.filename;

    if (!filename) {
      toast.error("Image upload failed");
      return;
    }

    try {
      const res = await create({
        name,
        category,
        salePrice: Number(salePrice),
        costPrice: Number(costPrice),
        currentStock: Number(currentStock),
        note,
        imageUrl: filename
      });
      if (res) {
        toast.success("Created successfully!!");
        clearForm();
        navigate("/admin/products");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create product.");
    }
  };

  function clearForm() {
    setName("");
    setCategory("");
    setSalePrice(0);
    setCostPrice(0);
    setCurrentStock(0);
    setNote("");
    handleRemoveImage();
  }

  function handleRemoveImage() {
    setImage(null);
    setPreview(null);
  }

  return (
    <div className="w-full max-w-full p-3 sm:p-4">
      <h1 className="text-xl font-semibold text-black">Create New Product</h1>

      <form onSubmit={handleSubmit} className="mt-4 grid w-full max-w-5xl grid-cols-1 items-start gap-4 md:grid-cols-2">
        {/* Left Form Controls */}
        <div className="bg-white p-4 rounded-lg border border-gray-200"> 
          <div className="mb-3">
            <label htmlFor="product-name" className="block text-sm font-medium mb-1">
              Name*
            </label>
            <input
              id="product-name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-sm input-bordered w-full rounded"
              placeholder="Enter name"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="product-category" className="block text-sm font-medium mb-1">
              Category*
            </label>
            <select
              id="product-category"
              name="category"
              required
              onChange={(e) => setCategory(e.target.value)}
              className="select select-sm select-bordered w-full rounded"
              value={category}
            >
              <option value="" disabled>Choose Category</option>
              {categories?.map(item => (
                <option value={item._id} key={item._id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="product-costPrice" className="block text-sm font-medium mb-1">
              Cost Price*
            </label>
            <input
              id="product-costPrice"
              name="costPrice"
              type="number"
              required
              step="0.01"
              onChange={(e) => setCostPrice(e.target.value)}
              value={costPrice}
              className="input input-sm input-bordered w-full rounded"
              placeholder="0.00"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="product-salePrice" className="block text-sm font-medium mb-1">
              Sale Price*
            </label>
            <input
              id="product-salePrice"
              name="salePrice"
              type="number"
              required
              step="0.01"
              onChange={(e) => setSalePrice(e.target.value)}
              value={salePrice}
              className="input input-sm input-bordered w-full rounded"
              placeholder="0.00"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="product-stock" className="block text-sm font-medium mb-1">
              Current Stock
            </label>
            <input
              id="product-stock"
              name="currentStock"
              type="number"
              onChange={(e) => setCurrentStock(e.target.value)}
              value={currentStock}
              className="input input-sm input-bordered w-full rounded"
              placeholder="0"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="product-note" className="block text-sm font-medium mb-1">
              Note
            </label>
            <textarea
              id="product-note"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="textarea textarea-sm textarea-bordered w-full rounded h-20"
              placeholder="Type product note here..."
            ></textarea>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Link to="/admin/products" className="btn btn-sm w-full sm:w-auto">Cancel</Link>
            <button type="submit" disabled={isLoading} className="btn btn-sm btn-neutral w-full sm:w-auto">
              {isLoading ? <span className="loading loading-spinner loading-xs"></span> : "Save"}
            </button>
          </div>
        </div>

        {/* Right Image Upload View */}
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
            <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition hover:border-neutral hover:bg-gray-50 sm:h-64">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-400">PNG, JPG, JPEG (Max. 2MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          )}
          {image && (
            <div className="text-center mt-2">
              <p className="text-xs text-gray-500 bg-gray-100 py-1 px-2 rounded truncate">{image.name}</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default CreateProduct;
