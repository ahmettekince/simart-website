import Header from "@/components/headers/Header";
import Register from "@/components/othersPages/Register";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Register || Ecomus - Ultimate Nextjs Ecommerce Template",
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
          <div className="heading text-center">Register</div>
        </div>
      </div>

      <Register />
    </>
  );
}
