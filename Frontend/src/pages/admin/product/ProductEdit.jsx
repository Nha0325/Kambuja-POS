import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery } from "../../../hooks/common/useQuery";
import useStorage from "../../../hooks/common/useStorage";
import { useCollection } from "../../../hooks/common/useCollection";
import { useFindById } from "../../../hooks/common/useFindById";
import { getImageUrl } from "../../../utils/helpers/getImageUrl";
import ProductCodePreview from "../../../components/product/ProductCodePreview";
import ProductLabelPrintModal from "../../../components/product/ProductLabelPrintModal";
import { useTranslation } from "react-i18next";

function EditProduct() {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const [note, setNote] = useState("");
  const [oldImageUrl, setOldImageUrl] = useState("");
  const [status, setStatus] = useState(true);
  const [reorderLevel, setReorderLevel] = useState(10);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const route = useParams();
  const navigate = useNavigate();

  const { data: categories } = useQuery("categories", "", 1, 100);
  const { uploadFile, removeFile } = useStorage();
  const { update } = useCollection("products");
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
    setIsSaving(true);
    try {
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

      const data = {
        name,
        category,
        sku: sku.trim(),
        barcode: barcode.trim(),
        costPrice: cost,
        salePrice: sale,
        lowStockThreshold: Number(reorderLevel),
        reorderLevel: Number(reorderLevel),
        status: status ? "ACTIVE" : "INACTIVE",
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
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (product && isFinding === false) {
      setName(product?.name || "");
      setCategory(product?.category?._id || "");
      setSku(product?.sku || "");
      setBarcode(product?.barcode || "");
      setCostPrice(product?.costPrice || "");
      setCurrentStock(product?.stock ?? product?.currentStock ?? 0);
      setSalePrice(product?.salePrice || "");
      setNote(product?.note || "");
      setStatus(product?.status === "ACTIVE" || product?.status === undefined ? true : false);
      setReorderLevel(product?.lowStockThreshold ?? product?.reorderLevel ?? 10);

      if (product?.imageUrl) {
        setPreview(getImageUrl(product?.imageUrl));
        setOldImageUrl(product?.imageUrl);
      }
    }
  }, [product, isFinding]);

  const numCost = Number(costPrice) || 0;
  const numSale = Number(salePrice) || 0;
  const numStock = Number(currentStock) || 0;
  
  const margin = numSale > 0 ? (((numSale - numCost) / numSale) * 100).toFixed(1) : 0;
  const estProfit = ((numSale - numCost) * numStock).toFixed(2);
  const turnover = numStock <= 10 ? t('low') : numStock <= 50 ? t('medium') : t('high');
  const stockBadge = numStock > 0 ? t('in_stock') : t('out_of_stock');

  const inputClass = "h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500";
  const selectClass = "h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc]";
  const textareaClass = "min-h-[100px] py-2 w-full resize-none rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500";
  const labelClass = "block text-xs font-semibold uppercase tracking-[0.04em] text-[#64748b] dark:text-[#a1a1aa] mb-2";

  if (isFinding) {
    return <div className="flex h-screen w-full items-center justify-center"><span className="loading loading-spinner loading-lg text-[#06b6d4]"></span></div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] px-3 py-4 text-[#020617] dark:text-[#f8fafc] sm:px-4 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-2 flex items-center gap-2 text-sm text-[#64748b] dark:text-[#a1a1aa]">
          <Link to="/admin/products" className="hover:text-[#06b6d4] transition-colors">{t('products')}</Link>
          <span className="text-[#64748b] dark:text-[#a1a1aa]">&gt;</span>
          <span className="font-semibold text-[#020617] dark:text-[#f8fafc]">{t('edit_product')}</span>
        </nav>
        
        <h1 className="text-2xl font-bold text-[#020617] dark:text-[#f8fafc] sm:text-3xl">{t('edit_product')}</h1>
        <p className="mt-1 text-sm text-[#64748b] dark:text-[#a1a1aa]">{t('manage_details_inventory', { name: product?.name || name || 'Product' })}</p>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          
          {/* Left card: Product Information */}
          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] shadow-none">
              <div className="flex items-center gap-2 border-b border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] px-5 py-4 text-sm font-bold text-[#020617] dark:text-[#f8fafc]">
                {t('product_details')}
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>{t('product_name_req')}</label>
                    <input 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text" 
                      placeholder={t('enter_product_name')} 
                      className={inputClass} 
                    />
                  </div>

                  <div>
                    <label className={labelClass}>{t('category_req')}</label>
                    {categories?.length === 0 ? (
                      <div className="flex flex-col gap-2">
                        <select disabled className={selectClass}>
                          <option>{t('no_categories_available')}</option>
                        </select>
                        <span className="text-xs text-amber-600">
                          {t('create_category_before_adding')} <Link to="/admin/categories" className="underline font-bold">{t('manage_categories')}</Link>
                        </span>
                      </div>
                    ) : (
                      <select 
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={selectClass}
                      >
                        <option value="" disabled>{t('choose_category')}</option>
                        {categories?.map(item => (
                          <option value={item._id} key={item._id}>{item.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>{t('sku_product_code')}</label>
                    <input 
                      type="text"
                      disabled
                      readOnly
                      value={product?.code || t('auto_generated')}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>{t('sku')}</label>
                    <input 
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder={t('enter_sku')} 
                      className={inputClass} 
                    />
                  </div>

                  <div>
                    <label className={labelClass}>{t('barcode')}</label>
                    <input 
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder={t('scan_or_type_barcode')} 
                      className={inputClass} 
                    />
                  </div>

                  <div>
                    <label className={labelClass}>{t('current_stock')}</label>
                    <input 
                      type="number"
                      readOnly
                      disabled
                      value={currentStock}
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs text-[#64748b] dark:text-[#a1a1aa]">
                      {t('stock_added_from_receive_stock')}
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>{t('cost_price_req')}</label>
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
                    <label className={labelClass}>{t('sale_price_req')}</label>
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
                    <label className={labelClass}>{t('note')}</label>
                    <textarea 
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className={textareaClass}
                      placeholder={t('type_product_notes_here')}
                    />
                  </div>
                </div>

                {/* Inventory Health Box */}
                <div className="mt-6 rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{t('inventory_health')}</h4>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${numStock > 0 ? "bg-[#06b6d4]/10 text-[#06b6d4] dark:bg-[#06b6d4]/20 dark:text-[#a78bfa]" : "bg-red-500/10 text-red-500"}`}>
                      {stockBadge}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg bg-white dark:bg-[#111113] p-3 shadow-sm border border-[#e5e7eb] dark:border-[#27272a]">
                      <p className="mb-1 text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">{t('margin')}</p>
                      <p className="text-xl font-bold text-[#020617] dark:text-[#f8fafc]">{margin}%</p>
                    </div>
                    <div className="rounded-lg bg-white dark:bg-[#111113] p-3 shadow-sm border border-[#e5e7eb] dark:border-[#27272a]">
                      <p className="mb-1 text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">{t('est_profit')}</p>
                      <p className="text-xl font-bold text-[#020617] dark:text-[#f8fafc]">${estProfit}</p>
                    </div>
                    <div className="rounded-lg bg-white dark:bg-[#111113] p-3 shadow-sm border border-[#e5e7eb] dark:border-[#27272a]">
                      <p className="mb-1 text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa] uppercase tracking-wider">{t('turnover')}</p>
                      <p className="text-xl font-bold text-[#020617] dark:text-[#f8fafc]">{turnover}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Product Media & Settings & Audit Trail */}
          <div className="flex flex-col gap-6">
            {/* Product Media Card */}
            <div className="overflow-hidden rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] shadow-none">
              <div className="flex items-center gap-2 border-b border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] px-5 py-4 text-sm font-bold text-[#020617] dark:text-[#f8fafc]">
                {t('product_media')}
              </div>
              <div className="p-5">
                {!preview ? (
                  <label 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="flex h-[260px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] transition-colors hover:border-[#06b6d4] dark:hover:border-[#06b6d4] hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#06b6d4]/10 text-[#06b6d4] dark:bg-[#06b6d4]/20 dark:text-[#a78bfa]">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    </div>
                    <span className="text-sm font-semibold text-[#020617] dark:text-[#f8fafc]">{t('click_to_upload')}</span>
                    <span className="mt-1 text-xs text-[#64748b] dark:text-[#a1a1aa]">{t('optional_png_jpg_2mb')}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                ) : (
                  <div className="relative flex h-[260px] w-full flex-col items-center justify-center rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] p-2">
                    <img src={preview} alt="Preview" className="h-full w-full object-contain" />
                    <button 
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-[#111113] shadow-sm border border-[#e5e7eb] dark:border-[#27272a] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      title={t('remove_image')}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] shadow-none">
                <div className="flex items-center justify-between gap-2 border-b border-[#e5e7eb] dark:border-[#27272a] px-5 py-4">
                  <span className="text-sm font-bold text-[#020617] dark:text-[#f8fafc]">{t('barcode_qr_preview')}</span>
                </div>
                <div className="p-5 flex flex-col items-center bg-[#f8fafc] dark:bg-[#09090b]">
                   <ProductCodePreview value={product?.code || barcode || sku} type="CODE128" />
                   <button
                     type="button"
                     onClick={() => setPrintModalOpen(true)}
                     className="mt-4 w-full rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#020617] dark:text-[#f8fafc] transition hover:bg-[#f8fafc] dark:hover:bg-white/5 active:scale-95"
                   >
                     {t('print_barcode_qr_label')}
                   </button>
                </div>
            </div>

            {/* Visibility & Status Card */}
            <div className="overflow-hidden rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] shadow-none">
              <div className="flex items-center gap-2 border-b border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] px-5 py-4 text-sm font-bold text-[#020617] dark:text-[#f8fafc]">
                {t('settings')}
              </div>
              <div className="p-5 flex flex-col gap-5">
                <div className="flex items-center justify-between rounded-lg border border-[#e5e7eb] dark:border-[#27272a] p-3 bg-[#f8fafc] dark:bg-[#09090b]">
                  <div>
                    <div className="text-sm font-semibold text-[#020617] dark:text-[#f8fafc]">{t('product_status')}</div>
                    <div className="text-xs text-[#64748b] dark:text-[#a1a1aa]">{t('set_product_visibility')}</div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" checked={status} onChange={(e) => setStatus(e.target.checked)} />
                    <div className="peer h-6 w-11 rounded-full bg-[#e5e7eb] dark:bg-[#27272a] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 dark:after:border-zinc-500 after:bg-white dark:after:bg-zinc-300 after:transition-all after:content-[''] peer-checked:bg-[#06b6d4] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                  </label>
                </div>

                <div>
                  <label className={labelClass}>{t('low_stock_alert_threshold')}</label>
                  <input 
                    type="number"
                    min="1"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-[#64748b] dark:text-[#a1a1aa]">{t('low_stock_alert_desc')}</p>
                </div>
              </div>
            </div>

            {/* Audit Trail Card */}
            <div className="overflow-hidden rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] shadow-none">
              <div className="flex items-center gap-2 border-b border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] px-5 py-4 text-sm font-bold text-[#020617] dark:text-[#f8fafc]">
                {t('audit_trail')}
              </div>
              <div className="p-5">
                {product?.createdAt ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#e5e7eb] dark:bg-[#27272a]"></div>
                      <div>
                        <p className="text-sm font-semibold text-[#020617] dark:text-[#f8fafc]">{t('product_created')}</p>
                        <p className="text-xs text-[#64748b] dark:text-[#a1a1aa]">{new Date(product.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {product?.updatedAt && product.updatedAt !== product.createdAt && (
                      <div className="flex items-start gap-3">
                        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#06b6d4]"></div>
                        <div>
                          <p className="text-sm font-semibold text-[#020617] dark:text-[#f8fafc]">{t('product_updated_audit')}</p>
                          <p className="text-xs text-[#64748b] dark:text-[#a1a1aa]">{new Date(product.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#64748b] dark:text-[#a1a1aa]">{t('no_audit_data')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="lg:col-span-2 flex items-center justify-end gap-3 border-t border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] px-5 py-4">
            <Link 
              to="/admin/products"
              className="rounded-lg border border-[#e5e7eb] bg-white text-[#020617] hover:bg-slate-50 dark:border-[#27272a] dark:bg-[#111113] dark:text-[#f8fafc] dark:hover:bg-white/5 px-6 py-2 text-sm font-semibold transition-colors flex items-center justify-center h-11 w-full sm:w-auto"
            >
              {t('cancel')}
            </Link>
            <button 
              type="submit"
              disabled={isSaving}
              className="bg-[#06b6d4] text-white hover:bg-[#0891b2] rounded-lg px-6 py-2 text-sm font-semibold disabled:opacity-60 transition-colors flex items-center justify-center h-11 w-full sm:w-auto"
            >
              {isSaving ? t('saving') : t('save_product')}
            </button>
          </div>
        </form>
      </div>

      <ProductLabelPrintModal 
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        product={product}
        previewData={{ name, salePrice, sku, barcode }}
      />
    </div>
  );
}

export default EditProduct;
