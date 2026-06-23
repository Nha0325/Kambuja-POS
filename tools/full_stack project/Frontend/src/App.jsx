import AdminLayout from "./layouts/AdminLayout"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"

import Home from "./pages/Home"
import Customer from "./pages/customer/Customer"
import Supplier from "./pages/supplier/Supplier"
import Category from "./pages/category/Category"
import Product from "./pages/product/Product"
import Purchase from "./pages/purchase/Purchase"
import User from "./pages/user/User.jsx"
import ListSale from "./pages/sale/ListSale"
import POS from "./pages/sale/POS"
import Signin from "./pages/auth/Signin"
import Protected from "./components/Protected"
import CashierLayout from "./layouts/CashierLayout"
import NotFound from "./pages/NotFound"
import Unauthorized from "./pages/Unauthorized"
import AuthRedirect from "./components/AuthRedirect"
import CreateCustomer from "./pages/customer/CreateCustomer"
import EditCustomer from "./pages/customer/EditCustomer"
import CreateSupplier from "./pages/supplier/CreateSupplier"
import EditSupplier from "./pages/supplier/EditSupplier"
import CreateCategory from "./pages/category/CreateCategory"
import EditCategory from "./pages/category/EditCategory"
import CreateProduct from "./pages/product/CreateProduct"
import EditProduct from "./pages/product/EditProduct"
import Invoice from "./pages/sale/Invoice"
import CreatePurchase from "./pages/purchase/CreatePurchase"
import CreateUser from "./pages/user/CreateUser"
import EditUser from "./pages/user/EditUser"
import SaleReport from "./pages/report/SaleReport"
import StockReport from "./pages/report/StockReport"
import PrintLabel from "./pages/product/PrintLabel"
import PrintLabelPage from "./pages/product/PrintLabelPage"
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Protected allowedRoles={["super", "admin"]}>
                <AdminLayout />
              </Protected>
            }
          >
            <Route index element={<Home />} />

            <Route path="/customer" element={<Customer />} />
            <Route path="/customer/create" element={<CreateCustomer />} />
            <Route path="/customer/edit/:id" element={<EditCustomer />} />

            <Route path="/supplier" element={<Supplier />} />
            <Route path="/supplier/create" element={<CreateSupplier />} />
            <Route path="/supplier/edit/:id" element={<EditSupplier />} />

            <Route path="/category" element={<Category />} />
            <Route path="/category/create" element={<CreateCategory />} />
            <Route path="/category/edit/:id" element={<EditCategory />} />

            <Route path="/product" element={<Product />} />
            <Route path="/product/create" element={<CreateProduct />} />
            <Route path="/product/edit/:id" element={<EditProduct />} />
            <Route path="/product/print-label" element={<PrintLabel />} />

            <Route path="/purchase" element={<Purchase />} />

            <Route path="/user" element={<User />} />
            <Route path="/user/create" element={<CreateUser />} />
            <Route path="/user/edit/:id" element={<EditUser />} />

            <Route path="/sale/list" element={<ListSale />} />

            <Route path="/sale/pos" element={<POS />} />
            <Route path="/purchase/create" element={<CreatePurchase />}></Route>

            <Route path="/report/sale" element={<SaleReport />}></Route>
            <Route path="/report/stock" element={<StockReport />}></Route>

          </Route>

          <Route path="/sale/invoice/:id" element={<Invoice />}></Route>
          <Route path="/product/print-label-page" element={<PrintLabelPage />} />



          {/* Cashier Layout */}
          <Route
            path="/cashier/pos"
            element={
              <Protected allowedRoles={["cashier"]}>
                <CashierLayout />
              </Protected>
            }
          >
            <Route index element={<POS />} />
          </Route>
          

          <Route path="/signin" element={ <AuthRedirect> <Signin /> </AuthRedirect> } />
          <Route path="/unauthorized" element={<Unauthorized /> } />
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </BrowserRouter>

      <Toaster />
    </>
  );
}

export default App;
