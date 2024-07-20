import { Route, Routes } from "react-router-dom"
import LandingPage from "./components/kasir/LandingPage"
import PaymentPage from "./components/kasir/PaymentPage"
import DataProduct from "./components/kasir/DataProduct"
import DataCustomers from "./components/kasir/DataCustomers"
import OrderDetail from "./components/kasir/OrderDetail"
import LaporanPenjualan from "./components/kasir/LaporanPenjualan"
import BaristaPage from "./components/barista/BaristaPage"
import Order from "./components/barista/Order"
import SignIn from "./components/SignIn"
import PrivateRoute from "./components/PrivateRoute"


function App() {

  return (
    <>
      <main>
        <Routes>
          { /**public */}
          <Route path="/sign-in" element={<SignIn />} />
          { /**private barista*/}
          <Route path="/barista" element={<PrivateRoute role="barista"><BaristaPage /></PrivateRoute>} />
          <Route path="/barista/order/:id" element={<PrivateRoute role="barista"><Order /></PrivateRoute>} />
          { /**private cashier*/}
          <Route path="/" element={<PrivateRoute role="kasir"><LandingPage /></PrivateRoute>} />
          <Route path="/cashier/payment" element={<PrivateRoute role="kasir"><PaymentPage /></PrivateRoute>} />
          <Route path="/cashier/data-products" element={<PrivateRoute role="kasir"><DataProduct /></PrivateRoute>} />
          <Route path="/cashier/data-customers" element={<PrivateRoute role="kasir"><DataCustomers /></PrivateRoute>} />
          <Route path="/cashier/data-customers/:id" element={<PrivateRoute role="kasir"><OrderDetail /></PrivateRoute>} />
          <Route path="/cashier/data-penjualan" element={<PrivateRoute role="kasir"><LaporanPenjualan /></PrivateRoute>} />
        </Routes>
      </main>

    </>
  )
}

export default App
