import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from "@mui/material/useMediaQuery";

// Import our custom ThemeProvider
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// Import the CartProvider
import { CartProvider } from "./context/CartContext";

// Layout components
import MainLayout from "./components/layouts/MainLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import RestaurantLayout from "./components/layouts/RestaurantLayout";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import CreateUser from "./pages/admin/CreateUser";
import EditUser from "./pages/admin/EditUser";
import Settings from "./pages/admin/Settings";
import Reports from "./pages/admin/Reports";

// Protected route component
import ProtectedRoute from "./components/ProtectedRoute";

// Customer pages
import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerCheckout from "./pages/customer/Checkout";
import CustomerSettings from "./pages/customer/Settings";
import OrderHistory from "./pages/customer/OrderHistory";
import MenuDashboard from "./pages/customer/Menu";
// Restaurant admin pages
import RestaurantDashboard from "./pages/restaurant/Dashboard";
import FoodItems from "./pages/restaurant/FoodItems";
import CreateFoodItem from "./pages/restaurant/CreateFoodItem";
import EditFoodItem from "./pages/restaurant/EditFoodItem";
import RestaurantSettings from "./pages/restaurant/Settings";
import RestaurantOrders from "./pages/restaurant/Orders";
import RestaurantReports from "./pages/restaurant/Reports";

// Delivery personnel pages
import DeliveryDashboard from "./pages/delivery/Dashboard";

// Custom theme builder function that accepts mode (light/dark)
const createAppTheme = (mode) => createTheme({ palette: { mode } });

// Customer Routes component wrapped with CartProvider
const CustomerRoutes = () => (
  <CartProvider>
    <Routes>
      <Route path="dashboard" element={<CustomerDashboard />} />
      <Route path="checkout" element={<CustomerCheckout />} />
      <Route path="order-history" element={<OrderHistory />} />
      <Route path="settings" element={<CustomerSettings />} />
      <Route path="menu" element={<MenuDashboard />} />
      <Route index element={<Navigate to="dashboard" />} />
    </Routes>
  </CartProvider>
);

// Theme-aware App component
const ThemedApp = () => {
  // Get the theme mode from ThemeContext
  const { mode } = useTheme();

  // Create the appropriate theme based on mode
  const theme = createAppTheme(mode);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* Main layout with protected routes */}
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/login" />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                {console.log("Rendering AdminLayout component")}
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="users/create" element={<CreateUser />} />
            <Route path="users/:id/edit" element={<EditUser />} />
            <Route path="settings" element={<Settings />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Customer routes - wrapped with CartProvider */}
          <Route
            path="/customer/*"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerRoutes />
              </ProtectedRoute>
            }
          />

          {/* Restaurant admin routes */}
          <Route
            path="/restaurant"
            element={
              <ProtectedRoute allowedRoles={["restaurant-admin"]}>
                <RestaurantLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RestaurantDashboard />} />
            <Route path="food-items" element={<FoodItems />} />
            <Route path="food-items/create" element={<CreateFoodItem />} />
            <Route path="food-items/edit/:id" element={<EditFoodItem />} />
            <Route path="orders" element={<RestaurantOrders />} />
            <Route path="reports" element={<RestaurantReports />} />
            <Route path="settings" element={<RestaurantSettings />} />
          </Route>

          {/* Delivery personnel routes */}
          <Route
            path="/delivery"
            element={
              <ProtectedRoute allowedRoles={["delivery-personnel"]}>
                <DeliveryDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </MuiThemeProvider>
  );
};

// Root App component wrapped in ThemeProvider
const App = () => (
  <ThemeProvider>
    <ThemedApp />
  </ThemeProvider>
);

export default App;
