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
const SettingsLayout = lazy(() =>
  import("@/features/admin/settings/SettingsLayout").then((m) => ({
    default: m.SettingsLayout,
  })),
);
const GeneralSection = lazy(() =>
  import("@/features/admin/settings/sections/GeneralSection").then((m) => ({
    default: m.GeneralSection,
  })),
);
const HoursSection = lazy(() =>
  import("@/features/admin/settings/sections/HoursSection").then((m) => ({
    default: m.HoursSection,
  })),
);
const ContentSection = lazy(() =>
  import("@/features/admin/settings/sections/ContentSection").then((m) => ({
    default: m.ContentSection,
  })),
);
const ZonesSection = lazy(() =>
  import("@/features/admin/settings/sections/ZonesSection").then((m) => ({
    default: m.ZonesSection,
  })),
);
const OperationsSection = lazy(() =>
  import("@/features/admin/settings/sections/OperationsSection").then((m) => ({
    default: m.OperationsSection,
  })),
);
const NotificationsSection = lazy(() =>
  import("@/features/admin/settings/sections/NotificationsSection").then((m) => ({
    default: m.NotificationsSection,
  })),
);
const CapacitySection = lazy(() =>
  import("@/features/admin/settings/sections/CapacitySection").then((m) => ({
    default: m.CapacitySection,
  })),
);
const LegalSection = lazy(() =>
  import("@/features/admin/settings/sections/LegalSection").then((m) => ({
    default: m.LegalSection,
  })),
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
const PickupPage = lazy(() =>
  import("@/features/admin/operations/pickup/PickupPage").then((m) => ({ default: m.PickupPage })),
);
const DeliveryPage = lazy(() =>
  import("@/features/admin/operations/delivery/DeliveryPage").then((m) => ({ default: m.DeliveryPage })),
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
          <Route path="pickup" element={<PickupPage />} />
          <Route path="delivery" element={<DeliveryPage />} />
          <Route path="orders" element={<OrdersListPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="menu" element={<MenuOverviewPage />} />
          <Route path="menu/products/new" element={<ProductEditPage />} />
          <Route path="menu/products/:id" element={<ProductEditPage />} />
          <Route path="menu/addon-groups/:id" element={<AddonGroupEditPage />} />
          <Route path="settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="general" replace />} />
            <Route path="general" element={<GeneralSection />} />
            <Route path="hours" element={<HoursSection />} />
            <Route path="content" element={<ContentSection />} />
            <Route path="zones" element={<ZonesSection />} />
            <Route path="operations" element={<OperationsSection />} />
            <Route path="notifications" element={<NotificationsSection />} />
            <Route path="capacity" element={<CapacitySection />} />
            <Route path="legal" element={<LegalSection />} />
          </Route>
          <Route
            path="opening-hours"
            element={<Navigate to="/admin/settings/hours" replace />}
          />
          <Route
            path="page-content"
            element={<Navigate to="/admin/settings/content" replace />}
          />
          <Route
            path="delivery-zones"
            element={<Navigate to="/admin/settings/zones" replace />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
