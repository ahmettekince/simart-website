"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "@/utils/apiClient";

export default function ResetPassword({ token }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        password: "",
        passwordConfirmation: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setMessage("");
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");
        setError("");

        if (formData.password !== formData.passwordConfirmation) {
            setError("Şifreler birbiriyle eşleşmiyor.");
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await apiClient.post("/customer/reset-password", {
                token: token,
                password: formData.password,
                password_confirmation: formData.passwordConfirmation
            });

            if (response.data?.status === "success") {
                setMessage("Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz...");
                setTimeout(() => {
                    router.push("/giris-yap");
                }, 2000);
            } else {
                setError(response.data?.message || "Şifre sıfırlama işlemi başarısız oldu.");
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="flat-spacing-11">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <div className="form-register-wrap">
                            <div className="flat-title align-items-start gap-0 px-0">
                                <h5 className="mb_18">Yeni Şifre Belirle</h5>
                                <p className="text_black-2">
                                    Lütfen hesabınız için yeni bir şifre belirleyin.
                                </p>
                            </div>
                            <div>
                                <form onSubmit={handleSubmit} id="reset-password-form">
                                    {/* Başarı Mesajı */}
                                    {message && (
                                        <div
                                            className="mb_20"
                                            style={{
                                                padding: "12px 16px",
                                                backgroundColor: "#d4edda",
                                                border: "1px solid #c3e6cb",
                                                borderRadius: "4px",
                                                color: "#155724",
                                            }}
                                        >
                                            {message}
                                        </div>
                                    )}

                                    {/* Hata Mesajı */}
                                    {error && (
                                        <div
                                            className="mb_20"
                                            style={{
                                                padding: "12px 16px",
                                                backgroundColor: "#f8d7da",
                                                border: "1px solid #f5c6cb",
                                                borderRadius: "4px",
                                                color: "#721c24",
                                            }}
                                        >
                                            {error}
                                        </div>
                                    )}

                                    <div className="tf-field style-1 mb_15">
                                        <input
                                            className="tf-field-input tf-input"
                                            placeholder=" "
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <label
                                            className="tf-field-label fw-6 text_black-2"
                                            htmlFor="password"
                                        >
                                            Yeni Şifre *
                                        </label>
                                    </div>

                                    <div className="tf-field style-1 mb_15">
                                        <input
                                            className="tf-field-input tf-input"
                                            placeholder=" "
                                            type="password"
                                            id="passwordConfirmation"
                                            name="passwordConfirmation"
                                            value={formData.passwordConfirmation}
                                            onChange={handleChange}
                                            required
                                        />
                                        <label
                                            className="tf-field-label fw-6 text_black-2"
                                            htmlFor="passwordConfirmation"
                                        >
                                            Yeni Şifre Tekrar *
                                        </label>
                                    </div>

                                    <div className="mb_20">
                                        <button
                                            type="submit"
                                            className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "İşleniyor..." : "Şifreyi Güncelle"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
