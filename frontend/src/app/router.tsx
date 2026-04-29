import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/shared/auth/ProtectedRoute";
import { RouteFallback } from "@/shared/components/RouteFallback";

const LandingPage = lazy(() =>
  import("@/features/public/landing/LandingPage").then((m) => ({ default: m.LandingPage })),
);
const MenuPage = lazy(() =>
  import("@/features/public/menu/MenuPage").then((m) => ({ default: m.MenuPage })),
);
const CheckoutPage = lazy(() =>
  import("@/features/public/checkout/CheckoutPage").then((m) => ({ default: m.CheckoutPage })),
);
const OrderConfirmationPage = lazy(() =>
  import("@/features/public/order/OrderConfirmationPage").then((m) => ({
    default: m.OrderConfirmationPage,
  })),
);
const TrackingPage = lazy(() =>
  import("@/features/public/order/TrackingPage").then((m) => ({ default: m.TrackingPage })),
);

const LoginPage = lazy(() =>
  import("@/features/admin/auth/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const AdminLayout = lazy(() =>
  import("@/features/admin/layout/AdminLayout").then((m) => ({ default: m.AdminLayout })),
);
const DashboardPage = lazy(() =>
  import("@/features/admin/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const SettingsPage = lazy(() =>
  import("@/features/admin/settings/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);
const OpeningHoursPage = lazy(() =>
  import("@/features/admin/settings/OpeningHoursPage").then((m) => ({
    default: m.OpeningHoursPage,
  })),
);
const PageContentPage = lazy(() =>
  import("@/features/admin/settings/PageContentPage").then((m) => ({ default: m.PageContentPage })),
);
const MenuOverviewPage = lazy(() =>
  import("@/features/admin/menu/MenuOverviewPage").then((m) => ({ default: m.MenuOverviewPage })),
);
const OrdersListPage = lazy(() =>
  import("@/features/admin/orders/OrdersListPage").then((m) => ({ default: m.OrdersListPage })),
);
const OrderDetailPage = lazy(() =>
  import("@/features/admin/orders/OrderDetailPage").then((m) => ({ default: m.OrderDetailPage })),
);
const KitchenPage = lazy(() =>
  import("@/features/admin/operations/kitchen/KitchenPage").then((m) => ({ default: m.KitchenPage })),
);
const ProductEditPage = lazy(() =>
  import("@/features/admin/menu/products/ProductEditPage").then((m) => ({
    default: m.ProductEditPage,
  })),
);
const AddonGroupEditPage = lazy(() =>
  import("@/features/admin/menu/addon-groups/AddonGroupEditPage").then((m) => ({
    default: m.AddonGroupEditPage,
  })),
);
const DeliveryZonesPage = lazy(() =>
  import("@/features/admin/delivery-zones/DeliveryZonesPage").then((m) => ({
    default: m.DeliveryZonesPage,
  })),
);

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/confirmation/:orderNumber" element={<OrderConfirmationPage />} />
        <Route path="/track/:token" element={<TrackingPage />} />
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
          <Route path="kitchen" element={<KitchenPage />} />
          <Route path="orders" element={<OrdersListPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="menu" element={<MenuOverviewPage />} />
          <Route path="menu/products/new" element={<ProductEditPage />} />
          <Route path="menu/products/:id" element={<ProductEditPage />} />
          <Route path="menu/addon-groups/:id" element={<AddonGroupEditPage />} />
          <Route path="delivery-zones" element={<DeliveryZonesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="opening-hours" element={<OpeningHoursPage />} />
          <Route path="page-content" element={<PageContentPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
