import { Redirect } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export default function Index() {
  const { user, isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isCheckingAuth) return null; // or a splash/loading view

  return user ? <Redirect href="/home" /> : <Redirect href="/login" />;
}