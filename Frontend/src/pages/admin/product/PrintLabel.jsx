import { FaTrash } from "react-icons/fa6";
import useFetchOneByCode from "../../../hooks/common/useFetchOneByCode";
import { useState } from "react";
import toast from "react-hot-toast";
function PrintLabel() {
  const [products, setProducts] = useState([]);

  const { fetchData } = useFetchOneByCode();
  const [productCode, setProductCode] = useState("")

  const handleSearchProductByCode = async (e) => {
    e.preventDefault()
    try {
      const data = await fetchData(`/products/code`,  productCode.toLocaleLowerCase());
      const exist = products.find(el => el.id == data._id)
      if(exist){
        toast.error("You can't the same product!");
        return;
      }
      setProducts([...products, {
          id: data?._id,
          productName: data?.name,
          code: data?.code,
          salePrice: data?.salePrice
      }])

    } catch (error) {
      console.log(error.message)
    }
  };

  const handleRemove = (id) => {
    const updateCarts = products.filter(el => el.id != id)
    setProducts(updateCarts)
  }

  const handlePrintLabel = async () => {
      if(products.length <= 0){
         toast.error("Please add product that you want to print label!")
         return;
      }
      const data = JSON.stringify(products)
      localStorage.setItem("productsLabel", data)
      window.open(`/product/print-label-page`, '_blank')
  }

  return (
    <div className="w-full max-w-full p-3 sm:p-4">
      <h1 className="text-xl font-semibold">Print Label</h1>

      <div className="bg-white w-full p-4 rounded-lg my-4">
        <h1 className="text-xl font-medium">Add product</h1>
        <div className="flex items-center justify-center">
          <form onSubmit={handleSearchProductByCode} className="flex w-full max-w-md gap-2">
          <label className="input input-bordered flex min-w-0 flex-1 items-center gap-2">
                    <input
                      type="text"
                      onChange={(e) => setProductCode(e.target.value)}
                      className="min-w-0 grow"
                      required
                      placeholder="Enter product code"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="h-4 w-4 opacity-70"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </label>
            {/* <button type="submit" className="btn btn-neutral w-20">
              Add
            </button> */}
          </form>
        </div>

        <div className="mx-auto mt-3 max-w-full overflow-x-auto sm:max-w-[500px]">
          <table className="min-w-[480px] w-full">
            <thead>
              <tr className="bg-gray-200 text-sm">
                <th className="text-left whitespace-nowrap p-4">Product</th>
                <th className="text-right whitespace-nowrap p-4">Code</th>
                <th className="text-right whitespace-nowrap p-4">Price</th>
                <th className="text-right whitespace-nowrap p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((el) => (
                <tr key={el.id} className="even:bg-gray-100">
         
                  <td className="py-2 !p-4">{el?.productName}</td>
                  <td className="py-2 !p-4 capitalize">{el?.code}</td>

                  <td className="text-right text-red-600">
                    ${Number(el?.salePrice || 0).toFixed(2)}
                  </td>
   
                  <td className="text-center px-4">
                    <p onClick={() => handleRemove(el?.id)} className="text-red-600 w-full flex justify-end text-center space-x-1 mr-3 cursor-pointer">
                      <FaTrash className="w-4 h-4" />
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center">
              <button onClick={handlePrintLabel} className="btn btn-neutral w-full sm:w-20">Save</button>
        </div>
          

      </div>
      
    </div>
  );
}

export default PrintLabel;
