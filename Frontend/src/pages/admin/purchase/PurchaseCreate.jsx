import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import useFetchOneByCode from "../../../hooks/useFetchOneByCode";
import toast from "react-hot-toast";
import useFetchData from "../../../hooks/useFetchData";
import useCollection from "../../../hooks/useCollection";
import { useNavigate } from "react-router";
import { baseUrl } from "../../../configs/env";

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

  const { fetchData } = useFetchOneByCode();

  const { data: suppliers } = useFetchData("suppliers", 1, 10, "");
  const { create, isLoading } = useCollection("purchases");

  const handleSearchProductByCode = async () => {
    if (!productCode) {
      toast.error("Please enter product code");
      return;
    }
    try {
      const data = await fetchData(`/products/code`, productCode.toLowerCase());
      if (data) {
        setUnitPrice(data?.costPrice || 0); 
        setProduct(data);
      } else {
        toast.error("Product not found!");
      }
    } catch {
      toast.error("Error searching product.");
    }
  };

  const handleAddToCart = () => {
    if (!product?._id) {
      toast.error("សូមស្វែងរកផលិតផលតាមលេខកូដសិន!");
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
      toast.error("ផលិតផលនេះមានក្នុងបញ្ជីរួចហើយ!");
      return;
    }

    if (data.quantity <= 0) {
      toast.error("ចំនួនទំនិញត្រូវតែធំជាង 0!");
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
      toast.error("សូមបន្ថែមផលិតផលទៅក្នុងបញ្ជីទិញ!");
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
        toast.success("បានបង្កើតការទិញចូលស្តុកដោយជោគជ័យ!");
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

  const inputClass = "h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#7033ff] focus:ring-2 focus:ring-[#7033ff]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"
  const selectClass = "h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] outline-none transition focus:border-[#7033ff] focus:ring-2 focus:ring-[#7033ff]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc]"
  const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[0.04em] text-[#64748b] dark:text-[#a1a1aa]"
  const textareaClass = "min-h-[100px] py-2 w-full resize-none rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#7033ff] focus:ring-2 focus:ring-[#7033ff]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] px-3 py-4 text-[#020617] dark:text-[#f8fafc] sm:px-4 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-[#020617] dark:text-[#f8fafc] sm:text-3xl mb-6">Create Purchase</h1>

        <form onSubmit={handleSubmit} className="rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] p-5 md:p-6 shadow-none">
          <h3 className="text-base font-semibold mt-1 mb-6 pb-2 w-fit border-b-2 border-[#7033ff] text-[#020617] dark:text-[#f8fafc]">
            Import Product
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <fieldset>
              <label className={labelClass}>Supplier</label>
              <select
                onChange={(e) => setSupplier(e.target.value)}
                value={supplier}
                className={selectClass}
              required
            >
              <option value="" disabled>
                Select supplier
              </option>
              {suppliers?.map((el) => (
                <option key={el._id} value={el?._id}>
                  {el?.businessName}
                </option>
              ))}
            </select>
            </fieldset>
            <fieldset>
              <label className={labelClass}>Invoice Number</label>
              <div className="flex items-center">
                <input
                  type="number"
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className={inputClass}
                  placeholder="Enter invoice number"
                />
              </div>
            </fieldset>
            <fieldset>
              <label className={labelClass}>Import Date</label>
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
              <label className={labelClass}>Status</label>
              <div className="flex items-center">
                <select
                  required
                  className={selectClass}
                  value={purchaseStatus}
                  onChange={(e) => setPurchaseStatus(e.target.value)}
                >
                <option value="" disabled>
                  Select Purchase Status
                </option>
                <option value="received">Received</option>
                <option value="pending">Pending</option>
                <option value="ordered">Ordered</option>
                </select>
              </div>
            </fieldset>

            <fieldset className="md:col-span-2 xl:col-span-4">
              <label className={labelClass}>Note</label>
              <textarea
                onChange={(e) => setNote(e.target.value)}
                className={textareaClass}
                placeholder="Type shipping address..."
              ></textarea>
            </fieldset>
          </div>

          <h3 className="text-base font-semibold mt-10 mb-6 pb-2 w-fit border-b-2 border-[#7033ff] text-[#020617] dark:text-[#f8fafc]">
            Product Details
          </h3>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="min-w-0 space-y-6 lg:col-span-4 rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] p-5">
              <fieldset>
                <label className={labelClass}>Product Code</label>
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
                    placeholder="e.g pro-0001"
                  />
                  <button
                    onClick={handleSearchProductByCode}
                    type="button"
                    className="absolute top-1 right-1 h-8 px-3 rounded-md bg-[#7033ff] text-white font-bold hover:bg-[#5f27e6] transition-colors"
                  >
                    +
                  </button>
                </div>
              </fieldset>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <fieldset>
                  <label className={labelClass}>Quantity</label>
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
                  <label className={labelClass}>Unit Price ($)</label>
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
                  Total : <span className="text-red-500 font-bold ml-1">${total.toFixed(2)}</span>
                </label>
              </fieldset>
              <fieldset className="flex justify-end pt-2 border-t border-[#e5e7eb] dark:border-[#27272a]">
                <button
                  onClick={handleAddToCart}
                  type="button"
                  className="bg-[#7033ff] text-white hover:bg-[#5f27e6] rounded-lg px-4 py-2 text-sm font-semibold transition-colors w-full"
                >
                  Add Item
                </button>
              </fieldset>
            </div>

            <div className="min-w-0 lg:col-span-8">
              <div className="max-w-full overflow-x-auto rounded-lg border border-[#e5e7eb] dark:border-[#27272a]">
                <table className="min-w-[760px] w-full text-sm">
                  <thead>
                    <tr className="bg-[#f8fafc] dark:bg-[#09090b] text-left text-xs font-bold uppercase tracking-[0.05em] text-[#64748b] dark:text-[#a1a1aa] border-b border-[#e5e7eb] dark:border-[#27272a]">
                      <th className="p-4">Image</th>
                      <th className="p-4">Product</th>
                      <th className="p-4 text-right">Unit Price</th>
                      <th className="p-4 text-right">Qty</th>
                      <th className="p-4 text-right">Total</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
                    {carts?.map((el) => (
                      <tr key={el.product} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <img
                            className="w-10 h-10 object-cover rounded-lg border border-[#e5e7eb] dark:border-[#27272a]"
                            src={`${baseUrl}/upload/${el?.image}`}
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
                        Total Cost : <span className="text-red-500 text-sm font-bold ml-2">${Number(totalCost || 0).toFixed(2)}</span>
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
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="bg-[#7033ff] text-white hover:bg-[#5f27e6] rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors flex items-center justify-center h-10 w-full sm:w-auto"
            >
              {isLoading ? "Saving..." : "Save Purchase"}
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}

export default CreatePurchase;
