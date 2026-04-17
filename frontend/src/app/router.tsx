import { Routes, Route, Navigate } from "react-router-dom";
import { PlaceholderLanding } from "@/features/public/PlaceholderLanding";
import { PlaceholderMenu } from "@/features/public/PlaceholderMenu";
import { PlaceholderAdminLogin } from "@/features/admin/PlaceholderAdminLogin";
import { PlaceholderAdminDashboard } from "@/features/admin/PlaceholderAdminDashboard";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<PlaceholderLanding />} />
      <Route path="/menu" element={<PlaceholderMenu />} />
      <Route path="/checkout" element={<div>Checkout - Faza 3</div>} />
      <Route path="/order/confirmation/:orderNumber" element={<div>Confirmation - Faza 3</div>} />
      <Route path="/track/:token" element={<div>Tracking - Faza 3</div>} />
      <Route path="/admin/login" element={<PlaceholderAdminLogin />} />
      <Route path="/admin/*" element={<PlaceholderAdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
