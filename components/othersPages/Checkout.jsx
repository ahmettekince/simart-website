"use client";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { log } from "@/utils/logger";
import apiClient from "@/utils/apiClient";
import SearchableSelect from "@/components/common/SearchableSelect";
import AddAddressButton from "@/components/common/AddAddressButton";
import PaymentOptions from "@/components/othersPages/checkout/PaymentOptions";
import OrderSummary from "@/components/othersPages/checkout/OrderSummary";
import CircularLoading from "@/components/common/CircularLoading";

const ORDER_NOTE_KEY = "cart_order_note";

export default function Checkout() {
  const { items } = useCartStore();

  // API'den gelen totals.total kullan, yoksa local hesapla (fallback)
  const totals = useCartStore((state) => state.totals);

  const cartTotals = useMemo(() => {
    if (totals && totals.total !== null && totals.total !== undefined) {
      return {
        subtotal: totals.subtotal || 0,
        discount: totals.discountAmount || 0,
        total: totals.total || 0,
      };
    }
    // Fallback: local hesaplama
    const subtotal = items.reduce((total, item) => {
      const itemPrice = item.price || 0;
      return total + itemPrice * item.quantity;
    }, 0);

    const discountedTotal = items.reduce((total, item) => {
      const itemPrice = item.discount_price || item.price || 0;
      return total + itemPrice * item.quantity;
    }, 0);

    const discount = subtotal - discountedTotal;

    return {
      subtotal: subtotal,
      discount: discount > 0 ? discount : 0,
      total: discountedTotal,
    };
  }, [totals, items]);

  const [orderNote, setOrderNote] = useState("");
  const [sameBillingAddress, setSameBillingAddress] = useState(false); // Teslimat ve fatura adresi aynı mı?
  const [invoiceType, setInvoiceType] = useState("individual"); // "individual" veya "corporate"
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [savedDeliveryAddresses, setSavedDeliveryAddresses] = useState([]); // Kayıtlı teslimat adresleri
  const [savedBillingAddresses, setSavedBillingAddresses] = useState([]); // Kayıtlı fatura adresleri
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true); // Adresler yükleniyor mu?
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState(null); // Seçilen teslimat adres ID'si
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState(null); // Seçilen fatura adres ID'si
  const [showDeliveryAddressForm, setShowDeliveryAddressForm] = useState(false); // Teslimat adresi formu gösterilsin mi?
  const [showBillingAddressForm, setShowBillingAddressForm] = useState(false); // Fatura adresi formu gösterilsin mi?

  // Şehir ve ilçe state'leri
  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [districts, setDistricts] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState("");

  // Fatura adresi için state'ler
  const [selectedBillingCityId, setSelectedBillingCityId] = useState("");
  const [billingDistricts, setBillingDistricts] = useState([]);
  const [selectedBillingDistrictId, setSelectedBillingDistrictId] = useState("");
  const [billingNeighborhoods, setBillingNeighborhoods] = useState([]);
  const [selectedBillingNeighborhoodId, setSelectedBillingNeighborhoodId] = useState("");
  const [taxOffices, setTaxOffices] = useState([]);
  const [selectedTaxOfficeId, setSelectedTaxOfficeId] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);


  // Şehirleri yükle
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await apiClient.get("/cities");
        if (response.data && response.data.status === "success" && response.data.data) {
          setCities(response.data.data);
        }
      } catch (error) {
        log("Şehirler yüklenirken hata:", error);
      }
    };
    fetchCities();
  }, []);

  // İlçeleri yükle (teslimat)
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedCityId) {
        setDistricts([]);
        setSelectedDistrictId("");
        setNeighborhoods([]);
        setSelectedNeighborhoodId("");
        return;
      }
      try {
        const response = await apiClient.get(`/districts?city_id=${selectedCityId}`);
        if (response.data && response.data.status === "success" && response.data.data) {
          setDistricts(response.data.data);
        }
      } catch (error) {
        log("İlçeler yüklenirken hata:", error);
        setDistricts([]);
      }
    };
    fetchDistricts();
  }, [selectedCityId]);

  // Mahalleleri yükle (teslimat)
  useEffect(() => {
    const fetchNeighborhoods = async () => {
      if (!selectedDistrictId) {
        setNeighborhoods([]);
        setSelectedNeighborhoodId("");
        return;
      }
      try {
        const response = await apiClient.get(`/neighborhoods?district_id=${selectedDistrictId}`);
        if (response.data && response.data.status === "success" && response.data.data) {
          setNeighborhoods(response.data.data);
        }
      } catch (error) {
        log("Mahalleler yüklenirken hata:", error);
        setNeighborhoods([]);
      }
    };
    fetchNeighborhoods();
  }, [selectedDistrictId]);

  // Fatura adresi için ilçeleri yükle
  useEffect(() => {
    const fetchBillingDistricts = async () => {
      if (!selectedBillingCityId) {
        setBillingDistricts([]);
        setSelectedBillingDistrictId("");
        setBillingNeighborhoods([]);
        setSelectedBillingNeighborhoodId("");
        return;
      }
      try {
        const response = await apiClient.get(`/districts?city_id=${selectedBillingCityId}`);
        if (response.data && response.data.status === "success" && response.data.data) {
          setBillingDistricts(response.data.data);
        }
      } catch (error) {
        log("Fatura ilçeleri yüklenirken hata:", error);
        setBillingDistricts([]);
      }
    };
    fetchBillingDistricts();
  }, [selectedBillingCityId]);

  // Fatura adresi için mahalleleri yükle
  useEffect(() => {
    const fetchBillingNeighborhoods = async () => {
      if (!selectedBillingDistrictId) {
        setBillingNeighborhoods([]);
        setSelectedBillingNeighborhoodId("");
        return;
      }
      try {
        const response = await apiClient.get(`/neighborhoods?district_id=${selectedBillingDistrictId}`);
        if (response.data && response.data.status === "success" && response.data.data) {
          setBillingNeighborhoods(response.data.data);
        }
      } catch (error) {
        log("Fatura mahalleleri yüklenirken hata:", error);
        setBillingNeighborhoods([]);
      }
    };
    fetchBillingNeighborhoods();
  }, [selectedBillingDistrictId]);

  // Vergi dairelerini yükle
  useEffect(() => {
    const fetchTaxOffices = async () => {
      try {
        const response = await apiClient.get("/tax-offices");
        if (response.data && response.data.status === "success" && response.data.data) {
          setTaxOffices(response.data.data);
        }
      } catch (error) {
        log("Vergi daireleri yüklenirken hata:", error);
        setTaxOffices([]);
      }
    };
    fetchTaxOffices();
  }, []);

  // Giriş yapmış kullanıcılar için kayıtlı adresleri yükle
  useEffect(() => {
    const fetchSavedAddresses = async () => {
      if (!isAuthenticated) {
        setSavedDeliveryAddresses([]);
        setSavedBillingAddresses([]);
        setIsLoadingAddresses(false);
        return;
      }
      setIsLoadingAddresses(true);
      try {
        const response = await apiClient.get("/customer-addresses");
        if (response.data && response.data.status === "success" && response.data.data) {
          // Teslimat adreslerini filtrele
          const deliveryAddresses = response.data.data.filter(
            (addr) => addr.address_type === "delivery"
          );
          // Fatura adreslerini filtrele
          const billingAddresses = response.data.data.filter(
            (addr) => addr.address_type === "invoice"
          );
          setSavedDeliveryAddresses(deliveryAddresses);
          setSavedBillingAddresses(billingAddresses);
        }
      } catch (error) {
        log("Kayıtlı adresler yüklenirken hata:", error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    fetchSavedAddresses();
  }, [isAuthenticated]);

  // Teslimat adresi seçildiğinde invoice_type kontrolü yap
  useEffect(() => {
    if (selectedDeliveryAddressId !== null) {
      const selectedAddress = savedDeliveryAddresses.find(
        (addr) => addr.id === selectedDeliveryAddressId
      );
      if (selectedAddress) {
        // Eğer invoice_type null değilse, fatura adresi ile aynı checkbox'ı otomatik işaretle
        if (selectedAddress.invoice_type !== null && selectedAddress.invoice_type !== undefined) {
          setSameBillingAddress(true);
          setInvoiceType(selectedAddress.invoice_type);
        } else {
          // invoice_type null ise checkbox'ı false yap, kullanıcı işaretlerse fatura türü formu gösterilecek
          setSameBillingAddress(false);
          setInvoiceType("individual"); // Varsayılan olarak bireysel
        }
        setShowDeliveryAddressForm(false);
      }
    }
  }, [selectedDeliveryAddressId, savedDeliveryAddresses]);

  // Fatura adresi seçildiğinde
  useEffect(() => {
    if (!sameBillingAddress && selectedBillingAddressId !== null) {
      const selectedAddress = savedBillingAddresses.find(
        (addr) => addr.id === selectedBillingAddressId
      );
      if (selectedAddress) {
        setInvoiceType(selectedAddress.invoice_type || "individual");
        setShowBillingAddressForm(false);
      }
    }
  }, [sameBillingAddress, selectedBillingAddressId, savedBillingAddresses]);

  // Sayfa yüklendiğinde localStorage'dan sipariş notunu oku
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNote = localStorage.getItem(ORDER_NOTE_KEY);
      if (savedNote) {
        setOrderNote(savedNote);
      }
    }
  }, []);

  // Sipariş notu değiştiğinde localStorage'a kaydet
  const handleOrderNoteChange = (value) => {
    setOrderNote(value);
    if (typeof window !== "undefined") {
      if (value && value.trim()) {
        localStorage.setItem(ORDER_NOTE_KEY, value);
      } else {
        localStorage.removeItem(ORDER_NOTE_KEY);
      }
    }
  };


  // Adresleri yeniden yükle
  const refetchAddresses = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await apiClient.get("/customer-addresses");
      if (response.data && response.data.status === "success" && response.data.data) {
        const deliveryAddresses = response.data.data.filter(
          (addr) => addr.address_type === "delivery"
        );
        const billingAddresses = response.data.data.filter(
          (addr) => addr.address_type === "invoice"
        );
        setSavedDeliveryAddresses(deliveryAddresses);
        setSavedBillingAddresses(billingAddresses);
      }
    } catch (error) {
      log("Adresler yeniden yüklenirken hata:", error);
    }
  };

  // Teslimat adresi kaydetme fonksiyonu
  const handleSaveDeliveryAddress = async (e) => {
    e.preventDefault();
    setIsSavingAddress(true);

    const formData = new FormData(e.target);
    const addressData = {
      address_type: "delivery",
      title: formData.get("address_title"),
      first_name: formData.get("delivery[first_name]"),
      last_name: formData.get("delivery[last_name]"),
      phone: formData.get("delivery[phone]"),
      email: formData.get("delivery[email]"),
      city_id: selectedCityId,
      district_id: selectedDistrictId,
      neighborhood_id: selectedNeighborhoodId,
      address_detail: formData.get("delivery[address_detail]"),
    };

    try {
      const response = await apiClient.post("/customer-addresses", null, {
        params: addressData,
      });

      if (response.data && response.data.status === "success") {
        // Adresleri yeniden yükle
        await refetchAddresses();
        // Formu kapat ve seçili adresi ayarla
        setShowDeliveryAddressForm(false);
        if (response.data.data && response.data.data.id) {
          setSelectedDeliveryAddressId(response.data.data.id);
        }
        // Formu temizle
        e.target.reset();
        setSelectedCityId("");
        setSelectedDistrictId("");
        setSelectedNeighborhoodId("");
      }
    } catch (error) {
      log("Teslimat adresi kaydedilirken hata:", error);
      alert("Adres kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Fatura adresi kaydetme fonksiyonu
  const handleSaveBillingAddress = async (e) => {
    e.preventDefault();
    setIsSavingAddress(true);

    const formData = new FormData(e.target);
    const addressData = {
      address_type: "invoice",
      title: formData.get("billing[address_title]") || "Fatura Adresi",
      first_name: formData.get("billing[first_name]"),
      last_name: formData.get("billing[last_name]"),
      phone: formData.get("billing[phone]"),
      email: formData.get("billing[email]"),
      city_id: selectedBillingCityId,
      district_id: selectedBillingDistrictId,
      neighborhood_id: selectedBillingNeighborhoodId,
      address_detail: formData.get("billing[address_detail]"),
      invoice_type: invoiceType,
    };

    // Fatura tipine göre ek alanlar
    if (invoiceType === "individual") {
      addressData.tckn = formData.get("tc_identity");
    } else if (invoiceType === "corporate") {
      addressData.company_name = formData.get("company_name");
      addressData.tax_office_id = selectedTaxOfficeId;
      addressData.tax_number = formData.get("tax_number");
    }

    try {
      const response = await apiClient.post("/customer-addresses", null, {
        params: addressData,
      });

      if (response.data && response.data.status === "success") {
        // Adresleri yeniden yükle
        await refetchAddresses();
        // Formu kapat ve seçili adresi ayarla
        setShowBillingAddressForm(false);
        if (response.data.data && response.data.data.id) {
          setSelectedBillingAddressId(response.data.data.id);
        }
        // Formu temizle
        e.target.reset();
        setSelectedBillingCityId("");
        setSelectedBillingDistrictId("");
        setSelectedBillingNeighborhoodId("");
        setSelectedTaxOfficeId("");
      }
    } catch (error) {
      log("Fatura adresi kaydedilirken hata:", error);
      alert("Adres kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSavingAddress(false);
    }
  };
  return (
    <section className="flat-spacing-11">
      <div className="container">
        <div className="tf-page-cart-wrap layout-2">
          <div className="tf-page-cart-item">
            <h5 className="fw-5 mb_20">1 - Teslimat Adresi</h5>

            {/* Adresler yükleniyor */}
            {isAuthenticated && isLoadingAddresses && (
              <CircularLoading text="Adresler yükleniyor..." />
            )}

            {/* Giriş yapmış kullanıcılar için teslimat adresi seçimi */}
            {isAuthenticated && !isLoadingAddresses && savedDeliveryAddresses.length > 0 && !showDeliveryAddressForm && (
              <>
                <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                  <label htmlFor="delivery-address-select">Teslimat Adresi Seçiniz*</label>
                  <SearchableSelect
                    id="delivery-address-select"
                    name="delivery-address-select"
                    options={savedDeliveryAddresses.map((address) => {
                      const parts = [address.title || "Adres"];

                      // Invoice type ibaresi ekle
                      if (address.invoice_type) {
                        parts.push(address.invoice_type === "company" ? "Kurumsal" : "Bireysel");
                      }

                      // Adres detayları ekle (şehir, ilçe)
                      let cityDistrict = "";
                      if (address.city?.name && address.district?.name) {
                        cityDistrict = `${address.city.name} / ${address.district.name}`;
                      } else if (address.city?.name) {
                        cityDistrict = address.city.name;
                      }

                      // Mahalle ekle (yer varsa) - mahalleden önce "-" yok, direkt ekleniyor
                      if (address.neighborhood?.name) {
                        cityDistrict = cityDistrict ? `${cityDistrict} ${address.neighborhood.name}` : address.neighborhood.name;
                      }

                      if (cityDistrict) {
                        parts.push(cityDistrict);
                      }

                      return {
                        id: address.id,
                        name: parts.join(" - "),
                      };
                    })}
                    value={selectedDeliveryAddressId}
                    onChange={(value) => setSelectedDeliveryAddressId(value ? Number(value) : null)}
                    placeholder="Teslimat adresi seçiniz"
                    required
                    searchPlaceholder="Adres ara..."
                  />
                </fieldset>

                {/* Seçilen Teslimat Adresi Kartı */}
                {selectedDeliveryAddressId !== null && (
                  <div
                    className="address-card"
                    style={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      padding: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    {(() => {
                      const selectedAddress = savedDeliveryAddresses.find(
                        (addr) => addr.id === selectedDeliveryAddressId
                      );
                      if (!selectedAddress) return null;
                      return (
                        <>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
                            <h6
                              style={{
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#333",
                                margin: 0,
                              }}
                            >
                              {selectedAddress.title}
                            </h6>
                            {selectedAddress.invoice_type && (
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "500",
                                  color: selectedAddress.invoice_type === "company" ? "#3c81b5" : "#666",
                                  backgroundColor: selectedAddress.invoice_type === "company" ? "#e8f4f8" : "#f5f5f5",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {selectedAddress.invoice_type === "company" ? "Kurumsal" : selectedAddress.invoice_type === "individual" ? "Bireysel" : ""}
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              color: "#666",
                              lineHeight: "1.6",
                            }}
                          >
                            {selectedAddress.neighborhood?.name && (
                              <div style={{ marginBottom: "4px" }}>{selectedAddress.neighborhood.name}</div>
                            )}
                            {selectedAddress.address_detail && (
                              <div style={{ marginBottom: "4px" }}>{selectedAddress.address_detail}</div>
                            )}
                            {selectedAddress.city?.name && selectedAddress.district?.name && (
                              <div style={{ marginBottom: "4px" }}>
                                {selectedAddress.city.name} / {selectedAddress.district.name}
                              </div>
                            )}
                            {/* Fatura Bilgileri */}
                            {selectedAddress.invoice_type === "individual" && selectedAddress.tckn && (
                              <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #e5e5e5" }}>
                                <div style={{ fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "4px" }}>Fatura Bilgileri:</div>
                                <div style={{ fontSize: "13px", color: "#666" }}>T.C. Kimlik No: {selectedAddress.tckn}</div>
                              </div>
                            )}
                            {selectedAddress.invoice_type === "company" && (
                              <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #e5e5e5" }}>
                                <div style={{ fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "4px" }}>Fatura Bilgileri:</div>
                                {selectedAddress.company_name && (
                                  <div style={{ fontSize: "13px", color: "#666", marginBottom: "2px" }}>Firma Adı: {selectedAddress.company_name}</div>
                                )}
                                {selectedAddress.tax_number && (
                                  <div style={{ fontSize: "13px", color: "#666", marginBottom: "2px" }}>Vergi No: {selectedAddress.tax_number}</div>
                                )}
                                {selectedAddress.tax_office?.name && (
                                  <div style={{ fontSize: "13px", color: "#666" }}>Vergi Dairesi: {selectedAddress.tax_office.name}</div>
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Yeni Adres Butonu */}
                <div style={{ marginBottom: "20px" }}>
                  <AddAddressButton
                    onClick={() => {
                      setShowDeliveryAddressForm(true);
                      setSelectedDeliveryAddressId(null);
                    }}
                    text="Yeni Teslimat Adresi Ekle"
                  />
                </div>
              </>
            )}

            {/* Teslimat Adresi Formu - Kayıtlı adres yoksa veya "Yeni Adres Ekle" tıklandıysa göster */}
            {(!isAuthenticated || (!isLoadingAddresses && savedDeliveryAddresses.length === 0) || showDeliveryAddressForm) && (
              <form onSubmit={handleSaveDeliveryAddress} className="form-checkout" style={{ marginTop: "20px" }}>
                <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                  <label htmlFor="address-title">Adres Başlığı Örneğin Evim veya İş Yerim*</label>
                  <input required type="text" id="address-title" name="address_title" placeholder="Örn: Evim" />
                </fieldset>

                <div className="box grid-2" style={{ marginBottom: "20px" }}>
                  <fieldset className="fieldset">
                    <label htmlFor="first-name">Ad</label>
                    <input required type="text" id="first-name" name="delivery[first_name]" />
                  </fieldset>
                  <fieldset className="fieldset">
                    <label htmlFor="last-name">Soyad</label>
                    <input required type="text" id="last-name" name="delivery[last_name]" />
                  </fieldset>
                </div>

                <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                  <label htmlFor="phone">Telefon Numarası</label>
                  <input required type="tel" id="phone" name="delivery[phone]" />
                </fieldset>

                <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                  <label htmlFor="email">E-Posta Adresi</label>
                  <input required type="email" autoComplete="abc@xyz.com" id="email" name="delivery[email]" />
                </fieldset>

                <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                  <label htmlFor="city">İl</label>
                  <SearchableSelect
                    id="city"
                    name="delivery[city]"
                    options={cities}
                    value={selectedCityId}
                    onChange={(value) => {
                      setSelectedCityId(value);
                      setSelectedDistrictId("");
                      setSelectedNeighborhoodId("");
                    }}
                    placeholder="Seçiniz"
                    required
                    searchPlaceholder="Şehir ara..."
                  />
                </fieldset>

                <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                  <label htmlFor="district">İlçe</label>
                  <SearchableSelect
                    id="district"
                    name="delivery[district]"
                    options={districts}
                    value={selectedDistrictId}
                    onChange={(value) => {
                      setSelectedDistrictId(value);
                      setSelectedNeighborhoodId("");
                    }}
                    placeholder={selectedCityId ? "Seçiniz" : "Önce il seçiniz"}
                    disabled={!selectedCityId}
                    required
                    searchPlaceholder="İlçe ara..."
                  />
                </fieldset>

                <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                  <label htmlFor="neighborhood">Mahalle*</label>
                  <SearchableSelect
                    id="neighborhood"
                    name="delivery[neighborhood]"
                    options={neighborhoods}
                    value={selectedNeighborhoodId}
                    onChange={(value) => {
                      setSelectedNeighborhoodId(value);
                    }}
                    placeholder={selectedDistrictId ? "Seçiniz" : "Önce ilçe seçiniz"}
                    disabled={!selectedDistrictId}
                    required
                    searchPlaceholder="Mahalle ara..."
                  />
                </fieldset>

                <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                  <label htmlFor="address-detail">Adres Detayı</label>
                  <textarea
                    name="delivery[address_detail]"
                    id="address-detail"
                    rows={4}
                    placeholder="Detaylı adres bilgisi"
                    required
                  />
                </fieldset>

                {/* Form Butonları */}
                <div className="d-flex align-items-center justify-content-center gap-20" style={{ marginTop: "20px" }}>
                  <button type="submit" className="tf-btn btn-fill animate-hover-btn" disabled={isSavingAddress}>
                    {isSavingAddress ? "Kaydediliyor..." : "Adresi Kaydet"}
                  </button>
                  {showDeliveryAddressForm && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeliveryAddressForm(false);
                        const form = document.getElementById("checkout-form");
                        if (form) {
                          const deliveryForm = form.querySelector('form[onSubmit]');
                          if (deliveryForm) deliveryForm.reset();
                        }
                        setSelectedCityId("");
                        setSelectedDistrictId("");
                        setSelectedNeighborhoodId("");
                      }}
                      className="tf-btn btn-outline animate-hover-btn"
                    >
                      İptal
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Fatura adresim teslimat adresim ile aynı - Sadece teslimat adresi seçildiyse ve invoice_type null ise göster */}
            {selectedDeliveryAddressId !== null && (() => {
              const selectedDeliveryAddress = savedDeliveryAddresses.find(
                (addr) => addr.id === selectedDeliveryAddressId
              );
              const hasInvoiceType = selectedDeliveryAddress?.invoice_type !== null && selectedDeliveryAddress?.invoice_type !== undefined;

              // invoice_type null ise checkbox'ı göster
              if (!hasInvoiceType) {
                return (
                  <fieldset className="box fieldset" style={{ marginTop: "30px", marginBottom: "20px" }}>
                    <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="checkbox"
                        id="same-billing-address"
                        checked={sameBillingAddress}
                        onChange={(e) => {
                          setSameBillingAddress(e.target.checked);
                          if (!e.target.checked) {
                            setSelectedBillingAddressId(null);
                            setShowBillingAddressForm(false);
                          }
                        }}
                        style={{ margin: 0, verticalAlign: "middle" }}
                      />
                      <label htmlFor="same-billing-address" style={{ margin: 0, lineHeight: "1.5" }}>
                        Fatura adresim teslimat adresim ile aynı
                      </label>
                    </div>
                  </fieldset>
                );
              }
              return null;
            })()}

            {/* Checkbox işaretli ve teslimat adresinde invoice_type null ise fatura türü formu göster */}
            {selectedDeliveryAddressId !== null && sameBillingAddress && (() => {
              const selectedDeliveryAddress = savedDeliveryAddresses.find(
                (addr) => addr.id === selectedDeliveryAddressId
              );
              const hasInvoiceType = selectedDeliveryAddress?.invoice_type !== null && selectedDeliveryAddress?.invoice_type !== undefined;

              // invoice_type null ise fatura türü seçimi ve form alanlarını göster
              if (!hasInvoiceType) {
                return (
                  <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                    <h5 className="fw-5 mb_20">2 - Fatura Bilgileri</h5>
                    <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
                      Teslimat adresinizde fatura türü bilgisi bulunmadığı için fatura türünü seçmeniz gerekmektedir.
                    </p>

                    {/* Fatura Türü Seçimi */}
                    <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                      <label className="mb_15">Fatura Türü*</label>
                      <div className="d-flex gap-20">
                        <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="radio"
                            name="checkout-invoice-type"
                            id="checkout-invoice-individual"
                            value="individual"
                            checked={invoiceType === "individual"}
                            onChange={(e) => setInvoiceType(e.target.value)}
                            style={{ margin: 0, verticalAlign: "middle" }}
                          />
                          <label htmlFor="checkout-invoice-individual" style={{ margin: 0, lineHeight: "1.5" }}>
                            Bireysel
                          </label>
                        </div>
                        <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="radio"
                            name="checkout-invoice-type"
                            id="checkout-invoice-corporate"
                            value="corporate"
                            checked={invoiceType === "corporate"}
                            onChange={(e) => setInvoiceType(e.target.value)}
                            style={{ margin: 0, verticalAlign: "middle" }}
                          />
                          <label htmlFor="checkout-invoice-corporate" style={{ margin: 0, lineHeight: "1.5" }}>
                            Kurumsal
                          </label>
                        </div>
                      </div>
                    </fieldset>

                    {/* Bireysel Fatura Alanları */}
                    {invoiceType === "individual" && (
                      <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                        <label htmlFor="checkout-tc-identity">T.C. Kimlik Numaranız*</label>
                        <input
                          required
                          type="text"
                          id="checkout-tc-identity"
                          name="checkout_tc_identity"
                          maxLength={11}
                          pattern="[0-9]{11}"
                          placeholder="11 haneli T.C. Kimlik No"
                        />
                      </fieldset>
                    )}

                    {/* Kurumsal Fatura Alanları */}
                    {invoiceType === "corporate" && (
                      <>
                        <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                          <label htmlFor="checkout-company-name">Firma Adı*</label>
                          <input
                            required
                            type="text"
                            id="checkout-company-name"
                            name="checkout_company_name"
                            placeholder="Firma Adı"
                          />
                        </fieldset>
                        <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                          <label htmlFor="checkout-tax-number">Vergi Numaranız*</label>
                          <input
                            required
                            type="text"
                            id="checkout-tax-number"
                            name="checkout_tax_number"
                            placeholder="Vergi Numaranız"
                          />
                        </fieldset>
                        <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                          <label htmlFor="checkout-tax-office">Vergi Dairesi Seçiniz*</label>
                          <SearchableSelect
                            id="checkout-tax-office"
                            name="checkout_tax_office"
                            options={taxOffices.map((office) => ({
                              id: office.id,
                              name: office.name,
                            }))}
                            value={selectedTaxOfficeId}
                            onChange={(value) => {
                              setSelectedTaxOfficeId(value);
                            }}
                            placeholder="Seçiniz"
                            required
                            searchPlaceholder="Vergi dairesi ara..."
                          />
                        </fieldset>
                      </>
                    )}
                  </div>
                );
              }
              return null;
            })()}

            {/* Fatura adresi seçimi - Checkbox işaretli değilse ve teslimat adresi seçildiyse göster */}
            {!sameBillingAddress && selectedDeliveryAddressId !== null && (
              <>
                <h5 className="fw-5 mb_20 mt_40">2 - Fatura Adresi</h5>

                {/* Adresler yükleniyor */}
                {isAuthenticated && isLoadingAddresses && (
                  <CircularLoading text="Adresler yükleniyor..." />
                )}

                {/* Giriş yapmış kullanıcılar için kayıtlı fatura adresi seçimi */}
                {isAuthenticated && !isLoadingAddresses && savedBillingAddresses.length > 0 && !showBillingAddressForm && (
                  <>
                    <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                      <label htmlFor="billing-address-select">Fatura Adresi Seçiniz*</label>
                      <SearchableSelect
                        id="billing-address-select"
                        name="billing-address-select"
                        options={savedBillingAddresses.map((address) => {
                          const parts = [address.title || "Adres"];

                          // Invoice type ibaresi ekle
                          if (address.invoice_type) {
                            parts.push(address.invoice_type === "company" ? "Kurumsal" : "Bireysel");
                          }

                          // Adres detayları ekle (şehir, ilçe)
                          let cityDistrict = "";
                          if (address.city?.name && address.district?.name) {
                            cityDistrict = `${address.city.name} / ${address.district.name}`;
                          } else if (address.city?.name) {
                            cityDistrict = address.city.name;
                          }

                          // Mahalle ekle (yer varsa) - mahalleden önce "-" yok, direkt ekleniyor
                          if (address.neighborhood?.name) {
                            cityDistrict = cityDistrict ? `${cityDistrict} ${address.neighborhood.name}` : address.neighborhood.name;
                          }

                          if (cityDistrict) {
                            parts.push(cityDistrict);
                          }

                          return {
                            id: address.id,
                            name: parts.join(" - "),
                          };
                        })}
                        value={selectedBillingAddressId}
                        onChange={(value) => setSelectedBillingAddressId(value ? Number(value) : null)}
                        placeholder="Fatura adresi seçiniz"
                        required
                        searchPlaceholder="Adres ara..."
                      />
                    </fieldset>

                    {/* Seçilen Fatura Adresi Kartı */}
                    {selectedBillingAddressId !== null && (
                      <div
                        className="address-card"
                        style={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e5e5",
                          borderRadius: "8px",
                          padding: "20px",
                          marginBottom: "20px",
                        }}
                      >
                        {(() => {
                          const selectedAddress = savedBillingAddresses.find(
                            (addr) => addr.id === selectedBillingAddressId
                          );
                          if (!selectedAddress) return null;
                          return (
                            <>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
                                <h6
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    color: "#333",
                                    margin: 0,
                                  }}
                                >
                                  {selectedAddress.title}
                                </h6>
                                {selectedAddress.invoice_type && (
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "500",
                                      color: selectedAddress.invoice_type === "company" ? "#3c81b5" : "#666",
                                      backgroundColor: selectedAddress.invoice_type === "company" ? "#e8f4f8" : "#f5f5f5",
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {selectedAddress.invoice_type === "company" ? "Kurumsal" : selectedAddress.invoice_type === "individual" ? "Bireysel" : ""}
                                  </span>
                                )}
                              </div>
                              <div
                                style={{
                                  fontSize: "14px",
                                  color: "#666",
                                  lineHeight: "1.6",
                                }}
                              >
                                {selectedAddress.neighborhood?.name && (
                                  <div style={{ marginBottom: "4px" }}>{selectedAddress.neighborhood.name}</div>
                                )}
                                {selectedAddress.address_detail && (
                                  <div style={{ marginBottom: "4px" }}>{selectedAddress.address_detail}</div>
                                )}
                                {selectedAddress.city?.name && selectedAddress.district?.name && (
                                  <div style={{ marginBottom: "4px" }}>
                                    {selectedAddress.city.name} / {selectedAddress.district.name}
                                  </div>
                                )}
                                {/* Fatura Bilgileri */}
                                {selectedAddress.invoice_type === "individual" && selectedAddress.tckn && (
                                  <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #e5e5e5" }}>
                                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "4px" }}>Fatura Bilgileri:</div>
                                    <div style={{ fontSize: "13px", color: "#666" }}>T.C. Kimlik No: {selectedAddress.tckn}</div>
                                  </div>
                                )}
                                {selectedAddress.invoice_type === "company" && (
                                  <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #e5e5e5" }}>
                                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "4px" }}>Fatura Bilgileri:</div>
                                    {selectedAddress.company_name && (
                                      <div style={{ fontSize: "13px", color: "#666", marginBottom: "2px" }}>Firma Adı: {selectedAddress.company_name}</div>
                                    )}
                                    {selectedAddress.tax_number && (
                                      <div style={{ fontSize: "13px", color: "#666", marginBottom: "2px" }}>Vergi No: {selectedAddress.tax_number}</div>
                                    )}
                                    {selectedAddress.tax_office?.name && (
                                      <div style={{ fontSize: "13px", color: "#666" }}>Vergi Dairesi: {selectedAddress.tax_office.name}</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {/* Yeni Fatura Adresi Butonu */}
                    <div style={{ marginBottom: "20px" }}>
                      <AddAddressButton
                        onClick={() => {
                          setShowBillingAddressForm(true);
                          setSelectedBillingAddressId(null);
                        }}
                        text="Yeni Fatura Adresi Ekle"
                      />
                    </div>
                  </>
                )}

                {/* Fatura adresi formu - Kayıtlı adres yoksa veya "Yeni Adres Ekle" tıklandıysa göster */}
                {(!isAuthenticated || (!isLoadingAddresses && savedBillingAddresses.length === 0) || showBillingAddressForm) && (
                  <form onSubmit={handleSaveBillingAddress} className="form-checkout" style={{ marginTop: "20px" }}>
                    {/* Fatura Adresi Formu */}
                    <div className="box grid-2" style={{ marginBottom: "20px" }}>
                      <fieldset className="fieldset">
                        <label htmlFor="billing-first-name">Ad</label>
                        <input required type="text" id="billing-first-name" name="billing[first_name]" />
                      </fieldset>
                      <fieldset className="fieldset">
                        <label htmlFor="billing-last-name">Soyad</label>
                        <input required type="text" id="billing-last-name" name="billing[last_name]" />
                      </fieldset>
                    </div>

                    <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                      <label htmlFor="billing-phone">Telefon Numarası</label>
                      <input required type="tel" id="billing-phone" name="billing[phone]" />
                    </fieldset>

                    <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                      <label htmlFor="billing-email">E-Posta Adresi</label>
                      <input required type="email" autoComplete="abc@xyz.com" id="billing-email" name="billing[email]" />
                    </fieldset>

                    <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                      <label htmlFor="billing-city">İl</label>
                      <SearchableSelect
                        id="billing-city"
                        name="billing[city]"
                        options={cities}
                        value={selectedBillingCityId}
                        onChange={(value) => {
                          setSelectedBillingCityId(value);
                          setSelectedBillingDistrictId("");
                        }}
                        placeholder="Seçiniz"
                        required
                        searchPlaceholder="Şehir ara..."
                      />
                    </fieldset>

                    <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                      <label htmlFor="billing-district">İlçe</label>
                      <SearchableSelect
                        id="billing-district"
                        name="billing[district]"
                        options={billingDistricts}
                        value={selectedBillingDistrictId}
                        onChange={(value) => {
                          setSelectedBillingDistrictId(value);
                          setSelectedBillingNeighborhoodId("");
                        }}
                        placeholder={selectedBillingCityId ? "Seçiniz" : "Önce il seçiniz"}
                        disabled={!selectedBillingCityId}
                        required
                        searchPlaceholder="İlçe ara..."
                      />
                    </fieldset>

                    <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                      <label htmlFor="billing-neighborhood">Mahalle*</label>
                      <SearchableSelect
                        id="billing-neighborhood"
                        name="billing[neighborhood]"
                        options={billingNeighborhoods}
                        value={selectedBillingNeighborhoodId}
                        onChange={(value) => {
                          setSelectedBillingNeighborhoodId(value);
                        }}
                        placeholder={selectedBillingDistrictId ? "Seçiniz" : "Önce ilçe seçiniz"}
                        disabled={!selectedBillingDistrictId}
                        required
                        searchPlaceholder="Mahalle ara..."
                      />
                    </fieldset>

                    <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                      <label htmlFor="billing-address-detail">Adres Detayı</label>
                      <textarea
                        name="billing[address_detail]"
                        id="billing-address-detail"
                        rows={4}
                        placeholder="Detaylı adres bilgisi"
                        required
                      />
                    </fieldset>

                    {/* Fatura Türü - En Alta Taşındı */}
                    <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                      <label className="mb_15">Fatura Türü*</label>
                      <div className="d-flex gap-20">
                        <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="radio"
                            name="invoice_type"
                            id="invoice-individual"
                            value="individual"
                            checked={invoiceType === "individual"}
                            onChange={(e) => setInvoiceType(e.target.value)}
                            style={{ margin: 0, verticalAlign: "middle" }}
                          />
                          <label htmlFor="invoice-individual" style={{ margin: 0, lineHeight: "1.5" }}>
                            Bireysel
                          </label>
                        </div>
                        <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="radio"
                            name="invoice_type"
                            id="invoice-corporate"
                            value="corporate"
                            checked={invoiceType === "corporate"}
                            onChange={(e) => setInvoiceType(e.target.value)}
                            style={{ margin: 0, verticalAlign: "middle" }}
                          />
                          <label htmlFor="invoice-corporate" style={{ margin: 0, lineHeight: "1.5" }}>
                            Kurumsal
                          </label>
                        </div>
                      </div>
                    </fieldset>

                    {invoiceType === "individual" && (
                      <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                        <label htmlFor="tc-identity">T.C. Kimlik Numaranız*</label>
                        <input required type="text" id="tc-identity" name="tc_identity" maxLength={11} pattern="[0-9]{11}" />
                      </fieldset>
                    )}

                    {invoiceType === "corporate" && (
                      <>
                        <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                          <label htmlFor="company-name">Firma Adı</label>
                          <input required type="text" id="company-name" name="company_name" placeholder="Firma Adı" />
                        </fieldset>
                        <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                          <label htmlFor="tax-number">Vergi Numaranız</label>
                          <input required type="text" id="tax-number" name="tax_number" placeholder="Vergi Numaranız" />
                        </fieldset>
                        <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                          <label htmlFor="tax-office">Vergi Dairesi Seçiniz*</label>
                          <SearchableSelect
                            id="tax-office"
                            name="tax_office"
                            options={taxOffices.map((office) => ({
                              id: office.id,
                              name: office.name,
                            }))}
                            value={selectedTaxOfficeId}
                            onChange={(value) => {
                              setSelectedTaxOfficeId(value);
                            }}
                            placeholder="Seçiniz"
                            required
                            searchPlaceholder="Vergi dairesi ara..."
                          />
                        </fieldset>
                      </>
                    )}

                    {/* Form Butonları */}
                    <div className="d-flex align-items-center justify-content-center gap-20" style={{ marginTop: "20px" }}>
                      <button type="submit" className="tf-btn btn-fill animate-hover-btn" disabled={isSavingAddress}>
                        {isSavingAddress ? "Kaydediliyor..." : "Adresi Kaydet"}
                      </button>
                      {showBillingAddressForm && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowBillingAddressForm(false);
                            const form = document.getElementById("checkout-form");
                            if (form) {
                              const billingForm = form.querySelector('form[onSubmit]');
                              if (billingForm) billingForm.reset();
                            }
                            setSelectedBillingCityId("");
                            setSelectedBillingDistrictId("");
                            setSelectedBillingNeighborhoodId("");
                            setSelectedTaxOfficeId("");
                          }}
                          className="tf-btn btn-outline animate-hover-btn"
                        >
                          İptal
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </>
            )}

            <p className="text_black-2 mb_20" style={{ fontSize: "12px", marginTop: "20px" }}>
              Kargonuzun size sorunsuz şekilde ulaşabilmesi için bilgilerinizi eksiksiz girdiğinizden emin olun.
            </p>

            {/* Sipariş Notu Formu */}
            <form onSubmit={(e) => e.preventDefault()} className="form-checkout" id="checkout-form">
              <fieldset className="box fieldset">
                <label htmlFor="note">Sipariş notu (isteğe bağlı )</label>
                <textarea id="note" value={orderNote} onChange={(e) => handleOrderNoteChange(e.target.value)} />
              </fieldset>
            </form>

            {/* Ödeme Bilgileri - Sadece teslimat ve fatura adresi seçildiyse göster */}
            {selectedDeliveryAddressId !== null && (sameBillingAddress || selectedBillingAddressId !== null) && (
              <PaymentOptions cartTotal={cartTotals.total} />
            )}
          </div>
          <OrderSummary items={items} cartTotals={cartTotals} />
        </div>
      </div>
    </section>
  );
}
