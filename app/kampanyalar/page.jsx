import React from "react";
import Header from "@/components/headers/Header";
import CampaignsPage from "@/components/othersPages/CampaignsPage";
import { getCampaigns } from "@/api/campaigns";

export const metadata = {
  title: "Kampanyalar - Şımart Teknoloji",
  description:
    "Şımart Teknoloji kampanyaları. Robot süpürge ve akıllı ev sistemlerinde fırsatları kaçırmayın.",
};

export default async function page() {
  const response = await getCampaigns();
  const campaigns = Array.isArray(response) ? response : [];

  return (
    <>
      <Header />
      <CampaignsPage campaigns={campaigns} />
    </>
  );
}
