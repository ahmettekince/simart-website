"use client";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo, useRef } from "react";
import { log } from "@/utils/logger";
import apiClient from "@/utils/apiClient";
import { getCities, getDistricts, getNeighborhoods } from "@/api/locations";
import SearchableSelect from "@/components/common/SearchableSelect";
import AddAddressButton from "@/components/common/AddAddressButton";
import PaymentOptions from "@/components/othersPages/checkout/PaymentOptions";
import OrderSummary from "@/components/othersPages/checkout/OrderSummary";
import CircularLoading from "@/components/common/CircularLoading";
import PhoneInput from "@/components/common/PhoneInput";
import { calculateCartTotals } from "@/utils/cartTotals";
import CheckoutFAQs from "@/components/othersPages/checkout/CheckoutFAQs";


export default function Checkout() {
  const { items } = useCartStore();

  // API'den gelen totals.total kullan, yoksa local hesapla (fallback)
  const totals = useCartStore((state) => state.totals);

  const cartTotals = useMemo(() => {
    return calculateCartTotals(totals, items);
  }, [totals, items]);

  const [orderNote, setOrderNote] = useState("");
  const [giftNote, setGiftNote] = useState("");

  const [showOrderNote, setShowOrderNote] = useState(false);
  const [showGiftNote, setShowGiftNote] = useState(false);
  const [sameBillingAddress, setSameBillingAddress] = useState(false); // Teslimat ve fatura adresi aynı mı?
  const [invoiceType, setInvoiceType] = useState("individual"); // "individual" veya "corporate"
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [savedDeliveryAddresses, setSavedDeliveryAddresses] = useState([]); // Kayıtlı teslimat adresleri
  const [savedBillingAddresses, setSavedBillingAddresses] = useState([]); // Kayıtlı fatura adresleri
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true); // Adresler yükleniyor mu?
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState(null); // Seçilen teslimat adres ID'si
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState(null); // Seçilen fatura adres ID'si
  const [showDeliveryAddressForm, setShowDeliveryAddressForm] = useState(false); // Teslimat adresi formu gösterilsin mi?
  const [showBillingAddressForm, setShowBillingAddressForm] = useState(false); // Fatura adresi formu gösterilsin mi?

  // Şehir ve ilçe state'leri
  const [cities, setCities] = useState([]);
  const [citiesLoaded, setCitiesLoaded] = useState(false); // Şehirler yüklendi mi?
  const [isLoadingCities, setIsLoadingCities] = useState(false); // Şehirler yükleniyor mu?
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
  const [taxOfficesLoaded, setTaxOfficesLoaded] = useState(false); // Vergi daireleri yüklendi mi?
  const [isLoadingTaxOffices, setIsLoadingTaxOffices] = useState(false); // Vergi daireleri yükleniyor mu?
  const [selectedTaxOfficeId, setSelectedTaxOfficeId] = useState("");
  const [useAsBillingAddress, setUseAsBillingAddress] = useState(false); // Bu adresi fatura adreslerimde kullan
  const [acceptedAgreements, setAcceptedAgreements] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const paymentOptionsRef = useRef(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderErrors, setOrderErrors] = useState({}); // Field bazlı hatalar
  const [orderErrorMessage, setOrderErrorMessage] = useState(""); // Genel hata mesajı
  const [lastPostRequest, setLastPostRequest] = useState(null); // Son POST isteği bilgisi
  const [lastPostResponse, setLastPostResponse] = useState(null); // Son POST response bilgisi

  // Şehirleri lazy load ile yükle (sadece ilk açılışta)
  const fetchCities = async () => {
    if (citiesLoaded || isLoadingCities) return; // Zaten yüklendiyse veya yükleniyorsa tekrar yükleme

    setIsLoadingCities(true);
    try {
      const citiesData = await getCities();
      if (citiesData && citiesData.length > 0) {
        setCities(citiesData);
        setCitiesLoaded(true);
      }
    } catch (error) {
      log("Şehirler yüklenirken hata:", error);
    } finally {
      setIsLoadingCities(false);
    }
  };

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
        const districtsData = await getDistricts(selectedCityId);
        setDistricts(districtsData);
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
        const neighborhoodsData = await getNeighborhoods(selectedDistrictId);
        setNeighborhoods(neighborhoodsData);
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
        const districtsData = await getDistricts(selectedBillingCityId);
        setBillingDistricts(districtsData);
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
        const neighborhoodsData = await getNeighborhoods(selectedBillingDistrictId);
        setBillingNeighborhoods(neighborhoodsData);
      } catch (error) {
        log("Fatura mahalleleri yüklenirken hata:", error);
        setBillingNeighborhoods([]);
      }
    };
    fetchBillingNeighborhoods();
  }, [selectedBillingDistrictId]);

  // Vergi dairelerini lazy load ile yükle (sadece ilk açılışta)
  const fetchTaxOffices = async () => {
    if (taxOfficesLoaded || isLoadingTaxOffices) return; // Zaten yüklendiyse veya yükleniyorsa tekrar yükleme

    setIsLoadingTaxOffices(true);
    try {
      const response = await apiClient.get("/tax-offices");
      if (response.data && response.data.status === "success" && response.data.data) {
        setTaxOffices(response.data.data);
        setTaxOfficesLoaded(true);
      }
    } catch (error) {
      log("Vergi daireleri yüklenirken hata:", error);
      setTaxOffices([]);
    } finally {
      setIsLoadingTaxOffices(false);
    }
  };

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


  // Sipariş notu değiştiğinde (localStorage'a kaydetme)
  const handleOrderNoteChange = (value) => {
    setOrderNote(value);
  };

  // Hediye notu değiştiğinde
  const handleGiftNoteChange = (value) => {
    setGiftNote(value);
  };

  // Sipariş notu checkbox durumu değiştiğinde
  const handleShowOrderNoteChange = (value) => {
    setShowOrderNote(value);
  };

  // Hediye notu checkbox durumu değiştiğinde
  const handleShowGiftNoteChange = (value) => {
    setShowGiftNote(value);
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
      city_id: selectedCityId,
      district_id: selectedDistrictId,
      neighborhood_id: selectedNeighborhoodId,
      address_detail: formData.get("delivery[address_detail]"),
    };

    // Fatura adresi olarak da kaydedilecekse
    if (useAsBillingAddress) {
      addressData.use_invoice_address = true;
      addressData.invoice_type = invoiceType === "corporate" ? "company" : "individual";

      if (invoiceType === "individual") {
        addressData.tckn = formData.get("delivery_tc_identity");
      } else if (invoiceType === "corporate") {
        addressData.company_name = formData.get("delivery_company_name");
        addressData.tax_office_id = selectedTaxOfficeId;
        addressData.tax_number = formData.get("delivery_tax_number");
      }
    }

    try {
      const response = await apiClient.post("/customer-addresses", null, {
        params: addressData,
      });

      if (response.data && response.data.status === "success") {
        // Adresleri yeniden yükle
        await refetchAddresses();
        // Formu kapat ve seçili adresi ayarla
        setShowDeliveryAddressForm(false);
        setUseAsBillingAddress(false);
        if (response.data.data && response.data.data.id) {
          setSelectedDeliveryAddressId(response.data.data.id);
        }
        // Formu temizle
        e.target.reset();
        setSelectedCityId("");
        setSelectedDistrictId("");
        setSelectedNeighborhoodId("");
        setSelectedTaxOfficeId("");
      }
    } catch (error) {
      log("Teslimat adresi kaydedilirken hata:", error);
      // Hata durumunda alert yerine state üzerinden hata gösterimi yapılabilir
      setOrderErrorMessage("Adres kaydedilirken bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.");
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
      setOrderErrorMessage("Fatura adresi kaydedilirken bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Sipariş gönderme fonksiyonu
  const handleSubmitOrder = async () => {
    // Hataları temizle
    setOrderErrors({});
    setOrderErrorMessage("");

    // Sadece auth true ise çalışsın
    if (!isAuthenticated) {
      log("[Checkout] Kullanıcı giriş yapmamış, sipariş gönderilemez");
      setOrderErrorMessage("Sipariş vermek için lütfen giriş yapın.");
      return;
    }

    // Form validasyonları
    if (!selectedDeliveryAddressId) {
      setOrderErrors({ delivery_address_id: ["Lütfen teslimat adresi seçin."] });
      return;
    }

    if (!sameBillingAddress && !selectedBillingAddressId) {
      setOrderErrors({ invoice_address_id: ["Lütfen fatura adresi seçin."] });
      return;
    }

    // Sözleşme onay kontrolü
    if (!acceptedAgreements) {
      setOrderErrors({ agreements_accepted: ["Lütfen sözleşmeleri okuyup onaylayın."] });
      return;
    }

    // PaymentOptions'tan kart bilgilerini al
    if (!paymentOptionsRef.current) {
      setOrderErrorMessage("Ödeme bilgileri eksik.");
      return;
    }

    const paymentData = paymentOptionsRef.current.getPaymentData();

    // Kart bilgileri validasyonu
    if (!paymentData.card_holder_name || !paymentData.card_number || !paymentData.expiry_month || !paymentData.expiry_year || !paymentData.cvv) {
      setOrderErrorMessage("Lütfen tüm kart bilgilerini doldurun.");
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const requestBody = {
        delivery_address_id: selectedDeliveryAddressId,
        invoice_address_id: sameBillingAddress ? selectedDeliveryAddressId : selectedBillingAddressId,
        card_holder_name: paymentData.card_holder_name,
        card_number: paymentData.card_number,
        expiry_month: paymentData.expiry_month,
        expiry_year: paymentData.expiry_year,
        cvv: paymentData.cvv,
        installment_count: paymentData.installment_count,
        uzak_satis_sozlesmesi_accepted: true,
        agreements_accepted: true,
        // Sipariş notu: checkbox işaretli VE dolu ise gönder
        ...(showOrderNote && orderNote && orderNote.trim() && { notes: orderNote.trim() }),
        // Hediye notu: checkbox işaretli VE dolu ise gönder
        ...(showGiftNote && giftNote && giftNote.trim() && { gift_note: giftNote.trim() }),
      };

      // Konsola yazdır (güvenlik için hassas bilgileri gizle)
      const safeRequestBody = {
        ...requestBody,
        card_number: requestBody.card_number ? `${requestBody.card_number.substring(0, 4)}****${requestBody.card_number.substring(requestBody.card_number.length - 4)}` : '',
        cvv: '***',
      };
      const requestInfo = {
        url: "/checkout/validate",
        method: "POST",
        body: safeRequestBody,
        timestamp: new Date().toISOString(),
      };

      console.log("🚀 POST İsteği Gönderiliyor:", requestInfo);
      console.log("📦 Tam Request Body (gizli):", requestBody);

      // Sayfada göstermek için state'e kaydet
      setLastPostRequest(requestInfo);

      log("[Checkout] Sipariş gönderiliyor:", requestBody);

      const response = await apiClient.post("/checkout/validate", requestBody);

      const responseInfo = {
        status: response.status,
        data: response.data,
        timestamp: new Date().toISOString(),
      };

      console.log("✅ POST İsteği Başarılı:", responseInfo);

      // Sayfada göstermek için state'e kaydet
      setLastPostResponse(responseInfo);

      log("[Checkout] Sipariş yanıtı:", response.data);

      if (response.data && response.data.status === "success") {
        setOrderErrorMessage("");
        setOrderErrors({});

        // payment_html varsa yeni sayfada göster
        if (response.data.data && response.data.data.payment_html) {
          const html = response.data.data.payment_html;
          log("[Checkout] Payment HTML alındı, yeni sayfada açılıyor");

          // Yeni sayfa aç ve HTML'i yaz
          const win = window.open('', '_self'); // Aynı sekme, popup yok
          win.document.open();
          win.document.write(html);
          win.document.close();
        } else {
          // payment_html yoksa başarı sayfasına yönlendir
          window.location.href = "/odeme-basarili";
        }
      } else {
        // API'den gelen hataları parse et
        if (response.data?.errors) {
          const errors = {};
          Object.keys(response.data.errors).forEach((key) => {
            if (Array.isArray(response.data.errors[key]) && response.data.errors[key].length > 0) {
              errors[key] = response.data.errors[key];
            }
          });
          setOrderErrors(errors);
        }
        setOrderErrorMessage(response.data?.message || "Sipariş oluşturulurken bir hata oluştu.");
      }
    } catch (error) {
      log("[Checkout] Sipariş gönderme hatası:", error);

      // Hata response'unu da kaydet
      if (error.response) {
        const errorResponseInfo = {
          status: error.response.status,
          data: error.response.data,
          timestamp: new Date().toISOString(),
        };
        console.log("❌ POST İsteği Hatası:", errorResponseInfo);
        setLastPostResponse(errorResponseInfo);
      } else {
        console.log("❌ POST İsteği Hatası (Network/Diğer):", error);
        setLastPostResponse({
          status: "ERROR",
          data: { message: error.message || "Bilinmeyen hata" },
          timestamp: new Date().toISOString(),
        });
      }

      // API'den gelen hataları parse et
      if (error.response?.data?.errors) {
        const errors = {};
        Object.keys(error.response.data.errors).forEach((key) => {
          if (Array.isArray(error.response.data.errors[key]) && error.response.data.errors[key].length > 0) {
            errors[key] = error.response.data.errors[key];
          }
        });
        setOrderErrors(errors);
      }

      const errorMessage = error.response?.data?.message || "Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.";
      setOrderErrorMessage(errorMessage);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <section className="flat-spacing-11">
      {/* Mobil sepet tutarı bar - sadece mobilde görünür */}
      <div className="checkout-mobile-cart-bar">
        <div className="checkout-mobile-cart-bar-row">
          <span className="checkout-mobile-cart-bar-label">Sepet tutarı</span>
          <div className="checkout-mobile-cart-bar-right">
            <span className="checkout-mobile-cart-bar-price">₺{cartTotals.total.toLocaleString("tr-TR")}</span>
            <span className="checkout-mobile-cart-bar-kdv">KDV dahil</span>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="tf-page-cart-wrap layout-2">
          <div className="tf-page-cart-item">
            <h5 className="fw-5 mb_20">1 - Teslimat Adresi</h5>

            {/* Auth durumu yüklenene kadar bekle */}
            {!isInitialized ? (
              <CircularLoading text="Kullanıcı durumu kontrol ediliyor..." />
            ) : (
              <>
                {orderErrors.delivery_address_id && (
                  <div style={{ marginBottom: "15px", padding: "12px", backgroundColor: "#fee", border: "1px solid #fcc", borderRadius: "6px", fontSize: "14px", color: "#c33" }}>
                    {orderErrors.delivery_address_id[0]}
                  </div>
                )}

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

                <div className="box grid-2" style={{ marginBottom: "20px", gap: "15px" }}>
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
                  <label htmlFor="phone">Telefon</label>
                  <PhoneInput required id="phone" name="delivery[phone]" />
                </fieldset>

                <div className="box grid-2" style={{ marginBottom: "20px", gap: "15px" }}>
                  <fieldset className="fieldset">
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
                      onOpen={fetchCities}
                      placeholder={isLoadingCities ? "Yükleniyor..." : "Seçiniz"}
                      required
                      searchPlaceholder="Şehir ara..."
                    />
                  </fieldset>

                  <fieldset className="fieldset">
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
                </div>

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

                {/* Bu adresi fatura adreslerimde kullan */}
                <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                  <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      id="use-as-billing-address-delivery"
                      className="tf-check"
                      checked={useAsBillingAddress}
                      onChange={(e) => {
                        setUseAsBillingAddress(e.target.checked);
                        if (e.target.checked) {
                          setInvoiceType("individual");
                        }
                      }}
                    />
                    <label htmlFor="use-as-billing-address-delivery" style={{ margin: 0, lineHeight: "1.5" }}>
                      Bu adresi fatura adreslerimde kullan
                    </label>
                  </div>
                </fieldset>

                {/* Fatura Tipi Seçimi - Sadece checkbox işaretlendiğinde göster */}
                {useAsBillingAddress && (
                  <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "8px", border: "1px solid #eee" }}>
                    <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                      <label className="mb_15">Fatura Türü*</label>
                      <div className="d-flex gap-20">
                        <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="radio"
                            name="delivery_invoice_type"
                            id="delivery-invoice-individual"
                            value="individual"
                            checked={invoiceType === "individual"}
                            onChange={(e) => setInvoiceType(e.target.value)}
                            style={{ margin: 0, verticalAlign: "middle" }}
                          />
                          <label htmlFor="delivery-invoice-individual" style={{ margin: 0, lineHeight: "1.5" }}>
                            Bireysel
                          </label>
                        </div>
                        <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="radio"
                            name="delivery_invoice_type"
                            id="delivery-invoice-corporate"
                            value="corporate"
                            checked={invoiceType === "corporate"}
                            onChange={(e) => setInvoiceType(e.target.value)}
                            style={{ margin: 0, verticalAlign: "middle" }}
                          />
                          <label htmlFor="delivery-invoice-corporate" style={{ margin: 0, lineHeight: "1.5" }}>
                            Kurumsal
                          </label>
                        </div>
                      </div>
                    </fieldset>

                    {/* Bireysel Fatura Alanları */}
                    {invoiceType === "individual" && (
                      <fieldset className="box fieldset">
                        <label htmlFor="delivery_tc_identity">TC Kimlik No*</label>
                        <input required type="text" id="delivery_tc_identity" name="delivery_tc_identity" maxLength="11" pattern="[0-9]{11}" />
                      </fieldset>
                    )}

                    {/* Kurumsal Fatura Alanları */}
                    {invoiceType === "corporate" && (
                      <>
                        <fieldset className="box fieldset" style={{ marginBottom: "15px" }}>
                          <label htmlFor="delivery_company_name">Şirket Adı*</label>
                          <input required type="text" id="delivery_company_name" name="delivery_company_name" />
                        </fieldset>
                        <fieldset className="box fieldset" style={{ marginBottom: "15px" }}>
                          <label htmlFor="delivery_tax_office">Vergi Dairesi Seçiniz*</label>
                          <SearchableSelect
                            id="delivery_tax_office"
                            name="delivery_tax_office"
                            options={taxOffices.map((office) => ({
                              id: office.id,
                              name: office.name,
                            }))}
                            value={selectedTaxOfficeId}
                            onChange={(value) => setSelectedTaxOfficeId(value)}
                            onOpen={fetchTaxOffices}
                            placeholder={isLoadingTaxOffices ? "Yükleniyor..." : "Seçiniz"}
                            required
                            searchPlaceholder="Vergi dairesi ara..."
                          />
                        </fieldset>
                        <fieldset className="box fieldset">
                          <label htmlFor="delivery_tax_number">Vergi No*</label>
                          <input required type="text" id="delivery_tax_number" name="delivery_tax_number" />
                        </fieldset>
                      </>
                    )}
                  </div>
                )}

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
                            onOpen={fetchTaxOffices}
                            placeholder={isLoadingTaxOffices ? "Yükleniyor..." : "Seçiniz"}
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

                {orderErrors.invoice_address_id && (
                  <div style={{ marginBottom: "15px", padding: "12px", backgroundColor: "#fee", border: "1px solid #fcc", borderRadius: "6px", fontSize: "14px", color: "#c33" }}>
                    {orderErrors.invoice_address_id[0]}
                  </div>
                )}

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
                    <div className="box grid-2" style={{ marginBottom: "20px", gap: "15px" }}>
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
                      <label htmlFor="billing-phone">Telefon</label>
                      <PhoneInput required id="billing-phone" name="billing[phone]" />
                    </fieldset>

                    <div className="box grid-2" style={{ marginBottom: "20px", gap: "15px" }}>
                      <fieldset className="fieldset">
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

                      <fieldset className="fieldset">
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
                    </div>

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
                            onOpen={fetchTaxOffices}
                            placeholder={isLoadingTaxOffices ? "Yükleniyor..." : "Seçiniz"}
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

            {/* Ödeme Bilgileri - Sadece teslimat ve fatura adresi seçildiyse göster */}
            {selectedDeliveryAddressId !== null && (sameBillingAddress || selectedBillingAddressId !== null) && (
              <>
                <PaymentOptions ref={paymentOptionsRef} cartTotal={cartTotals.total} />
                
                <CheckoutFAQs />
              </>
            )}

            {/* POST İsteği Debug Paneli */}
            {(lastPostRequest || lastPostResponse) && (
              <div style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "monospace"
              }}>
                {lastPostRequest && (
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "10px", color: "#495057" }}>
                      🚀 POST İsteği:
                    </div>
                    <div style={{ marginBottom: "5px" }}>
                      <strong>URL:</strong> {lastPostRequest.url}
                    </div>
                    <div style={{ marginBottom: "5px" }}>
                      <strong>Method:</strong> {lastPostRequest.method}
                    </div>
                    <div style={{ marginBottom: "5px" }}>
                      <strong>Timestamp:</strong> {new Date(lastPostRequest.timestamp).toLocaleString("tr-TR")}
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <strong>Body:</strong>
                      <pre style={{
                        marginTop: "5px",
                        padding: "10px",
                        backgroundColor: "#fff",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        overflow: "auto",
                        maxHeight: "200px",
                        fontSize: "11px"
                      }}>
                        {JSON.stringify(lastPostRequest.body, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {lastPostResponse && (
                  <div>
                    <div style={{ fontWeight: "bold", marginBottom: "10px", color: lastPostResponse.status === 200 ? "#28a745" : "#dc3545" }}>
                      {lastPostResponse.status === 200 ? "✅ POST Response:" : "❌ POST Response:"}
                    </div>
                    <div style={{ marginBottom: "5px" }}>
                      <strong>Status:</strong> <span style={{ color: lastPostResponse.status === 200 ? "#28a745" : "#dc3545" }}>{lastPostResponse.status}</span>
                    </div>
                    <div style={{ marginBottom: "5px" }}>
                      <strong>Timestamp:</strong> {new Date(lastPostResponse.timestamp).toLocaleString("tr-TR")}
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <strong>Data:</strong>
                      <pre style={{
                        marginTop: "5px",
                        padding: "10px",
                        backgroundColor: "#fff",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        overflow: "auto",
                        maxHeight: "300px",
                        fontSize: "11px"
                      }}>
                        {JSON.stringify(lastPostResponse.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
              </>
            )}
          </div>
          <OrderSummary
            items={items}
            cartTotals={cartTotals}
            onSubmitOrder={handleSubmitOrder}
            isSubmitting={isSubmittingOrder}
            orderErrors={orderErrors}
            orderErrorMessage={orderErrorMessage}
            onOrderNoteChange={handleOrderNoteChange}
            onGiftNoteChange={handleGiftNoteChange}
            onShowOrderNoteChange={handleShowOrderNoteChange}
            onShowGiftNoteChange={handleShowGiftNoteChange}
            // Sözleşme onayı
            acceptedAgreements={acceptedAgreements}
            onAcceptedAgreementsChange={setAcceptedAgreements}
          />
        </div>
      </div>
    </section>
  );
}
