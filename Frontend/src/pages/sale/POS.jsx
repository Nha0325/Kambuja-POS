import { useEffect, useState } from "react";
import useFetchData from "../../hooks/useFetchData";
import { useCheckStock } from "../../hooks/useCheckStock";
import toast from "react-hot-toast";
import useCollection from "../../hooks/useCollection";
import Modal from "../../components/Modal";
import useFetchOneByCode from "../../hooks/useFetchOneByCode";
import { LuScanBarcode } from "react-icons/lu";
import { apiUrl } from "../../configs/env";
import Loading from "../../components/Loading";

function POS() {
  const [category, setCategory] = useState(null);
  const [condition, setCondition] = useState("");
  const [search, setSearch] = useState("");
  const [carts, setCarts] = useState([]);
  const [open, setOpen] = useState(false);
  const { data: products, isLoading: productsLoading } = useFetchData("products", 1, 50, "", condition, false);
  const { data: categories, isLoading: categoriesLoading } = useFetchData("categories", 1, 50);
  const { checkStock } = useCheckStock();
  const [totalCost, setTotalCost] = useState(0); 
  const { create, isLoading } = useCollection("sales");
  const [printReceipt, setPrintReceipt] = useState(true);
  const [paidAmount, setPaidAmount] = useState(0);

  const { fetchData } = useFetchOneByCode();

  const handleAddToCart = async (item) => {
    if (!item) return;
    
    // Determine current quantity in cart to check stock accurately
    const exist = carts.find((el) => el.product === item._id);
    const currentQty = exist ? exist.quantity : 0;

    const res = await checkStock(item._id, currentQty + 1);
    
    if (res?.success) {
      setCarts((prevCarts) => {
        // Re-check existence inside the state setter to handle rapid consecutive clicks/scans
        const alreadyInCart = prevCarts.find((el) => el.product === item._id);
        if (alreadyInCart) {
          return prevCarts.map((el) =>
            el.product === item._id
              ? { ...el, quantity: el.quantity + 1, totalPrice: (el.quantity + 1) * el.unitPrice }
              : el
          );
        }
        return [
          ...prevCarts,
          {
            product: item._id,
            name: item.name,
            quantity: 1,
            unitPrice: item.salePrice,
            totalPrice: item.salePrice,
          },
        ];
      });
    }
  };

  const handleCartIncrement = async (id) => {
    const item = carts.find((el) => el.product === id);
    if (item) {
      const res = await checkStock(id, item.quantity + 1); 
      if (res?.success) handleIncrement(id);
    }
  };

  const handleAddToCartKeyDown = async (e) => {
    if (e.key === "Enter") {
      if (!search.trim()) return;
      const res = await fetchData("/products/code", search.toLocaleLowerCase());
      if (res) handleAddToCart(res);
      else toast.error("រកមិនឃើញកូដទំនិញនេះទេ!");
      setSearch("");
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (carts.length <= 0) return toast.error("Please add product to cart!");

    const paid = Number(paidAmount || 0);
    // Recalculate total cost to ensure accuracy during submission
    const currentTotal = carts.reduce((acc, item) => acc + item.totalPrice, 0);
    const payload = {
      items: carts.map(({ product, quantity, unitPrice, totalPrice }) => ({ 
        product, 
        quantity: Number(quantity), 
        unitPrice: Number(unitPrice), 
        totalPrice: Number(totalPrice) 
      })),
      totalCost: Number(currentTotal),
      paidAmount: paid
    };

    try {
      const res = await create(payload);
      if (res) {
        toast.success("Sale created successfully!");
        setOpen(false);
        setPaidAmount(0);
        setTotalCost(0);
        setCarts([]);
        if (printReceipt) {
          window.open(`/cashier/invoice/${res._id}`, '_blank');
        }
      }
    } catch (error) {
      const serverMsg = error.response?.data?.details || error.response?.data?.error || "Sale submission failed";
      let errorMessage = serverMsg; // Default to generic message
      if (error.response) {
        if (error.response.status === 404) {
          const htmlData = error.response.data;
          const match = htmlData.match(/<pre>Cannot POST (\/[^<]+)<\/pre>/);
          errorMessage = match && match[1] ? `API endpoint '${match[1]}' not found or does not support POST requests. Please check the server status and API route configuration.` : "API endpoint not found. Please check the server status and API route configuration.";
        } else {
          errorMessage = error.response?.data?.details || error.response?.data?.error || errorMessage;
        }
      }
      toast.error(errorMessage);
    }
  };

  const handleIncrement = (id) => {
    setCarts(prev => prev.map(el => el.product === id ? { ...el, quantity: el.quantity + 1, totalPrice: (el.quantity + 1) * el.unitPrice } : el));
  };

  const handleDecrement = (id) => {
    setCarts(prev => prev.map(el => el.product === id && el.quantity > 1 ? { ...el, quantity: el.quantity - 1, totalPrice: (el.quantity - 1) * el.unitPrice } : el));
  };

  const handleRemoveItem = (id) => setCarts(prev => prev.filter(el => el.product !== id));

  const handleCategoryFilter = (catId) => {
    setCategory(catId);
    setCondition(catId ? `category=${catId}` : "");
  };

  useEffect(() => {
    setTotalCost(carts.reduce((acc, item) => acc + item.totalPrice, 0));
  }, [carts]);

  if (productsLoading || categoriesLoading) return <Loading />;

  return (
    <div className="p-4 w-full">
      <h1 className="text-2xl font-bold text-gray-800">Point of Sale</h1>
      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-12 lg:col-span-8">
            <div className="mb-3 bg-white p-3 shadow-sm rounded-lg border border-gray-100 flex items-center justify-between">
                <h1 className="font-semibold text-lg">Categories</h1>
                <label className="input input-sm input-bordered flex items-center gap-2">
                  <LuScanBarcode size={18}/>
                  <input onChange={(e) => setSearch(e.target.value)} value={search} onKeyDown={handleAddToCartKeyDown} placeholder="Scan code..." />
                </label>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
                <button onClick={() => handleCategoryFilter(null)} className={`btn btn-xs rounded-full ${!category ? 'btn-neutral' : 'btn-outline'}`}>All</button>
                {categories?.map((cat) => (
                  <button key={cat._id} onClick={() => handleCategoryFilter(cat._id)} className={`btn btn-xs rounded-full ${category === cat._id ? 'btn-neutral' : 'btn-outline'}`}>
                    {cat.name}
                  </button>
                ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {products?.map((item) => (
                <div key={item._id} onClick={() => handleAddToCart(item)} className="p-2 cursor-pointer bg-white rounded-lg border shadow-sm hover:shadow-md flex flex-col items-center">
                  <div className="w-full aspect-square overflow-hidden rounded-md bg-gray-50 flex items-center justify-center mb-2 border border-gray-100">
                    {item.imageUrl ? (
                      <img
                        src={`${apiUrl}/upload/${item.imageUrl}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-gray-400 uppercase">No Image</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 truncate w-full text-center font-medium">{item.name}</p>
                  <p className="font-semibold text-red-600">{Number(item.salePrice).toLocaleString()}៛</p>
                </div>
              ))}
            </div>
        </div>
        <div className="col-span-12 lg:col-span-4 bg-white p-4 rounded-lg border">
            <h4 className="font-bold border-b pb-2">Carts</h4>
            <table className="table w-full">
                <tbody>
                    {carts.map((item, idx) => (
                        <tr key={item.product || idx} className="text-sm">
                            <td className="p-2">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.unitPrice.toLocaleString()}៛</div>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleDecrement(item.product)} className="btn btn-xs btn-circle btn-outline">-</button>
                                <span className="w-4 text-center">{item.quantity}</span>
                                <button onClick={() => handleCartIncrement(item.product)} className="btn btn-xs btn-circle btn-outline">+</button>
                              </div>
                            </td>
                            <td className="p-2 text-right font-semibold">{item.totalPrice.toLocaleString()}៛
                            </td>
                            <td className="p-2 text-center">
                              <button onClick={() => handleRemoveItem(item.product)} className="text-red-500 hover:text-red-700">
                                ✕
                              </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="text-xl font-bold mt-4">TOTAL: {totalCost.toLocaleString()}៛</div>
            <button onClick={() => setOpen(true)} disabled={carts.length === 0 || isLoading} className="btn btn-neutral w-full mt-4">PURCHASE</button>
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Payment">
        <form onSubmit={handlePayment}>
          <input type="number" value={paidAmount || ""} onChange={(e) => setPaidAmount(Number(e.target.value) || 0)} className="input input-bordered w-full mb-3" placeholder="Paid Amount (៛)" />
          
          <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-1">
            <div className="flex justify-between text-green-700 font-bold"><span>Change:</span><span>{Math.max(0, Number(paidAmount || 0) - totalCost).toLocaleString()}៛</span></div>
            <div className="flex justify-between text-red-600 font-bold"><span>Due:</span><span>{Math.max(0, totalCost - Number(paidAmount || 0)).toLocaleString()}៛</span></div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input 
              type="checkbox" 
              id="print-receipt" 
              checked={printReceipt} 
              onChange={(e) => setPrintReceipt(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <label htmlFor="print-receipt" className="text-sm cursor-pointer select-none font-medium">Print Receipt</label>
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-neutral w-full">Pay now</button>
        </form>
      </Modal>
    </div>
  );
}
export default POS;
