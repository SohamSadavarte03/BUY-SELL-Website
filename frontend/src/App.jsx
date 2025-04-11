import { Box, useColorModeValue } from "@chakra-ui/react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Profile from "./pages/profile";
import Navbar from "./components/navbar";
import Items from "./pages/items";
import Orders from "./pages/orders";
import Cart from "./pages/cart";
import History from "./pages/history";
import AddProduct from "./pages/addproduct";
import ProductPage from "./pages/productpage";
import PendingPage from "./pages/pendingpage";
import { AuthProvider } from "./context/authcontext";
import ProtectedRoute from "./components/ProtectedRoute";
import Chatbot from "./components/chatbot";
import CASCallback from './components/CASCallback';

function App() {
  const isAuth = localStorage.getItem('token') ? true : false;
  const isAuth1=localStorage.getItem('token-cas') ? true : false;
  return (
    <AuthProvider>
      <Box overflow="hidden" minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
        {(isAuth) && <Navbar />}
        <Routes>
          <Route path="/" element={isAuth ? <Navigate to="/profile" /> : <Login />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items"
            element={
              <ProtectedRoute>
                <Items />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addproduct"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProtectedRoute>
                <ProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pending"
            element={
              <ProtectedRoute>
                <PendingPage />
              </ProtectedRoute>
            }
          />
          <Route path="/cas-callback" element={<CASCallback />} />
        </Routes>
        {isAuth && <Chatbot />}
      </Box>
    </AuthProvider>
  );
}

export default App;
