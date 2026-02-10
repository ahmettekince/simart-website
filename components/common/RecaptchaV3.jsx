"use client";
import { useEffect, useRef } from "react";

const RecaptchaV3 = ({ onVerify, action = "submit" }) => {
    const isLoaded = useRef(false);

    useEffect(() => {
        // Sadece client tarafında ve bir kez çalıştır
        if (typeof window === "undefined" || isLoaded.current) return;

        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

        if (!siteKey) {
            console.warn("reCAPTCHA site key bulunamadı.");
            return;
        }

        const loadScript = () => {
            const script = document.createElement("script");
            script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
            script.onload = () => {
                isLoaded.current = true;
            };
        };


        if (!document.querySelector(`script[src*="recaptcha/api.js?render=${siteKey}"]`)) {
            loadScript();
        } else {
            isLoaded.current = true;
        }

    }, []);


    useEffect(() => {
        const executeRecaptcha = async () => {
            const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

            if (!siteKey || !window.grecaptcha) {
                console.warn("reCAPTCHA yüklenemedi veya key eksik.");
                return null;
            }

            return new Promise((resolve) => {
                window.grecaptcha.ready(() => {
                    window.grecaptcha.execute(siteKey, { action }).then((token) => {
                        resolve(token);
                    });
                });
            });
        };

        if (onVerify) {
            onVerify(executeRecaptcha);
        }
    }, [onVerify, action]);

    return null;
};

export default RecaptchaV3;
