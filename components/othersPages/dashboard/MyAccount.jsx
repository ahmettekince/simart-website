"use client";
import React from "react";
import Link from "next/link";
import { useLangStore } from "@/stores/langStore";
import { useCustomerStore } from "@/stores/customerStore";
import { getLocalizedUrl } from "@/utils/i18n";

export default function MyAccount() {
  const lang = useLangStore((s) => s.lang);
  const customer = useCustomerStore((s) => s.customer);

  const t = {
    tr: {
      hello: "Merhaba",
      descPrefix: "Hesap panelinizden ",
      orders: "son siparişlerinizi",
      descAnd: " görüntüleyebilir, ",
      addresses: "teslimat ve fatura adreslerinizi",
      descManage: " yönetebilir ve ",
      accountDetails: "şifre ve hesap detaylarınızı",
      descSuffix: " düzenleyebilirsiniz."
    },
    en: {
      hello: "Hello",
      descPrefix: "From your account dashboard you can view your ",
      orders: "recent orders",
      descAnd: ", manage your ",
      addresses: "shipping and billing addresses",
      descManage: ", and ",
      accountDetails: "edit your password and account details",
      descSuffix: "."
    }
  }[lang] || {};

  return (
    <div className="my-account-content account-dashboard">
      <div className="mb_60">
        <h5 className="fw-5 mb_20">{t.hello} {customer?.first_name || ""}</h5>
        <p>
          {t.descPrefix}
          <Link className="text_primary" href={getLocalizedUrl("/siparislerim", lang)}>
            {t.orders}
          </Link>
          {t.descAnd}
          <Link className="text_primary" href={getLocalizedUrl("/adreslerim", lang)}>
            {t.addresses}
          </Link>
          {t.descManage}
          <Link className="text_primary" href={getLocalizedUrl("/hesabim", lang)}>
            {t.accountDetails}
          </Link>
          {t.descSuffix}
        </p>
      </div>
    </div>
  );
}
