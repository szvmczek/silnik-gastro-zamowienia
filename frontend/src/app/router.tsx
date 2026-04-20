import { Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "@/features/public/landing/LandingPage";
import { MenuPage } from "@/features/public/menu/MenuPage";
import { LoginPage } from "@/features/admin/auth/LoginPage";
import { AdminLayout } from "@/features/admin/layout/AdminLayout";
import { DashboardPage } from "@/features/admin/dashboard/DashboardPage";
import { SettingsPage } from "@/features/admin/settings/SettingsPage";
import { OpeningHoursPage } from "@/features/admin/settings/OpeningHoursPage";
import { PageContentPage } from "@/features/admin/settings/PageContentPage";
import { MenuOverviewPage } from "@/features/admin/menu/MenuOverviewPage";
import { ProductEditPage } from "@/features/admin/menu/products/ProductEditPage";
import { ProtectedRoute } from "@/shared/auth/ProtectedRoute";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/checkout" element={<div>Checkout - Faza 3</div>} />
      <Route path="/order/confirmation/:orderNumber" element={<div>Confirmation - Faza 3</div>} />
      <Route path="/track/:token" element={<div>Tracking - Faza 3</div>} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="menu" element={<MenuOverviewPage />} />
        <Route path="menu/products/new" element={<ProductEditPage />} />
        <Route path="menu/products/:id" element={<ProductEditPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="opening-hours" element={<OpeningHoursPage />} />
        <Route path="page-content" element={<PageContentPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
