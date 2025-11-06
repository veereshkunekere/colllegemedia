import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const AuthWrapper = () => {
  const { authuser, isCheckingAuth, checkAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);  // Rename for clarity (replaces 'checking')

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setIsReady(true);
    };
    verifyAuth();
  }, []);  // Empty deps: Run once on mount (StrictMode-safe)

  // Fix: Show loading if checking OR not ready (blocks redirect until done)
  if (isCheckingAuth || !isReady) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return authuser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AuthWrapper;