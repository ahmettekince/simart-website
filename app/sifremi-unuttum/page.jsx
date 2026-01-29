import Header from "@/components/headers/Header";
import ForgotPassword from "@/components/othersPages/ForgotPassword";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Şifremi Unuttum || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};

export default async function page() {
  const isAuthenticated = await checkAuthServer();

  if (isAuthenticated) {
    redirect("/hesabim");
  }

  return (
    <>
      <Header />
      <ForgotPassword />
    </>
  );
}
