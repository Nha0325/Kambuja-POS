import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import useFetchOneByCode from "../../../hooks/common/useFetchOneByCode";
import toast from "react-hot-toast";
import useFetchData from "../../../hooks/common/useFetchData";
import useCollection from "../../../hooks/common/useCollection";
import { useNavigate, Link } from "react-router";
import { getImageUrl } from "../../../utils/helpers/getImageUrl";
import { useTranslation } from "react-i18next";

function CreatePurchase() {
  const [productCode, setProductCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [total, setTotal] = useState(0);
  const [product, setProduct] = useState({});
  const [carts, setCarts] = useState([]);

  const [supplier, setSupplier] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchaseStatus, setPurchaseStatus] = useState("");
  const [note, setNote] = useState("");
  const [totalCost, setTotalCost] = useState(0);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const { fetchData } = useFetchOneByCode();

  const { data: suppliers } = useFetchData("suppliers", 1, 10, "");
  const { create, isLoading } = useCollection("purchases");

  const handleSearchProductByCode = async () => {
    if (!productCode) {
      toast.error(t('enter_product_code_req'));
      return;
    }
    try {
      const data = await fetchData(`/products/code`, productCode.toLowerCase());
      if (data) {
        setUnitPrice(data?.costPrice || 0); 
        setProduct(data);
      } else {
        toast.error(t('product_not_found_msg_2'));
      }
    } catch {
      toast.error(t('error_searching_product'));
    }
  };

  const handleAddToCart = () => {
    if (!product?._id) {
      toast.error(t('search_product_first_req'));
      return;
    }

    const data = {
      product: product._id,
      name: product.name,
      image: product.imageUrl,
      quantity: quantity * 1,
      unitPrice: unitPrice * 1,
      totalPrice: total,
    };

    const exist = carts.find((el) => el.product == data.product);
    if (exist) {
      toast.error(t('product_already_in_cart'));
      return;
    }

    if (data.quantity <= 0) {
      toast.error(t('qty_greater_than_0_req'));
      return;
    }

    setCarts([...carts, data]);
    clearForm();
  };

  const handleRemoveItem = (id) => {
    const updateCarts = carts.filter((el) => el.product != id);
    setCarts(updateCarts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (carts.length <= 0) {
      toast.error(t('add_product_to_purchase_list'));
      return;
    }


    const data = {
      invoiceNumber,
      purchaseDate,
      purchaseStatus,
      totalCost,
      note,
      supplier: supplier, 
      items: carts,
    };

    try {
      const res = await create(data);
      if (res) {
        toast.success(t('purchase_created_success'));
        navigate("/admin/purchases");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create purchase.");
    }
  };

  function clearForm() {
    setTotal(0);
    setQuantity(1);
    setUnitPrice(0);
    setProduct({});
    setProductCode("");
  }

  useEffect(() => {
    const amount = quantity * unitPrice;
    setTotal(amount);
  }, [quantity, unitPrice]);

  useEffect(() => {
    const total = carts.reduce((acc, item) => acc + item.totalPrice, 0);
    setTotalCost(total);
  }, [carts]);

  const inputClass = "h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"
  const selectClass = "h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc]"
  const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[0.04em] text-[#64748b] dark:text-[#a1a1aa]"
  const textareaClass = "min-h-[100px] py-2 w-full resize-none rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] px-3 py-4 text-[#020617] dark:text-[#f8fafc] sm:px-4 lg:px-6">
      <div className="mx-auto max-w-8xl">
        <nav className="mb-2 flex items-center gap-2 text-sm text-[#64748b] dark:text-[#a1a1aa]">
          <Link to="/admin/purchases" className="hover:text-[#06b6d4]">{t('purchases')}</Link>
          <span className="text-[#64748b] dark:text-[#a1a1aa]">&gt;</span>
          <span className="font-semibold text-[#020617] dark:text-[#f8fafc]">{t('create_purchase')}</span>
        </nav>
        <h1 className="text-2xl font-bold text-[#020617] dark:text-[#f8fafc] sm:text-3xl mb-6">{t('create_purchase')}</h1>

        <form onSubmit={handleSubmit} className="rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] p-5 md:p-6 shadow-none">
          <h3 className="text-base font-semibold mt-1 mb-6 pb-2 w-fit border-b-2 border-[#06b6d4] text-[#020617] dark:text-[#f8fafc]">
            {t('import_product')}
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <fieldset>
              <label className={labelClass}>{t('supplier')}</label>
              <select
                onChange={(e) => setSupplier(e.target.value)}
                value={supplier}
                className={selectClass}
              required
            >
              <option value="" disabled>
                {t('select_supplier')}
              </option>
              {suppliers?.map((el) => (
                <option key={el._id} value={el?._id}>
                  {el?.businessName}
                </option>
              ))}
            </select>
            </fieldset>
            <fieldset>
              <label className={labelClass}>{t('invoice_number')}</label>
              <div className="flex items-center">
                <input
                  type="number"
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className={inputClass}
                  placeholder={t('enter_invoice_number')}
                />
              </div>
            </fieldset>
            <fieldset>
              <label className={labelClass}>{t('import_date')}</label>
              <div className="flex items-center">
                <input
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  type="date"
                  required
                  className={inputClass}
                />
              </div>
            </fieldset>
            <fieldset>
              <label className={labelClass}>{t('status')}</label>
              <div className="flex items-center">
                <select
                  required
                  className={selectClass}
                  value={purchaseStatus}
                  onChange={(e) => setPurchaseStatus(e.target.value)}
                >
                <option value="" disabled>
                  {t('select_purchase_status')}
                </option>
                <option value="received">{t('received')}</option>
                <option value="pending">{t('pending')}</option>
                <option value="ordered">{t('ordered')}</option>
                </select>
              </div>
            </fieldset>

            <fieldset className="md:col-span-2 xl:col-span-4">
              <label className={labelClass}>{t('note')}</label>
              <textarea
                onChange={(e) => setNote(e.target.value)}
                className={textareaClass}
                placeholder={t('type_shipping_address')}
              ></textarea>
            </fieldset>
          </div>

          <h3 className="text-base font-semibold mt-10 mb-6 pb-2 w-fit border-b-2 border-[#06b6d4] text-[#020617] dark:text-[#f8fafc]">
            {t('product_details')}
          </h3>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="min-w-0 space-y-6 lg:col-span-4 rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] p-5">
              <fieldset>
                <label className={labelClass}>{t('product_code')}</label>
                <div className="flex items-center relative">
                <input
                  type="text"
                  onChange={(e) => setProductCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchProductByCode();
                    }
                  }}
                    value={productCode}
                    className={`${inputClass} pr-12`}
                    placeholder={t('eg_product_code')}
                  />
                  <button
                    onClick={handleSearchProductByCode}
                    type="button"
                    className="absolute top-1 right-1 h-8 px-3 rounded-md bg-[#06b6d4] text-white font-bold hover:bg-[#0891b2] transition-colors"
                  >
                    +
                  </button>
                </div>
              </fieldset>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <fieldset>
                  <label className={labelClass}>{t('quantity')}</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      value={quantity}
                      className={inputClass}
                    />
                  </div>
                </fieldset>
                <fieldset>
                  <label className={labelClass}>{t('unit_price_usd')}</label>
                  <div className="flex items-center relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] dark:text-[#a1a1aa]">$</span>
                    <input
                      onChange={(e) => setUnitPrice(Number(e.target.value))}
                      type="number"
                      value={unitPrice}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </fieldset>
              </div>

              <fieldset>
                <label className="text-sm font-semibold text-[#020617] dark:text-[#f8fafc]">
                  {t('total')} : <span className="text-red-500 font-bold ml-1">${total.toFixed(2)}</span>
                </label>
              </fieldset>
              <fieldset className="flex justify-end pt-2 border-t border-[#e5e7eb] dark:border-[#27272a]">
                <button
                  onClick={handleAddToCart}
                  type="button"
                  className="bg-[#06b6d4] text-white hover:bg-[#0891b2] rounded-lg px-4 py-2 text-sm font-semibold transition-colors w-full"
                >
                  {t('add_item')}
                </button>
              </fieldset>
            </div>

            <div className="min-w-0 lg:col-span-8">
              <div className="max-w-full overflow-x-auto rounded-lg border border-[#e5e7eb] dark:border-[#27272a]">
                <table className="min-w-[760px] w-full text-sm">
                  <thead>
                    <tr className="bg-[#f8fafc] dark:bg-[#09090b] text-left text-xs font-bold uppercase tracking-[0.05em] text-[#64748b] dark:text-[#a1a1aa] border-b border-[#e5e7eb] dark:border-[#27272a]">
                      <th className="p-4">{t('image')}</th>
                      <th className="p-4">{t('product')}</th>
                      <th className="p-4 text-right">{t('unit_price')}</th>
                      <th className="p-4 text-right">{t('qty')}</th>
                      <th className="p-4 text-right">{t('total')}</th>
                      <th className="p-4 text-right">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
                    {carts?.map((el) => (
                      <tr key={el.product} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <img
                            className="w-10 h-10 object-cover rounded-lg border border-[#e5e7eb] dark:border-[#27272a]"
                            src={getImageUrl(el?.image)}
                            alt=""
                          />
                        </td>
                        <td className="p-4 font-semibold text-[#020617] dark:text-[#f8fafc]">{el?.name}</td>

                     
                        <td className="text-right p-4 text-[#020617] dark:text-[#f8fafc]">
                          ${Number(el?.unitPrice || 0).toFixed(2)}
                        </td>
                        <td className="text-right p-4 text-[#020617] dark:text-[#f8fafc]">{el?.quantity}</td>
                        <td className="text-right p-4 font-bold text-red-500">
                          ${Number(el?.totalPrice || 0).toFixed(2)}
                        </td>
                        <td className="text-right p-4">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(el.product)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-colors inline-flex justify-center items-center"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </td>
                    </tr>
                  ))}

                    <tr className="bg-[#f8fafc] dark:bg-[#09090b]">
                      <td colSpan="6" className="text-right p-4 text-[#020617] dark:text-[#f8fafc] font-semibold uppercase tracking-wider text-xs">
                        {t('total_cost')} : <span className="text-red-500 text-sm font-bold ml-2">${Number(totalCost || 0).toFixed(2)}</span>
                      </td>
                    </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

          <fieldset className="mt-8 pt-6 flex flex-col-reverse gap-3 border-t border-[#e5e7eb] dark:border-[#27272a] sm:flex-row sm:items-center sm:justify-end">
            <button 
              type="button" 
              onClick={() => navigate("/admin/purchases")}
              className="rounded-lg border border-[#e5e7eb] bg-white text-[#020617] hover:bg-slate-50 dark:border-[#27272a] dark:bg-[#111113] dark:text-[#f8fafc] dark:hover:bg-white/5 px-4 py-2 text-sm font-semibold transition-colors flex items-center justify-center h-10 w-full sm:w-auto"
            >
              {t('cancel')}
            </button>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="bg-[#06b6d4] text-white hover:bg-[#0891b2] rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors flex items-center justify-center h-10 w-full sm:w-auto"
            >
              {isLoading ? t('saving') : t('save_purchase')}
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}

export default CreatePurchase;
