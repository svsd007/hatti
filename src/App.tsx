import "./App.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Cart from "./Pages/Cart";
import CartProvider from "./cart/CartProvider";
import CatalogProvider from "./catalog/CatalogProvider";

import Home from "./Pages/Home";
import FreshProduce from "./Pages/FreshProduce";
import Farmers from "./Pages/Farmers";
import Deals from "./Pages/Deals";
import PreviousOrder from "./Pages/PreviousOrder";


import {BrowserRouter, Routes, Route} from "react-router-dom"
import FarmersMarkets from "./Pages/FarmersMarkets";
import Profile from "./Pages/Profile";
import AuthProvider from "./auth/AuthProvider";
import RequireAuth from "./auth/RequireAuth";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import AuthCallback from "./Pages/AuthCallback";
import ProductPage from "./Pages/ProductPage";
import FarmerPage from "./Pages/FarmerPage";
import BusinessPage from "./Pages/BusinessPage";
import BusinessLogin from "./Pages/BusinessLogin";
import AuthForm from "./components/AuthForm";
import CheckoutResult from "./Pages/CheckoutResult";


function App() {
  return (
    <AuthProvider>
    <CatalogProvider>
    <CartProvider>
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />

        <div className="app-layout">
          <Sidebar />

          <main className="hatti-main" id="main-content" tabIndex={-1}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/fresh-produce" element={<FreshProduce />} />
              <Route path="/products/:id" element={<ProductPage />} />
              <Route path="/farmers/:id" element={<FarmerPage />} />
              <Route path="/business" element={<BusinessPage />} />
              <Route path="/business/login" element={<BusinessLogin />} />
              <Route path="/business/signup" element={<AuthForm mode="signup" business />} />
              <Route path="/farmers" element={<Farmers />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/previous-orders" element={<RequireAuth><PreviousOrder /></RequireAuth>} />
              <Route path="/farmers-markets" element={<FarmersMarkets />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout/success" element={<RequireAuth><CheckoutResult /></RequireAuth>} />
              <Route path="/checkout/cancel" element={<CheckoutResult cancelled />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
    </CartProvider>
    </CatalogProvider>
    </AuthProvider>
  );
}

export default App;
