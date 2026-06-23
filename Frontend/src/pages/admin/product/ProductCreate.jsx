import { useState } from "react";
import useFetchData from "../../../hooks/useFetchData";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useStorage from "../../../hooks/useStorage";
import useCollection from "../../../hooks/useCollection";

function CreateProduct() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const [note, setNote] = useState("");
  const [reorderLevel, setReorderLevel] = useState(10);
  const [status, setStatus] = useState(true);
  
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

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
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
        reorderLevel: Number(reorderLevel),
        imageUrl: filename
      });
      if (res) {
        toast.success("Created successfully!!");
        navigate("/admin/products");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create product.");
    }
  };

  const inputClass = "h-11 w-full rounded-lg border border-[#c6c6cd] bg-white px-3 text-sm text-[#0b1c30] outline-none transition placeholder:text-[#8a8d96] focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10";
  const selectClass = "h-11 w-full rounded-lg border border-[#c6c6cd] bg-white px-3 text-sm text-[#0b1c30] outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10";
  const textareaClass = "min-h-32 w-full resize-none rounded-lg border border-[#c6c6cd] bg-white p-3 text-sm text-[#0b1c30] outline-none transition placeholder:text-[#8a8d96] focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10";
  const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[0.04em] text-[#45464d]";

  return (
    <div className="min-h-screen bg-[#f8f9ff] px-3 py-4 text-[#0b1c30] sm:px-4 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-2 flex items-center gap-2 text-sm text-[#45464d]">
          <Link to="/admin/products" className="hover:text-[#0058be]">Products</Link>
          <span className="text-[#c6c6cd]">&gt;</span>
          <span className="font-semibold text-[#0b1c30]">Create New</span>
        </nav>
        <h1 className="text-2xl font-bold text-[#0b1c30] sm:text-3xl">Create New Product</h1>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          
          {/* Left card: Product Details */}
          <div className="rounded-xl border border-[#d7dced] bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#e5e7ef] px-5 py-4 text-sm font-bold text-[#0b1c30]">
              Product Details
            </div>
            
            <div className="p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Product Name*</label>
                  <input 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text" 
                    placeholder="Enter product name" 
                    className={inputClass} 
                  />
                </div>

                <div>
                  <label className={labelClass}>Category*</label>
                  <select 
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={selectClass}
                  >
                    <option value="" disabled>Choose Category</option>
                    {categories?.map(item => (
                      <option value={item._id} key={item._id}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>SKU / Product Code</label>
                  <input 
                    type="text"
                    disabled
                    readOnly
                    value="Auto-generated"
                    className={`${inputClass} cursor-not-allowed bg-[#f8f9ff] text-[#8a8d96]`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Current Stock</label>
                  <input 
                    type="number"
                    min="0"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    className={inputClass} 
                  />
                </div>

                <div>
                  <label className={labelClass}>Cost Price*</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d]">$</span>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      className={`${inputClass} pl-8`}
                      placeholder="0.00" 
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Sale Price*</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d]">$</span>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className={`${inputClass} pl-8`}
                      placeholder="0.00" 
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Note</label>
                  <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className={textareaClass}
                    placeholder="Type product notes here..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Product Media & Settings */}
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-[#d7dced] bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#e5e7ef] px-5 py-4 text-sm font-bold text-[#0b1c30]">
                Product Media
              </div>
              <div className="p-5">
                {!preview ? (
                  <label 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="flex h-[180px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#c6c6cd] bg-[#f8f9ff] transition-colors hover:border-[#0058be] hover:bg-[#eff4ff]"
                  >
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#dce9ff] text-[#0058be]">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    </div>
                    <span className="text-sm font-semibold text-[#0b1c30]">Click to upload</span>
                    <span className="mt-1 text-xs text-[#76777d]">PNG, JPG up to 2MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                ) : (
                  <div className="relative flex h-[180px] w-full items-center justify-center rounded-lg border border-[#d7dced] bg-[#f8f9ff] p-2">
                    <img src={preview} alt="Preview" className="h-full w-full object-contain" />
                    <button 
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm border border-[#d7dced] text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove image"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[#d7dced] bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#e5e7ef] px-5 py-4 text-sm font-bold text-[#0b1c30]">
                Settings
              </div>
              <div className="p-5 flex flex-col gap-5">
                <div className="flex items-center justify-between rounded-lg border border-[#d7dced] p-3 bg-[#f8f9ff]">
                  <div>
                    <div className="text-sm font-semibold text-[#0b1c30]">Product Status</div>
                    <div className="text-xs text-[#45464d]">Set product visibility</div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" checked={status} onChange={(e) => setStatus(e.target.checked)} />
                    <div className="peer h-6 w-11 rounded-full bg-[#c6c6cd] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#0b1c30] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                  </label>
                </div>

                <div>
                  <label className={labelClass}>Low Stock Alert Threshold</label>
                  <input 
                    type="number"
                    min="1"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-[#76777d]">You'll be notified when stock falls below this level.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex items-center justify-end gap-3 border-t border-[#d7dced] bg-white px-5 py-4">
            <Link 
              to="/admin/products"
              className="flex h-11 items-center justify-center rounded-lg border border-[#c6c6cd] bg-white px-6 text-sm font-semibold text-[#0b1c30] transition hover:bg-[#eff4ff]"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex h-11 items-center justify-center rounded-lg bg-[#0b1c30] px-6 text-sm font-semibold text-white transition hover:bg-[#213145] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProduct;
