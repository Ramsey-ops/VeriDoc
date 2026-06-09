import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import GenerateDocument from "./pages/GenerateDocument.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import VerificationPortal from "./pages/VerificationPortal.jsx";

function ProtectedRoute({ children, adminOnly = false }) {
  const { token, userRole } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && userRole !== "admin") {
    return <Navigate to="/generate" replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/generate"
          element={
            <ProtectedRoute>
              <GenerateDocument />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/verify/:documentId" element={<VerificationPortal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
