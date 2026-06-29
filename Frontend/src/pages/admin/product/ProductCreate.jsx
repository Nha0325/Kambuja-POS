import { useState } from "react";
import useFetchData from "../../../hooks/common/useFetchData";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useStorage from "../../../hooks/common/useStorage";
import useCollection from "../../../hooks/common/useCollection";
import ProductCodePreview from "../../../components/product/ProductCodePreview";
import ProductLabelPrintModal from "../../../components/product/ProductLabelPrintModal";

function CreateProduct() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [note, setNote] = useState("");
  const [reorderLevel, setReorderLevel] = useState(10);
  const [status, setStatus] = useState(true);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: categories } = useFetchData("categories", 1, 100);
  const { data: suppliers } = useFetchData("suppliers", 1, 100);
  const { uploadFile } = useStorage();
  const { create } = useCollection("products");
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
    setIsSaving(true);

    const cost = Number(costPrice);
    const sale = Number(salePrice);
    if (!Number.isFinite(sale) || sale <= 0) {
      toast.error("Sale price must be greater than zero.");
      setIsSaving(false);
      return;
    }
    if (!Number.isFinite(cost) || cost < 0) {
      toast.error("Cost price must be greater than or equal zero.");
      setIsSaving(false);
      return;
    }
    if (sale < cost) {
      toast.error("Sale price must be greater than or equal to cost price.");
      setIsSaving(false);
      return;
    }

    let filename = "";
    if (image) {
      const uploadRes = await uploadFile(image);
      filename = uploadRes?.filename || "";

      if (!filename) {
        toast.error("Image upload failed");
        setIsSaving(false);
        return;
      }
    }

    try {
      const payload = {
        name,
        category,
        supplier: supplier || undefined,
        sku: sku.trim(),
        barcode: barcode.trim(),
        salePrice: sale,
        costPrice: cost,
        lowStockThreshold: Number(reorderLevel),
        reorderLevel: Number(reorderLevel),
        note,
        description: note,
        status: status ? "ACTIVE" : "INACTIVE",
      };
      if (filename) payload.imageUrl = filename;

      const res = await create(payload);
      if (res) {
        toast.success("Created successfully!!");
        navigate("/admin/products");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create product.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500";
  const selectClass = "h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc]";
  const textareaClass = "min-h-[100px] py-2 w-full resize-none rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500";
  const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[0.04em] text-[#64748b] dark:text-[#a1a1aa]";

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] px-3 py-4 text-[#020617] dark:text-[#f8fafc] sm:px-4 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-2 flex items-center gap-2 text-sm text-[#64748b] dark:text-[#a1a1aa]">
          <Link to="/admin/products" className="hover:text-[#06b6d4]">Products</Link>
          <span className="text-[#64748b] dark:text-[#a1a1aa]">&gt;</span>
          <span className="font-semibold text-[#020617] dark:text-[#f8fafc]">Create New</span>
        </nav>
        <h1 className="text-2xl font-bold text-[#020617] dark:text-[#f8fafc] sm:text-3xl">Create New Product</h1>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">

          {/* Left card: Product Details */}
          <div className="rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] shadow-none">
            <div className="flex items-center gap-2 border-b border-[#e5e7eb] dark:border-[#27272a] px-5 py-4 text-sm font-bold text-[#020617] dark:text-[#f8fafc]">
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
                  {categories?.length === 0 ? (
                    <div className="flex flex-col gap-2">
                      <select disabled className={selectClass}>
                        <option>No categories available</option>
                      </select>
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        Create a category before adding products. <Link to="/admin/categories" className="underline font-bold text-[#06b6d4]">Manage Categories</Link>
                      </span>
                    </div>
                  ) : (
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
                  )}
                </div>

                <div>
                  <label className={labelClass}>SKU / Product Code</label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    value="Auto-generated"
                    className={`${inputClass}`}
                  />
                </div>
                <div>
                  <label className={labelClass}>SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className={inputClass}
                    placeholder="Enter SKU"
                  />
                </div>

                <div>
                  <label className={labelClass}>Barcode</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className={inputClass}
                    placeholder="Scan or type barcode"
                  />
                </div>

                <div>
                  <label className={labelClass}>Default Supplier</label>
                  <select
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">No default supplier</option>
                    {suppliers?.map(item => (
                      <option value={item._id} key={item._id}>{item.businessName || item.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Current Stock</label>
                  <input
                    type="number"
                    value={0}
                    readOnly
                    disabled
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-[#64748b] dark:text-[#a1a1aa]">
                    Stock is added from Receive Stock page.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Cost Price ($)*</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] dark:text-[#a1a1aa]">$</span>
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
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] dark:text-[#a1a1aa]">$</span>
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
            <div className="rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] shadow-none">
              <div className="flex items-center gap-2 border-b border-[#e5e7eb] dark:border-[#27272a] px-5 py-4 text-sm font-bold text-[#020617] dark:text-[#f8fafc]">
                Product Media
              </div>
              <div className="p-5">
                {!preview ? (
                  <label
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="flex h-[180px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] transition-colors hover:border-[#06b6d4] hover:bg-[#06b6d4]/5"
                  >
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#06b6d4]/10 text-[#06b6d4]">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    </div>
                    <span className="text-sm font-semibold text-[#020617] dark:text-[#f8fafc]">Click to upload</span>
                    <span className="mt-1 text-xs text-[#64748b] dark:text-[#a1a1aa]">Optional PNG or JPG up to 2MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                ) : (
                  <div className="relative flex h-[180px] w-full items-center justify-center rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] p-2">
                    <img src={preview} alt="Preview" className="h-full w-full object-contain" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm border border-[#e5e7eb] text-red-600 hover:bg-red-50 transition-colors dark:bg-[#111113] dark:border-[#27272a] dark:text-red-400 dark:hover:bg-red-500/10"
                      title="Remove image"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {(barcode || sku) && (
              <div className="rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] shadow-none">
                <div className="flex items-center justify-between gap-2 border-b border-[#e5e7eb] dark:border-[#27272a] px-5 py-4">
                  <span className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">Barcode & QR Preview</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">Save product before scanning in POS</span>
                </div>
                <div className="p-5 flex flex-col items-center bg-[#f8fafc] dark:bg-[#09090b]">
                   <ProductCodePreview value={barcode || sku} type="CODE128" />
                   <button
                     type="button"
                     onClick={() => setPrintModalOpen(true)}
                     className="mt-4 w-full rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#020617] dark:text-[#f8fafc] transition hover:bg-[#f8fafc] dark:hover:bg-white/5 active:scale-95"
                   >
                     Print Barcode / QR Label
                   </button>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] shadow-none">
              <div className="flex items-center gap-2 border-b border-[#e5e7eb] dark:border-[#27272a] px-5 py-4 text-sm font-bold text-[#020617] dark:text-[#f8fafc]">
                Settings
              </div>
              <div className="p-5 flex flex-col gap-5">
                <div className="flex items-center justify-between rounded-lg border border-[#e5e7eb] dark:border-[#27272a] p-3 bg-[#f8fafc] dark:bg-[#09090b]">
                  <div>
                    <div className="text-sm font-semibold text-[#020617] dark:text-[#f8fafc]">Product Status</div>
                    <div className="text-xs text-[#64748b] dark:text-[#a1a1aa]">Set product visibility</div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" checked={status} onChange={(e) => setStatus(e.target.checked)} />
                    <div className="peer h-6 w-11 rounded-full bg-[#e5e7eb] dark:bg-[#27272a] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[#e5e7eb] dark:after:border-[#27272a] after:bg-white dark:after:bg-[#f8fafc] after:transition-all after:content-[''] peer-checked:bg-[#06b6d4] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
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
                  <p className="mt-1 text-xs text-[#64748b] dark:text-[#a1a1aa]">You'll be notified when stock falls below this level.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex items-center justify-end gap-3 border-t border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] px-5 py-4">
            <Link
              to="/admin/products"
              className="rounded-lg border border-[#e5e7eb] bg-white text-[#020617] hover:bg-slate-50 dark:border-[#27272a] dark:bg-[#111113] dark:text-[#f8fafc] dark:hover:bg-white/5 px-4 py-2 text-sm font-semibold transition-colors flex h-10 items-center justify-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#06b6d4] text-white hover:bg-[#0891b2] rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors flex h-10 items-center justify-center"
            >
              {isSaving ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>

      <ProductLabelPrintModal 
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        previewData={{ name, salePrice, sku, barcode }}
      />
    </div>
  );
}

export default CreateProduct;
