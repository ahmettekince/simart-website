
import ResetPassword from "@/components/othersPages/ResetPassword";
import React from "react";
import { checkAuthServer } from "@/utils/authServer";
import { redirect } from "next/navigation";

const description = "Şımart Teknoloji Şifre Sıfırlama sayfası. Hesabınız için yeni bir şifre belirleyin ve güvenli giriş yapın.";

export const metadata = {
    title: "Şifre Sıfırla - Şımart Teknoloji",
    description,
    robots: {
        index: false,
        follow: false,
    },
};

export default async function page({ params }) {
    const { token } = params;
    const isAuthenticated = await checkAuthServer();

    if (isAuthenticated) {
        redirect("/hesabim");
    }

    return (
        <>
            <div className="tf-page-title style-2">
                <div className="container-full">
                    <div className="heading text-center">Şifre Sıfırlama</div>
                </div>
            </div>
            <ResetPassword token={token} />
        </>
    );
}
