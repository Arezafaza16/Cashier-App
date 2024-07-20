import { Route, Routes } from "react-router-dom"
import LandingPage from "./components/kasir/LandingPage"
import PaymentPage from "./components/kasir/PaymentPage"
import DataProduct from "./components/kasir/DataProduct"
import DataCustomers from "./components/kasir/DataCustomers"
import OrderDetail from "./components/kasir/OrderDetail"
import LaporanPenjualan from "./components/kasir/LaporanPenjualan"
import BaristaPage from "./components/barista/BaristaPage"
import Order from "./components/barista/Order"


function App() {

  return (
    <>
      <main>
        <Routes>
          <Route path="/barista" element={<BaristaPage />} />
          <Route path="/barista/order/:id" element={<Order />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/cashier/payment" element={<PaymentPage />} />
          <Route path="/cashier/data-products" element={<DataProduct />} />
          <Route path="/cashier/data-customers" element={<DataCustomers />} />
          <Route path="/cashier/data-customers/:id" element={<OrderDetail />} />
          <Route path="/cashier/data-penjualan" element={<LaporanPenjualan />} />
        </Routes>
      </main>

    </>
  )
}

export default App
