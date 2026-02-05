"use client";

import React, { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import GiftSelectionModal from "./GiftSelectionModal";

/**
 * Merkezi hediye seçim modali.
 * Cart store'da pendingGiftAdd set edildiğinde (hediye kampanyalı ürün sepete eklenirken)
 * tek bir modal açılır; nereden sepete ekle tetiklenirse tetiklensin aynı modal kullanılır.
 */
export default function GlobalGiftSelectionModal() {
  const pendingGiftAdd = useCartStore((s) => s.pendingGiftAdd);
  const addItem = useCartStore((s) => s.addItem);
  const clearPendingGiftAdd = useCartStore((s) => s.clearPendingGiftAdd);

  const [selectedGift, setSelectedGift] = useState(null);

  const open = Boolean(pendingGiftAdd);
  const campaigns =
    pendingGiftAdd?.product?.selectable_gift_campaigns ||
    pendingGiftAdd?.product?.selectableGiftCampaigns ||
    [];

  const handleClose = () => {
    setSelectedGift(null);
    clearPendingGiftAdd();
  };

  const handleConfirm = async () => {
    if (!pendingGiftAdd || !selectedGift) return;

    const { product, quantity, openModal } = pendingGiftAdd;
    setSelectedGift(null);
    clearPendingGiftAdd();

    await addItem(product, quantity, openModal, {
      selectedGiftProductId: selectedGift.id,
      campaignId: selectedGift._campaignId,
    });
  };

  return (
    <GiftSelectionModal
      open={open}
      onClose={handleClose}
      campaigns={campaigns}
      selectedGiftId={selectedGift?.id ?? null}
      onChangeSelected={(gift) => setSelectedGift(gift)}
      onConfirm={handleConfirm}
    />
  );
}
