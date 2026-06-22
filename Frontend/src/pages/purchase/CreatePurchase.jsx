import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import useFetchOneByCode from "../../hooks/useFetchOneByCode";
import toast from "react-hot-toast";
import useFetchData from "../../hooks/useFetchData";
import useCollection from "../../hooks/useCollection";
import { useNavigate } from "react-router";
import { apiUrl } from "../../configs/env";

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

  return (
    <div className="w-full max-w-full p-3 sm:p-4">
      <h1 className="text-xl font-semibold">Create Purchase</h1>

      <form onSubmit={handleSubmit} className="intro-y mt-5 rounded-lg bg-white p-4">
        <h3 className="text-base font-medium mt-1 w-fit mb-4 border-b border-slate-400 border-dashed">
          Import Product
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <fieldset>
            <label className="block">Supplier</label>
            <select
              onChange={(e) => setSupplier(e.target.value)}
              value={supplier}
              className="select w-full select-bordered"
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
            <label className="block">Invoice Number</label>
            <div className="flex items-center">
              <input
                type="number"
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="input w-full input-bordered"
                placeholder="Enter invoice number"
              />
            </div>
          </fieldset>
          <fieldset>
            <label className="block">Import Date</label>
            <div className="flex items-center">
              <input
                onChange={(e) => setPurchaseDate(e.target.value)}
                type="date"
                required
                className="input w-full input-bordered"
              />
            </div>
          </fieldset>
          <fieldset>
            <label className="block">Status</label>
            <div className="flex items-center">
              <select
                required
                className="select w-full select-bordered"
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
            <label className="block">Note</label>
            <textarea
              onChange={(e) => setNote(e.target.value)}
              className="textarea w-full textarea-bordered"
              placeholder="Type shipping address..."
            ></textarea>
          </fieldset>
        </div>

        <h3 className="text-base font-medium mt-8 mb-4 w-fit border-b border-slate-400 border-dashed">
          Product Details
        </h3>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="min-w-0 space-y-2 lg:col-span-4">
            <fieldset>
              <label className="block">Product Code</label>
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
                  className="input input-bordered w-full"
                  placeholder="e.g pro-0001"
                />
                <button
                  onClick={handleSearchProductByCode}
                  type="button"
                  className="btn btn-xs btn-neutral absolute top-0 right-2"
                >
                  +
                </button>
              </div>
            </fieldset>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <fieldset>
                <label className="block">Quantity</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    value={quantity}
                    className="input input-bordered w-full"
                  />
                </div>
              </fieldset>
              <fieldset>
                <label className="label-b">Unit Price (៛)</label>
                <div className="flex items-center">
                  <input
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    type="number"
                    value={unitPrice}
                    className="input input-bordered w-full"
                  />
                </div>
              </fieldset>
            </div>

            <fieldset>
              <label className="label-b">
                Total : <span className="text-red-600 font-semibold">{total.toLocaleString()} ៛</span>
              </label>
            </fieldset>
            <fieldset className="flex justify-end">
              <button
                onClick={handleAddToCart}
                type="button"
                className="btn btn-sm btn-neutral w-full sm:w-20"
              >
                Add
              </button>
            </fieldset>
          </div>

          <div className="min-w-0 lg:col-span-8">
            <div className="mt-3 max-w-full overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-[760px] w-full">
                <thead>
                  <tr className="bg-gray-200 text-sm">
                    <th className="text-left whitespace-nowrap p-4">Image</th>
                    <th className="text-left whitespace-nowrap p-4">Product</th>
                    <th className="text-right whitespace-nowrap p-4">Unit Price</th>
                    <th className="text-right whitespace-nowrap p-4">Qty</th>
                    <th className="text-right whitespace-nowrap p-4">Total</th>
                    <th className="text-right whitespace-nowrap p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {carts?.map((el) => (
                    <tr key={el.product} className="even:bg-gray-100">
                      <td className="py-2 p-4">
                        <img
                          className="w-10 h-10 object-cover rounded"
                          src={`${apiUrl}/upload/${el?.image}`}
                          alt=""
                        />
                      </td>
                      <td className="py-2 p-4">{el?.name}</td>

                     
                      <td className="text-right text-red-600">
                        {el?.unitPrice?.toLocaleString()} ៛
                      </td>
                      <td className="text-right">{el?.quantity}</td>
                      <td className="text-right text-red-600">
                        {el?.totalPrice?.toLocaleString()} ៛
                      </td>
                      <td className="text-center px-4">
                        <p
                          onClick={() => handleRemoveItem(el.product)}
                          className="text-red-600 w-full flex justify-end text-center space-x-1 mr-3 cursor-pointer"
                        >
                          <FaTrash className="w-4 h-4" />
                        </p>
                      </td>
                    </tr>
                  ))}

                  <tr className="bg-gray-200 border-t">
                    <td colSpan="6" className="text-right p-4 font-semibold uppercase">
                      Total Cost : <span className="text-red-600">{totalCost?.toLocaleString()} ៛</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <fieldset className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button type="button" className="btn btn-sm w-full sm:w-20">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn btn-sm btn-neutral w-full sm:w-20">
            Save
          </button>
        </fieldset>
      </form>
    </div>
  );
}

export default CreatePurchase;
