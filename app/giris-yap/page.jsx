import Header from "@/components/headers/Header";
import Login from "@/components/othersPages/Login";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Login || Ecomus - Ultimate Nextjs Ecommerce Template",
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
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Şımart Teknoloji Dünyasına Giriş Yap</div>
        </div>
      </div>

      <Login />

    </>
  );
}
