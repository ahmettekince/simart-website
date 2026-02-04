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
import { formatTcInput, formatTaxNumberInput, formatNameInput } from "@/utils/inputFormatters";


export default function Checkout() {
  const { items } = useCartStore();
  const isCartSynced = useCartStore((state) => state.isSynced);

  // API'den gelen totals.total kullan, yoksa local hesapla (fallback)
  const totals = useCartStore((state) => state.totals);

  const cartTotals = useMemo(() => {
    return calculateCartTotals(totals, items);
  }, [totals, items]);

  const [orderNote, setOrderNote] = useState("");
  const [giftNote, setGiftNote] = useState("");

  const [showOrderNote, setShowOrderNote] = useState(false);
  const [showGiftNote, setShowGiftNote] = useState(false);
  const [sameBillingAddress, setSameBillingAddress] = useState(true); // Teslimat ve fatura adresi aynı mı? (varsayılan işaretli)
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
  const deliveryFormRef = useRef(null);
  const billingFormRef = useRef(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderErrors, setOrderErrors] = useState({}); // Field bazlı hatalar
  const [orderErrorMessage, setOrderErrorMessage] = useState(""); // Genel hata mesajı
  const [deliveryAddressErrors, setDeliveryAddressErrors] = useState({}); // Teslimat adresi API hataları (alan bazlı)
  const [billingAddressErrors, setBillingAddressErrors] = useState({}); // Fatura adresi API hataları (alan bazlı)
  const [lastPostRequest, setLastPostRequest] = useState(null); // Son POST isteği bilgisi
  const [lastPostResponse, setLastPostResponse] = useState(null); // Son POST response bilgisi

  // Misafir checkout (login değilse): e-posta, şifre e-postaya gönderilsin (varsayılan işaretli), şifre alanı
  const [guestEmail, setGuestEmail] = useState("");
  const [sendPasswordToEmail, setSendPasswordToEmail] = useState(true); // Varsayılan işaretli: şifrem e-posta adresime gönderilsin
  const [guestPassword, setGuestPassword] = useState("");

  // İleri tarihli kargo: checkbox (varsayılan kapalı) + tarih
  const [preferLaterDelivery, setPreferLaterDelivery] = useState(false);
  const [preferredDeliveryDate, setPreferredDeliveryDate] = useState("");

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
    setDeliveryAddressErrors({});
    setOrderErrorMessage("");

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

    // Fatura adresi olarak da kaydedilecekse (API individual/company bekliyor)
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
      const errData = error.response?.data;
      if (errData?.errors && typeof errData.errors === "object") {
        const fieldErrors = {};
        Object.keys(errData.errors).forEach((key) => {
          if (Array.isArray(errData.errors[key]) && errData.errors[key].length > 0) {
            fieldErrors[key] = errData.errors[key];
          }
        });
        setDeliveryAddressErrors(fieldErrors);
      }
      setOrderErrorMessage(errData?.message || "Adres kaydedilirken bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Fatura adresi kaydetme fonksiyonu
  const handleSaveBillingAddress = async (e) => {
    e.preventDefault();
    setIsSavingAddress(true);
    setBillingAddressErrors({});
    setOrderErrorMessage("");

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
      invoice_type: invoiceType === "corporate" ? "company" : "individual",
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
      const errData = error.response?.data;
      if (errData?.errors && typeof errData.errors === "object") {
        const fieldErrors = {};
        Object.keys(errData.errors).forEach((key) => {
          if (Array.isArray(errData.errors[key]) && errData.errors[key].length > 0) {
            fieldErrors[key] = errData.errors[key];
          }
        });
        setBillingAddressErrors(fieldErrors);
      }
      setOrderErrorMessage(errData?.message || "Fatura adresi kaydedilirken bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Misafir: teslimat formundan adres objesi; "aynı" tikliyse gri alandaki fatura bilgilerini de ekler
  const getGuestDeliveryAddress = () => {
    const form = deliveryFormRef.current;
    if (!form) return null;
    const fd = new FormData(form);
    const base = {
      title: fd.get("address_title") || "Teslimat",
      first_name: fd.get("delivery[first_name]"),
      last_name: fd.get("delivery[last_name]"),
      phone: fd.get("delivery[phone]"),
      city_id: selectedCityId,
      district_id: selectedDistrictId,
      neighborhood_id: selectedNeighborhoodId,
      address_detail: fd.get("delivery[address_detail]"),
    };
    if (!isAuthenticated && sameBillingAddress) {
      base.invoice_type = invoiceType === "corporate" ? "company" : "individual";
      const tcEl = document.getElementById("checkout-tc-identity-same");
      const companyEl = document.getElementById("checkout-company-name-same");
      const taxNumEl = document.getElementById("checkout-tax-number-same");
      if (invoiceType === "individual" && tcEl) base.tckn = tcEl.value?.trim() || null;
      if (invoiceType === "corporate") {
        if (companyEl) base.company_name = companyEl.value?.trim() || null;
        if (taxNumEl) base.tax_number = taxNumEl.value?.trim() || null;
        base.tax_office_id = selectedTaxOfficeId || null;
      }
    }
    return base;
  };

  // Misafir: fatura formundan adres objesi oluştur
  const getGuestBillingAddress = () => {
    const form = billingFormRef.current;
    if (!form) return null;
    const fd = new FormData(form);
    return {
      title: "Fatura Adresi",
      first_name: fd.get("billing[first_name]"),
      last_name: fd.get("billing[last_name]"),
      phone: fd.get("billing[phone]"),
      city_id: selectedBillingCityId,
      district_id: selectedBillingDistrictId,
      neighborhood_id: selectedBillingNeighborhoodId,
      address_detail: fd.get("billing[address_detail]"),
      invoice_type: invoiceType === "corporate" ? "company" : "individual",
      ...(invoiceType === "individual" && { tckn: fd.get("tc_identity") }),
      ...(invoiceType === "corporate" && {
        company_name: fd.get("company_name"),
        tax_number: fd.get("tax_number"),
        tax_office_id: selectedTaxOfficeId,
      }),
    };
  };

  // Sipariş gönderme fonksiyonu (misafir: tek form; giriş yapmış: adres seçip ödeme)
  const handleSubmitOrder = async () => {
    setOrderErrors({});
    setOrderErrorMessage("");

    // Misafir: e-posta zorunlu; şifre sadece "e-postaya gönderilsin" işaretsizse zorunlu
    if (!isAuthenticated) {
      const emailTrim = (guestEmail || "").trim();
      if (!emailTrim) {
        setOrderErrors({ email: ["Lütfen e-posta adresinizi girin."] });
        return;
      }
      if (!sendPasswordToEmail && !(guestPassword || "").trim()) {
        setOrderErrors({ password: ["Lütfen bir şifre belirleyin veya şifrenin e-postaya gönderilmesini işaretleyin."] });
        return;
      }
      const deliveryAddr = getGuestDeliveryAddress();
      if (!deliveryAddr?.first_name || !deliveryAddr?.last_name || !deliveryAddr?.phone || !deliveryAddr?.city_id || !deliveryAddr?.district_id || !deliveryAddr?.neighborhood_id || !deliveryAddr?.address_detail) {
        setOrderErrors({ delivery_address_id: ["Lütfen teslimat adresi bilgilerini eksiksiz doldurun."] });
        return;
      }
      if (sameBillingAddress) {
        if (invoiceType === "individual") {
          const tcEl = typeof document !== "undefined" ? document.getElementById("checkout-tc-identity-same") : null;
          if (!tcEl?.value?.trim() || tcEl.value.replace(/\D/g, "").length !== 11) {
            setOrderErrors({ invoice_address_id: ["Fatura için T.C. Kimlik No (11 hane) giriniz."] });
            return;
          }
        } else {
          const companyEl = typeof document !== "undefined" ? document.getElementById("checkout-company-name-same") : null;
          const taxNumEl = typeof document !== "undefined" ? document.getElementById("checkout-tax-number-same") : null;
          if (!companyEl?.value?.trim() || !taxNumEl?.value?.trim() || !selectedTaxOfficeId) {
            setOrderErrors({ invoice_address_id: ["Fatura için firma adı, vergi numarası ve vergi dairesi giriniz."] });
            return;
          }
          if (taxNumEl.value.replace(/\D/g, "").length !== 10) {
            setOrderErrors({ invoice_address_id: ["Vergi numarası 10 haneli olmalıdır."] });
            return;
          }
        }
      } else {
        const billingAddr = getGuestBillingAddress();
        if (!billingAddr?.first_name || !billingAddr?.last_name || !billingAddr?.phone || !billingAddr?.city_id || !billingAddr?.district_id || !billingAddr?.neighborhood_id || !billingAddr?.address_detail) {
          setOrderErrors({ invoice_address_id: ["Lütfen fatura adresi bilgilerini eksiksiz doldurun."] });
          return;
        }
        if (invoiceType === "corporate" && (String(billingAddr.tax_number || "").replace(/\D/g, "").length !== 10)) {
          setOrderErrors({ invoice_address_id: ["Vergi numarası 10 haneli olmalıdır."] });
          return;
        }
      }
    } else {
      if (!selectedDeliveryAddressId) {
        setOrderErrors({ delivery_address_id: ["Lütfen teslimat adresi seçin."] });
        return;
      }
      if (!sameBillingAddress && !selectedBillingAddressId) {
        setOrderErrors({ invoice_address_id: ["Lütfen fatura adresi seçin veya kaydedin."] });
        return;
      }
    }

    // Sözleşme onay kontrolü
    if (!acceptedAgreements) {
      setOrderErrors({ agreements_accepted: ["Lütfen sözleşmeleri okuyup onaylayın."] });
      return;
    }

    // İleri tarihli kargo seçildiyse tarih zorunlu
    if (preferLaterDelivery && !preferredDeliveryDate?.trim()) {
      setOrderErrorMessage("İleri tarihli gönderim için lütfen bir tarih seçin.");
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
      const requestBody = isAuthenticated
        ? {
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
          ...(showOrderNote && orderNote?.trim() && { notes: orderNote.trim() }),
          ...(showGiftNote && giftNote?.trim() && { gift_note: giftNote.trim() }),
          ...(preferLaterDelivery && preferredDeliveryDate && { preferred_delivery_date: preferredDeliveryDate }),
        }
        : {
          email: (guestEmail || "").trim(),
          password: sendPasswordToEmail ? "" : (guestPassword || "").trim(),
          delivery_address: getGuestDeliveryAddress(),
          same_as_delivery: sameBillingAddress,
          ...(sameBillingAddress && { use_invoice_address: true }),
          ...(sameBillingAddress ? {} : { invoice_address: getGuestBillingAddress() }),
          card_holder_name: paymentData.card_holder_name,
          card_number: paymentData.card_number,
          expiry_month: paymentData.expiry_month,
          expiry_year: paymentData.expiry_year,
          cvv: paymentData.cvv,
          installment_count: paymentData.installment_count,
          uzak_satis_sozlesmesi_accepted: true,
          agreements_accepted: true,
          ...(showOrderNote && orderNote?.trim() && { notes: orderNote.trim() }),
          ...(showGiftNote && giftNote?.trim() && { gift_note: giftNote.trim() }),
          ...(preferLaterDelivery && preferredDeliveryDate && { preferred_delivery_date: preferredDeliveryDate }),
        };

      // Konsola yazdır (güvenlik için hassas bilgileri gizle)
      const safeRequestBody = {
        ...requestBody,
        card_number: requestBody.card_number ? `${requestBody.card_number.substring(0, 4)}****${requestBody.card_number.substring(requestBody.card_number.length - 4)}` : '',
        cvv: '***',
        ...(requestBody.password !== undefined && { password: requestBody.password ? '***' : '(boş)' }),
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
      {/* Mobil sepet tutarı bar - sadece mobilde görünür; yüklenene kadar skeleton */}
      <div className="checkout-mobile-cart-bar">
        <div className="checkout-mobile-cart-bar-row">
          <span className="checkout-mobile-cart-bar-label">Sepet tutarı</span>
          <div className="checkout-mobile-cart-bar-right">
            {isCartSynced ? (
              <>
                <span className="checkout-mobile-cart-bar-price">₺{cartTotals.total.toLocaleString("tr-TR")}</span>
                <span className="checkout-mobile-cart-bar-kdv">KDV dahil</span>
              </>
            ) : (
              <span className="skeleton-content skeleton-rect" style={{ display: "inline-block", width: "90px", height: "20px", borderRadius: "8px" }} />
            )}
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row g-3 g-lg-4 checkout-sm-layout">
          <div className="col-12 col-lg-8">
            <div className="tf-page-cart-item">
              {/* Sol sütun: sepet senkronize olana kadar skeleton - login ise sadece teslimat, misafirse kayıt + teslimat (auth bilinmiyorsa misafir skeleton) */}
              {!isCartSynced ? (
                <div className="checkout-form-skeleton">
                  {/* Misafir: 1 - Kayıt İşlemleri (auth bilinmiyor veya !isAuthenticated) */}
                  {(!isInitialized || !isAuthenticated) && (
                    <>
                      <div className="skeleton-content skeleton-rect skeleton-heading" style={{ width: "200px" }} />
                      <div className="skeleton-content skeleton-rect skeleton-paragraph" />
                      <div className="skeleton-field">
                        <div className="skeleton-content skeleton-rect skeleton-label" style={{ width: "80px" }} />
                        <div className="skeleton-content skeleton-rect skeleton-input" />
                      </div>
                      <div className="skeleton-checkbox-row">
                        <div className="skeleton-content skeleton-checkbox-box" />
                        <div className="skeleton-content skeleton-rect skeleton-checkbox-label" />
                      </div>
                    </>
                  )}
                  {/* Herkes: Teslimat Adresi (login ise 1, misafirse 2 numaralı adım) */}
                  <div className="skeleton-content skeleton-rect skeleton-heading" style={{ width: "220px", marginTop: isInitialized && isAuthenticated ? 0 : "24px" }} />
                  <div className="skeleton-field">
                    <div className="skeleton-content skeleton-rect skeleton-label" style={{ width: "180px" }} />
                    <div className="skeleton-content skeleton-rect skeleton-address-select" />
                  </div>
                  <div className="skeleton-content skeleton-address-card">
                    <div className="skeleton-content skeleton-rect skeleton-card-line" />
                    <div className="skeleton-content skeleton-rect skeleton-card-line" />
                    <div className="skeleton-content skeleton-rect skeleton-card-line" />
                  </div>
                  <div className="skeleton-content skeleton-rect" style={{ height: "14px", width: "100%", maxWidth: "380px", marginTop: "20px", borderRadius: "6px" }} />
                </div>
              ) : (
                <>
                  {/* Adım numarası: login değilse 1 Kayıt, 2 Teslimat, 3 Fatura, 4 Ödeme; login ise 1 Teslimat, 2 Fatura, 3 Ödeme */}
                  {!isAuthenticated && isInitialized && (
                    <>
                      <h5 className="fw-5 mb_20">1 - Hızlı Kayıt</h5>
                      <p className="text_black-2 mb_20" style={{ fontSize: "14px" }}>
                        Siparişinizi takip edebilmeniz ve hesabınıza giriş yapabilmeniz için e-posta adresinizi girin.
                      </p>
                      {orderErrors.email && (
                        <div style={{ marginBottom: "15px", padding: "12px", backgroundColor: "#fee", border: "1px solid #fcc", borderRadius: "6px", fontSize: "14px", color: "#c33" }}>
                          {orderErrors.email[0]}
                        </div>
                      )}
                      {orderErrors.password && (
                        <div style={{ marginBottom: "15px", padding: "12px", backgroundColor: "#fee", border: "1px solid #fcc", borderRadius: "6px", fontSize: "14px", color: "#c33" }}>
                          {orderErrors.password[0]}
                        </div>
                      )}
                      <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                        <label htmlFor="checkout-guest-email">E-posta*</label>
                        <input
                          type="email"
                          id="checkout-guest-email"
                          name="email"
                          placeholder="ornek@email.com"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          autoComplete="email"
                        />
                      </fieldset>
                      <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="checkbox"
                            id="checkout-send-password-email"
                            checked={sendPasswordToEmail}
                            onChange={(e) => {
                              setSendPasswordToEmail(e.target.checked);
                              if (e.target.checked) setGuestPassword("");
                            }}
                            style={{ margin: 0, verticalAlign: "middle" }}
                          />
                          <label htmlFor="checkout-send-password-email" style={{ margin: 0, lineHeight: "1.5" }}>
                            Şifrem e-posta adresime gönderilsin
                          </label>
                        </div>
                      </fieldset>
                      {!sendPasswordToEmail && (
                        <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                          <label htmlFor="checkout-guest-password">Şifre*</label>
                          <input
                            type="password"
                            id="checkout-guest-password"
                            name="password"
                            placeholder="Şifre belirleyin"
                            value={guestPassword}
                            onChange={(e) => setGuestPassword(e.target.value)}
                            autoComplete="new-password"
                          />
                        </fieldset>
                      )}
                    </>
                  )}

                  <h5 className="fw-5 mb_20">{isAuthenticated ? "1" : "2"} - Teslimat Adresi</h5>

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

                      {/* Giriş yapmış ama teslimat adresi yok: sadece "Adres Ekle" alanı göster, form gösterme */}
                      {isAuthenticated && !isLoadingAddresses && savedDeliveryAddresses.length === 0 && !showDeliveryAddressForm && (
                        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                          <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
                            Teslimat adresiniz bulunmuyor. Siparişi tamamlamak için bir adres ekleyin.
                          </p>
                          <AddAddressButton
                            onClick={() => setShowDeliveryAddressForm(true)}
                            text="Teslimat Adresi Ekle"
                          />
                        </div>
                      )}

                      {/* Teslimat Adresi Formu - Misafir kullanıcı veya "Adres Ekle" tıklandıysa göster */}
                      {(!isAuthenticated || showDeliveryAddressForm) && (
                        <form
                          ref={deliveryFormRef}
                          onSubmit={isAuthenticated ? handleSaveDeliveryAddress : (e) => e.preventDefault()}
                          className="form-checkout"
                          style={{ marginTop: "20px" }}
                        >
                          <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                            <label htmlFor="address-title">Adres Başlığı Örneğin Evim veya İş Yerim*</label>
                            <input required type="text" id="address-title" name="address_title" placeholder="Örn: Evim" />
                          </fieldset>

                          <div className="box grid-2" style={{ marginBottom: "20px", gap: "15px" }}>
                            <fieldset className="fieldset">
                              <label htmlFor="first-name">Ad</label>
                              <input required type="text" id="first-name" name="delivery[first_name]" onInput={formatNameInput} />
                            </fieldset>
                            <fieldset className="fieldset">
                              <label htmlFor="last-name">Soyad</label>
                              <input required type="text" id="last-name" name="delivery[last_name]" onInput={formatNameInput} />
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

                          {/* Giriş yapmış kullanıcılar: "Bu adresi fatura adreslerimde kullan" (misafirde sadece "Fatura adresim teslimat adresim ile aynı" var, ikinci kez sormuyoruz) */}
                          {isAuthenticated && (
                            <>
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
                                      <input required type="text" id="delivery_tc_identity" name="delivery_tc_identity" maxLength={11} inputMode="numeric" autoComplete="off" onInput={formatTcInput} style={deliveryAddressErrors.tckn ? { borderColor: "#dc3545" } : undefined} />
                                      {deliveryAddressErrors.tckn && (
                                        <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{deliveryAddressErrors.tckn[0]}</div>
                                      )}
                                    </fieldset>
                                  )}

                                  {/* Kurumsal Fatura Alanları */}
                                  {invoiceType === "corporate" && (
                                    <>
                                      <fieldset className="box fieldset" style={{ marginBottom: "15px" }}>
                                        <label htmlFor="delivery_company_name">Şirket Adı*</label>
                                        <input required type="text" id="delivery_company_name" name="delivery_company_name" onInput={formatNameInput} style={deliveryAddressErrors.company_name ? { borderColor: "#dc3545" } : undefined} />
                                        {deliveryAddressErrors.company_name && (
                                          <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{deliveryAddressErrors.company_name[0]}</div>
                                        )}
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
                                        {deliveryAddressErrors.tax_office_id && (
                                          <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{deliveryAddressErrors.tax_office_id[0]}</div>
                                        )}
                                      </fieldset>
                                      <fieldset className="box fieldset">
                                        <label htmlFor="delivery_tax_number">Vergi No*</label>
                                        <input required type="text" id="delivery_tax_number" name="delivery_tax_number" maxLength={10} inputMode="numeric" autoComplete="off" placeholder="10 hane, sadece rakam" onInput={formatTaxNumberInput} style={deliveryAddressErrors.tax_number ? { borderColor: "#dc3545" } : undefined} />
                                        {deliveryAddressErrors.tax_number && (
                                          <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{deliveryAddressErrors.tax_number[0]}</div>
                                        )}
                                      </fieldset>
                                    </>
                                  )}
                                </div>
                              )}
                            </>
                          )}

                          {/* Form Butonları - Sadece giriş yapmış kullanıcılar görür (misafir tek form ile gönderir) */}
                          {isAuthenticated && (
                            <div className="d-flex align-items-center justify-content-center gap-20" style={{ marginTop: "20px" }}>
                              <button type="submit" className="tf-btn btn-fill animate-hover-btn" disabled={isSavingAddress}>
                                {isSavingAddress ? "Kaydediliyor..." : "Adresi Kaydet"}
                              </button>
                              {showDeliveryAddressForm && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowDeliveryAddressForm(false);
                                    if (deliveryFormRef.current) deliveryFormRef.current.reset();
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
                          )}
                        </form>
                      )}

                      {/* Fatura adresim teslimat adresim ile aynı - Teslimat seçildiyse veya misafirse göster */}
                      {(selectedDeliveryAddressId !== null || !isAuthenticated) && (() => {
                        const selectedDeliveryAddress = savedDeliveryAddresses.find(
                          (addr) => addr.id === selectedDeliveryAddressId
                        );
                        const hasInvoiceType = selectedDeliveryAddress?.invoice_type !== null && selectedDeliveryAddress?.invoice_type !== undefined;

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

                      {/* Tik "aynı" işaretliyse: gri alanda fatura türü (bireysel/kurumsal) ve TC veya vergi no istenir */}
                      {(selectedDeliveryAddressId !== null || !isAuthenticated) && sameBillingAddress && (() => {
                        const selectedDeliveryAddress = savedDeliveryAddresses.find(
                          (addr) => addr.id === selectedDeliveryAddressId
                        );
                        const hasInvoiceType = selectedDeliveryAddress?.invoice_type !== null && selectedDeliveryAddress?.invoice_type !== undefined;
                        if (!isAuthenticated || !hasInvoiceType) {
                          return (
                            <div style={{ marginTop: "20px", marginBottom: "20px", padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "10px", border: "1px solid #eee" }}>
                              <div style={{ fontSize: "14px", fontWeight: "600", color: "#333", marginBottom: "16px" }}>
                                Fatura bilgileri (teslimat adresi ile aynı adrese fatura kesilecek)
                              </div>
                              <fieldset className="box fieldset" style={{ marginBottom: "16px" }}>
                                <label className="mb_15">Fatura Türü*</label>
                                <div className="d-flex gap-20">
                                  <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <input
                                      type="radio"
                                      name="checkout-invoice-type-same"
                                      id="checkout-invoice-individual-same"
                                      value="individual"
                                      checked={invoiceType === "individual"}
                                      onChange={(e) => setInvoiceType(e.target.value)}
                                      style={{ margin: 0, verticalAlign: "middle" }}
                                    />
                                    <label htmlFor="checkout-invoice-individual-same" style={{ margin: 0, lineHeight: "1.5" }}>Bireysel</label>
                                  </div>
                                  <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <input
                                      type="radio"
                                      name="checkout-invoice-type-same"
                                      id="checkout-invoice-corporate-same"
                                      value="corporate"
                                      checked={invoiceType === "corporate"}
                                      onChange={(e) => setInvoiceType(e.target.value)}
                                      style={{ margin: 0, verticalAlign: "middle" }}
                                    />
                                    <label htmlFor="checkout-invoice-corporate-same" style={{ margin: 0, lineHeight: "1.5" }}>Kurumsal</label>
                                  </div>
                                </div>
                              </fieldset>
                              {invoiceType === "individual" && (
                                <fieldset className="box fieldset" style={{ marginBottom: "0" }}>
                                  <label htmlFor="checkout-tc-identity-same">T.C. Kimlik Numaranız*</label>
                                  <input
                                    type="text"
                                    id="checkout-tc-identity-same"
                                    name="checkout_tc_identity_same"
                                    maxLength={11}
                                    inputMode="numeric"
                                    autoComplete="off"
                                    placeholder="11 haneli T.C. Kimlik No"
                                    required={sameBillingAddress}
                                    onInput={formatTcInput}
                                  />
                                </fieldset>
                              )}
                              {invoiceType === "corporate" && (
                                <>
                                  <fieldset className="box fieldset" style={{ marginBottom: "16px" }}>
                                    <label htmlFor="checkout-company-name-same">Firma Adı*</label>
                                    <input required type="text" id="checkout-company-name-same" name="checkout_company_name_same" placeholder="Firma Adı" onInput={formatNameInput} />
                                  </fieldset>
                                  <fieldset className="box fieldset" style={{ marginBottom: "16px" }}>
                                    <label htmlFor="checkout-tax-number-same">Vergi Numaranız*</label>
                                    <input required type="text" id="checkout-tax-number-same" name="checkout_tax_number_same" maxLength={10} inputMode="numeric" autoComplete="off" placeholder="Vergi Numaranız (10 hane)" onInput={formatTaxNumberInput} />
                                  </fieldset>
                                  <fieldset className="box fieldset" style={{ marginBottom: "0" }}>
                                    <label htmlFor="checkout-tax-office-same">Vergi Dairesi*</label>
                                    <SearchableSelect
                                      id="checkout-tax-office-same"
                                      name="checkout_tax_office_same"
                                      options={taxOffices.map((o) => ({ id: o.id, name: o.name }))}
                                      value={selectedTaxOfficeId}
                                      onChange={(value) => setSelectedTaxOfficeId(value)}
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

                      {/* 3 - Fatura Adresi: Sadece tik kaldırıldığında (farklı fatura adresi istiyorsa) göster */}
                      {!sameBillingAddress && (selectedDeliveryAddressId !== null || !isAuthenticated) && (
                        <>
                          <h5 className="fw-5 mb_20 mt_40">{isAuthenticated ? "2" : "3"} - Fatura Adresi</h5>

                          {orderErrors.invoice_address_id && (
                            <div style={{ marginBottom: "15px", padding: "12px", backgroundColor: "#fee", border: "1px solid #fcc", borderRadius: "6px", fontSize: "14px", color: "#c33" }}>
                              {orderErrors.invoice_address_id[0]}
                            </div>
                          )}

                          {/* Giriş yapmış, fatura adresi var: liste + Adres Ekle butonu */}
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

                          {/* Giriş yapmış ama fatura adresi yok: sadece "Fatura Adresi Ekle" göster */}
                          {isAuthenticated && !isLoadingAddresses && savedBillingAddresses.length === 0 && !showBillingAddressForm && (
                            <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                              <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
                                Fatura adresiniz bulunmuyor. Siparişi tamamlamak için bir fatura adresi ekleyin.
                              </p>
                              <AddAddressButton
                                onClick={() => setShowBillingAddressForm(true)}
                                text="Fatura Adresi Ekle"
                              />
                            </div>
                          )}

                          {/* Fatura adresi formu - Misafir kullanıcı veya "Fatura Adresi Ekle" tıklandıysa göster */}
                          {(!isAuthenticated || showBillingAddressForm) && (
                            <form
                              ref={billingFormRef}
                              onSubmit={isAuthenticated ? handleSaveBillingAddress : (e) => e.preventDefault()}
                              className="form-checkout"
                              style={{ marginTop: "20px" }}
                            >
                              {/* Fatura Adresi Formu */}
                              <div className="box grid-2" style={{ marginBottom: "20px", gap: "15px" }}>
                                <fieldset className="fieldset">
                                  <label htmlFor="billing-first-name">Ad</label>
                                  <input required type="text" id="billing-first-name" name="billing[first_name]" onInput={formatNameInput} />
                                </fieldset>
                                <fieldset className="fieldset">
                                  <label htmlFor="billing-last-name">Soyad</label>
                                  <input required type="text" id="billing-last-name" name="billing[last_name]" onInput={formatNameInput} />
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
                                    onOpen={fetchCities}
                                    placeholder={isLoadingCities ? "Yükleniyor..." : "Seçiniz"}
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
                                  <input required type="text" id="tc-identity" name="tc_identity" maxLength={11} inputMode="numeric" autoComplete="off" onInput={formatTcInput} style={billingAddressErrors.tckn ? { borderColor: "#dc3545" } : undefined} />
                                  {billingAddressErrors.tckn && (
                                    <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{billingAddressErrors.tckn[0]}</div>
                                  )}
                                </fieldset>
                              )}

                              {invoiceType === "corporate" && (
                                <>
                                  <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                                    <label htmlFor="company-name">Firma Adı</label>
                                    <input required type="text" id="company-name" name="company_name" placeholder="Firma Adı" onInput={formatNameInput} style={billingAddressErrors.company_name ? { borderColor: "#dc3545" } : undefined} />
                                    {billingAddressErrors.company_name && (
                                      <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{billingAddressErrors.company_name[0]}</div>
                                    )}
                                  </fieldset>
                                  <fieldset className="box fieldset" style={{ marginBottom: "20px" }}>
                                    <label htmlFor="tax-number">Vergi Numaranız</label>
                                    <input required type="text" id="tax-number" name="tax_number" maxLength={10} inputMode="numeric" autoComplete="off" placeholder="Vergi Numaranız (10 hane, sadece rakam)" onInput={formatTaxNumberInput} style={billingAddressErrors.tax_number ? { borderColor: "#dc3545" } : undefined} />
                                    {billingAddressErrors.tax_number && (
                                      <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{billingAddressErrors.tax_number[0]}</div>
                                    )}
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
                                    {billingAddressErrors.tax_office_id && (
                                      <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{billingAddressErrors.tax_office_id[0]}</div>
                                    )}
                                  </fieldset>
                                </>
                              )}

                              {/* Form Butonları - Sadece giriş yapmış kullanıcılar (misafir tek form ile gönderir) */}
                              {isAuthenticated && (
                                <div className="d-flex align-items-center justify-content-center gap-20" style={{ marginTop: "20px" }}>
                                  <button type="submit" className="tf-btn btn-fill animate-hover-btn" disabled={isSavingAddress}>
                                    {isSavingAddress ? "Kaydediliyor..." : "Adresi Kaydet"}
                                  </button>
                                  {showBillingAddressForm && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShowBillingAddressForm(false);
                                        if (billingFormRef.current) billingFormRef.current.reset();
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
                              )}
                            </form>
                          )}
                        </>
                      )}

                      <p className="text_black-2 mb_20" style={{ fontSize: "12px", marginTop: "20px" }}>
                        Kargonuzun size sorunsuz şekilde ulaşabilmesi için bilgilerinizi eksiksiz girdiğinizden emin olun.
                      </p>

                      {/* Ödeme Bilgileri: Giriş yapmışta adres seçildikten sonra; misafirde hep görünür (tek form) */}
                      {(isAuthenticated ? (selectedDeliveryAddressId !== null && !showBillingAddressForm && (sameBillingAddress || selectedBillingAddressId !== null)) : true) && (() => {
                        const selectedDeliveryAddress = savedDeliveryAddresses.find(
                          (addr) => addr.id === selectedDeliveryAddressId
                        );
                        const isInvoicedDelivery = selectedDeliveryAddress?.invoice_type != null;
                        const paymentStepNum = isAuthenticated ? (isInvoicedDelivery ? 2 : 3) : 4;
                        return (
                          <>
                            <h5 className="fw-5 mb_20 mt_40">{paymentStepNum} - Ödeme Bilgileri</h5>
                            <PaymentOptions ref={paymentOptionsRef} cartTotal={cartTotals.total} />

                          </>
                        );
                      })()}

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
                </>
              )}
            </div>
          </div>
          <div className="col-12 col-lg-4 order-summary-sticky-wrap">
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
              preferLaterDelivery={preferLaterDelivery}
              preferredDeliveryDate={preferredDeliveryDate}
              onPreferLaterDeliveryChange={(checked) => {
                setPreferLaterDelivery(checked);
                if (!checked) setPreferredDeliveryDate("");
              }}
              onPreferredDeliveryDateChange={setPreferredDeliveryDate}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
