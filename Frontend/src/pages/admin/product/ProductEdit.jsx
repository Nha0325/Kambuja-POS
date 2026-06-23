import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery } from "../../../hooks/useQuery";
import useStorage from "../../../hooks/useStorage";
import { useCollection } from "../../../hooks/useCollection";
import { useFindById } from "../../../hooks/useFindById";
import { baseUrl } from "../../../configs/env";

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
  const [status, setStatus] = useState(true);
  const [reorderLevel, setReorderLevel] = useState(10);

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
        navigate("/admin/products");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  useEffect(() => {
    if (product && isFinding === false) {
      setName(product?.name || "");
      setCategory(product?.category?._id || "");
      setCostPrice(product?.costPrice || "");
      setCurrentStock(product?.currentStock ?? 0);
      setSalePrice(product?.salePrice || "");
      setNote(product?.note || "");

      if (product?.imageUrl) {
        setPreview(`${baseUrl}/upload/${product?.imageUrl}`);
        setOldImageUrl(product?.imageUrl);
      }
    }
  }, [product, isFinding]);

  const numCost = Number(costPrice) || 0;
  const numSale = Number(salePrice) || 0;
  const numStock = Number(currentStock) || 0;
  
  const margin = numSale > 0 ? (((numSale - numCost) / numSale) * 100).toFixed(1) : 0;
  const estProfit = ((numSale - numCost) * numStock).toFixed(2);
  const turnover = numStock <= 10 ? "Low" : numStock <= 50 ? "Medium" : "High";
  const stockBadge = numStock > 0 ? "In Stock" : "Out of Stock";

  const inputClass = "h-11 w-full rounded-lg border border-[#c6c6cd] bg-white px-3 text-sm text-[#0b1c30] outline-none transition placeholder:text-[#8a8d96] focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10";
  const selectClass = "h-11 w-full rounded-lg border border-[#c6c6cd] bg-white px-3 text-sm text-[#0b1c30] outline-none transition focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10";
  const textareaClass = "min-h-32 w-full resize-none rounded-lg border border-[#c6c6cd] bg-white p-3 text-sm text-[#0b1c30] outline-none transition placeholder:text-[#8a8d96] focus:border-[#0058be] focus:ring-4 focus:ring-[#0058be]/10";
  const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[0.04em] text-[#45464d]";

  if (isFinding) {
    return <div className="flex h-screen w-full items-center justify-center"><span className="loading loading-spinner loading-lg text-[#0058be]"></span></div>;
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] px-3 py-4 text-[#0b1c30] sm:px-4 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-2 flex items-center gap-2 text-sm text-[#45464d]">
          <Link to="/admin/products" className="hover:text-[#0058be]">Products</Link>
          <span className="text-[#c6c6cd]">&gt;</span>
          <span className="font-semibold text-[#0b1c30]">Edit Product</span>
        </nav>
        
        <h1 className="text-2xl font-bold text-[#0b1c30] sm:text-3xl">Edit Product</h1>
        <p className="mt-1 text-sm text-[#45464d]">Manage details and inventory for "{product?.name || name || 'Product'}"</p>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          
          {/* Left card: Product Information */}
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-[#d7dced] bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#e5e7ef] px-5 py-4 text-sm font-bold text-[#0b1c30]">
                Product Information
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
                    <label className={labelClass}>Cost Price ($)*</label>
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
                    <label className={labelClass}>Sale Price ($)*</label>
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
                    <label className={labelClass}>Product Note</label>
                    <textarea 
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className={textareaClass}
                      placeholder="Type product notes here..."
                    />
                  </div>
                </div>

                {/* Inventory Health Box */}
                <div className="mt-6 rounded-xl border border-[#e5e7ef] bg-[#f8f9ff] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#0b1c30]">Inventory Health</h4>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${numStock > 0 ? "bg-[#dce9ff] text-[#0058be]" : "bg-[#ffdad6] text-[#93000a]"}`}>
                      {stockBadge}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg bg-white p-3 shadow-sm border border-[#e5e7ef]">
                      <p className="mb-1 text-xs font-semibold text-[#76777d] uppercase tracking-wider">Margin</p>
                      <p className="text-xl font-bold text-[#0b1c30]">{margin}%</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 shadow-sm border border-[#e5e7ef]">
                      <p className="mb-1 text-xs font-semibold text-[#76777d] uppercase tracking-wider">Est. Profit</p>
                      <p className="text-xl font-bold text-[#0b1c30]">${estProfit}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 shadow-sm border border-[#e5e7ef]">
                      <p className="mb-1 text-xs font-semibold text-[#76777d] uppercase tracking-wider">Turnover</p>
                      <p className="text-xl font-bold text-[#0b1c30]">{turnover}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Product Media & Settings & Audit Trail */}
          <div className="flex flex-col gap-6">
            {/* Product Media Card */}
            <div className="rounded-xl border border-[#d7dced] bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#e5e7ef] px-5 py-4 text-sm font-bold text-[#0b1c30]">
                Product Media
              </div>
              <div className="p-5">
                {!preview ? (
                  <label 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="flex h-[260px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#c6c6cd] bg-[#f8f9ff] transition-colors hover:border-[#0058be] hover:bg-[#eff4ff]"
                  >
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#dce9ff] text-[#0058be]">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    </div>
                    <span className="text-sm font-semibold text-[#0b1c30]">Click to upload or drag and drop</span>
                    <span className="mt-1 text-xs text-[#76777d]">PNG, JPG up to 2MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                ) : (
                  <div className="relative flex h-[260px] w-full flex-col items-center justify-center rounded-lg border border-[#d7dced] bg-[#f8f9ff] p-2">
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

            {/* Visibility & Status Card */}
            <div className="rounded-xl border border-[#d7dced] bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#e5e7ef] px-5 py-4 text-sm font-bold text-[#0b1c30]">
                Visibility & Status
              </div>
              <div className="p-5 flex flex-col gap-5">
                <div className="flex items-center justify-between rounded-lg border border-[#d7dced] p-3 bg-[#f8f9ff]">
                  <div>
                    <div className="text-sm font-semibold text-[#0b1c30]">Product Status</div>
                    <div className="text-xs text-[#45464d]">Visible in POS & Storefront</div>
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
                  <p className="mt-1 text-xs text-[#76777d]">We'll notify you when stock falls below this number.</p>
                </div>
              </div>
            </div>

            {/* Audit Trail Card */}
            <div className="rounded-xl border border-[#d7dced] bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#e5e7ef] px-5 py-4 text-sm font-bold text-[#0b1c30]">
                Audit Trail
              </div>
              <div className="p-5">
                {product?.createdAt ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#c6c6cd]"></div>
                      <div>
                        <p className="text-sm font-semibold text-[#0b1c30]">Product created</p>
                        <p className="text-xs text-[#76777d]">{new Date(product.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {product?.updatedAt && product.updatedAt !== product.createdAt && (
                      <div className="flex items-start gap-3">
                        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#0058be]"></div>
                        <div>
                          <p className="text-sm font-semibold text-[#0b1c30]">Product updated</p>
                          <p className="text-xs text-[#76777d]">{new Date(product.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#76777d]">No audit data</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Bar */}
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
              {isLoading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
