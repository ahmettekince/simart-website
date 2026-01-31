"use client";

import { useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";
import { log } from "@/utils/logger";
import { getCities, getDistricts, getNeighborhoods } from "@/api/locations";
import SearchableSelect from "@/components/common/SearchableSelect";
import AddAddressButton from "@/components/common/AddAddressButton";
import PhoneInput from "@/components/common/PhoneInput";

export default function AccountAddress() {
  const [activeTab, setActiveTab] = useState("delivery"); // "delivery" veya "billing"
  const [activeEdit, setactiveEdit] = useState(false);
  const [activeAdd, setactiveAdd] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null); // Düzenlenen adresin ID'si
  const [editingAddress, setEditingAddress] = useState(null); // Düzenlenen adresin verisi
  const [deliveryAddresses, setDeliveryAddresses] = useState([]);
  const [billingAddresses, setBillingAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state'leri
  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [districts, setDistricts] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); // Field bazlı hatalar
  const [invoiceType, setInvoiceType] = useState("individual"); // "individual" veya "company"
  const [useAsBillingAddress, setUseAsBillingAddress] = useState(false); // Bu adresi fatura adreslerimde kullan

  // Adresleri yükle
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/customer-addresses");
        if (response.data && response.data.status === "success" && response.data.data) {
          const allAddresses = response.data.data;
          // Teslimat adreslerini filtrele
          const delivery = allAddresses.filter((addr) => addr.address_type === "delivery");
          // Fatura adreslerini filtrele
          const billing = allAddresses.filter((addr) => addr.address_type === "invoice");

          setDeliveryAddresses(delivery);
          setBillingAddresses(billing);
        }
      } catch (error) {
        log("Adresler yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  // Şehirleri yükle
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const citiesData = await getCities();
        setCities(citiesData);
      } catch (error) {
        log("Şehirler yüklenirken hata:", error);
      }
    };
    fetchCities();
  }, []);

  // İlçeleri yükle
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

  // Mahalleleri yükle
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


  const currentAddresses = activeTab === "delivery" ? deliveryAddresses : billingAddresses;

  // Adresleri yeniden yükle
  const refetchAddresses = async () => {
    try {
      const response = await apiClient.get("/customer-addresses");
      if (response.data && response.data.status === "success" && response.data.data) {
        const allAddresses = response.data.data;
        const delivery = allAddresses.filter((addr) => addr.address_type === "delivery");
        const billing = allAddresses.filter((addr) => addr.address_type === "invoice");

        setDeliveryAddresses(delivery);
        setBillingAddresses(billing);
      }
    } catch (error) {
      log("Adresler yeniden yüklenirken hata:", error);
    }
  };

  // Adres detaylarını yükle (düzenleme için)
  const loadAddressForEdit = async (addressId) => {
    try {
      const response = await apiClient.get(`/customer-addresses/${addressId}`);
      if (response.data && response.data.status === "success" && response.data.data) {
        const address = response.data.data;
        setEditingAddress(address); // Adres verisini state'e kaydet

        // Form alanlarını doldur
        setSelectedCityId(address.city_id?.toString() || "");
        setSelectedDistrictId(address.district_id?.toString() || "");
        setSelectedNeighborhoodId(address.neighborhood_id?.toString() || "");

        if (address.invoice_type) {
          setInvoiceType(address.invoice_type);
        }

        // Form input'larını doldur
        setTimeout(() => {
          const form = document.getElementById("formeditAddress");
          if (form) {
            const titleInput = form.querySelector('[name="address_title"]');
            const firstNameInput = form.querySelector('[name="first_name"]');
            const lastNameInput = form.querySelector('[name="last_name"]');
            const addressDetailInput = form.querySelector('[name="address_detail"]');

            if (titleInput) titleInput.value = address.title || "";
            if (firstNameInput) firstNameInput.value = address.first_name || "";
            if (lastNameInput) lastNameInput.value = address.last_name || "";
            if (addressDetailInput) addressDetailInput.value = address.address_detail || "";

            if (address.invoice_type === "individual") {
              const tcknInput = form.querySelector('[name="tckn"]');
              if (tcknInput) tcknInput.value = address.tckn || "";
            } else if (address.invoice_type === "company") {
              const companyNameInput = form.querySelector('[name="company_name"]');
              const taxOfficeInput = form.querySelector('[name="tax_office"]');
              const taxNumberInput = form.querySelector('[name="tax_number"]');
              if (companyNameInput) companyNameInput.value = address.company_name || "";
              if (taxOfficeInput) taxOfficeInput.value = address.tax_office || "";
              if (taxNumberInput) taxNumberInput.value = address.tax_number || "";
            }
          }
        }, 100);
      }
    } catch (error) {
      log("Adres detayları yüklenirken hata:", error);
      setSaveError("Adres detayları yüklenirken bir hata oluştu.");
    }
  };

  // Adres kaydetme/güncelleme fonksiyonu
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage("");
    setSaveError("");
    setFieldErrors({}); // Field hatalarını temizle

    const formData = new FormData(e.target);
    const addressData = {
      address_type: activeTab === "delivery" ? "delivery" : "invoice",
      title: formData.get("address_title"),
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      phone: formData.get("phone"),
      city_id: selectedCityId,
      district_id: selectedDistrictId,
      neighborhood_id: selectedNeighborhoodId,
      address_detail: formData.get("address_detail"),
    };

    // Fatura adresi için ek alanlar
    if (activeTab === "billing") {
      addressData.invoice_type = invoiceType;

      if (invoiceType === "individual") {
        addressData.tckn = formData.get("tckn");
      } else if (invoiceType === "company") {
        addressData.company_name = formData.get("company_name");
        addressData.tax_office = formData.get("tax_office");
        addressData.tax_number = formData.get("tax_number");
      }
    }

    // Teslimat adresi olarak ekleniyor ve "Bu adresi fatura adreslerimde kullan" işaretliyse
    if (activeTab === "delivery" && useAsBillingAddress) {
      addressData.use_invoice_address = true;
      addressData.invoice_type = invoiceType;

      if (invoiceType === "individual") {
        const tckn = formData.get("tckn");
        if (tckn) addressData.tckn = tckn;
      } else if (invoiceType === "company") {
        const companyName = formData.get("company_name");
        const taxOffice = formData.get("tax_office");
        const taxNumber = formData.get("tax_number");
        if (companyName) addressData.company_name = companyName;
        if (taxOffice) addressData.tax_office = taxOffice;
        if (taxNumber) addressData.tax_number = taxNumber;
      }
    }

    try {
      let response;

      // Düzenleme mi yoksa yeni ekleme mi?
      if (editingAddressId) {
        // PUT ile güncelleme
        response = await apiClient.put("/customer-addresses", null, {
          params: {
            ...addressData,
            id: editingAddressId,
          },
        });
      } else {
        // POST ile yeni ekleme
        response = await apiClient.post("/customer-addresses", null, {
          params: addressData,
        });
      }

      if (response.data && response.data.status === "success") {
        setSaveMessage(editingAddressId ? "Adres başarıyla güncellendi." : "Adres başarıyla kaydedildi.");
        // Formu temizle
        e.target.reset();
        setSelectedCityId("");
        setSelectedDistrictId("");
        setSelectedNeighborhoodId("");
        setactiveEdit(false);
        setEditingAddress(null);
        setactiveAdd(false);
        setEditingAddressId(null);
        setFieldErrors({});
        setInvoiceType("individual");

        // Adresleri yeniden yükle
        await refetchAddresses();

        setTimeout(() => {
          setSaveMessage("");
        }, 3000);
      } else {
        setSaveError(response.data?.message || "Adres kaydedilirken bir hata oluştu.");
      }
    } catch (error) {
      log("Adres kaydedilirken hata:", error);

      // Validasyon hatalarını kontrol et
      if (error.response?.data?.errors) {
        setFieldErrors(error.response.data.errors);
        setSaveError(error.response?.data?.message || "Lütfen formu kontrol edin.");
      } else {
        setSaveError(error.response?.data?.message || "Adres kaydedilirken bir hata oluştu.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Adres düzenleme butonuna tıklandığında
  const handleEditAddress = async (addressId) => {
    setEditingAddressId(addressId);
    setactiveAdd(true);
    setactiveEdit(false);
    setEditingAddress(null);
    await loadAddressForEdit(addressId);
  };

  return (
    <div className="my-account-content account-address">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 768px) {
          .address-cards-container {
            grid-template-columns: 1fr !important;
          }
          .tab-button {
            padding: 10px 16px !important;
            font-size: 13px !important;
          }
          .new-address-btn {
            width: 100% !important;
            justify-content: center !important;
          }
        }
        @media (max-width: 480px) {
          .tab-button {
            padding: 8px 12px !important;
            font-size: 12px !important;
          }
        }
      `}} />
      <div className="widget-inner-address" style={{ textAlign: "left" }}>
        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginBottom: "0",
            gap: "0",
            borderBottom: "1px solid #e5e5e5",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <button
            className="tab-button"
            onClick={() => {
              setActiveTab("delivery");
              setactiveEdit(false);
              setEditingAddress(null);
              setactiveAdd(false);
            }}
            style={{
              padding: "12px 20px",
              border: "none",
              backgroundColor: activeTab === "delivery" ? "#f5f5f5" : "#fff",
              color: "#333",
              fontSize: "14px",
              fontWeight: activeTab === "delivery" ? "600" : "500",
              cursor: "pointer",
              borderRadius: "8px 8px 0 0",
              transition: "all 0.2s",
              borderBottom: activeTab === "delivery" ? "2px solid #333" : "none",
              boxShadow: activeTab === "delivery" ? "0 -2px 4px rgba(0,0,0,0.05)" : "none",
              position: "relative",
              zIndex: activeTab === "delivery" ? 1 : 0,
              whiteSpace: "nowrap",
              minWidth: "fit-content",
            }}
          >
            Teslimat Adreslerim
          </button>
          <button
            className="tab-button"
            onClick={() => {
              setActiveTab("billing");
              setactiveEdit(false);
              setEditingAddress(null);
              setactiveAdd(false);
            }}
            style={{
              padding: "12px 20px",
              border: "none",
              backgroundColor: activeTab === "billing" ? "#f5f5f5" : "#fff",
              color: "#333",
              fontSize: "14px",
              fontWeight: activeTab === "billing" ? "600" : "500",
              cursor: "pointer",
              borderRadius: "8px 8px 0 0",
              transition: "all 0.2s",
              borderBottom: activeTab === "billing" ? "2px solid #333" : "none",
              boxShadow: activeTab === "billing" ? "0 -2px 4px rgba(0,0,0,0.05)" : "none",
              position: "relative",
              zIndex: activeTab === "billing" ? 1 : 0,
              whiteSpace: "nowrap",
              minWidth: "fit-content",
            }}
          >
            Fatura Adreslerim
          </button>
        </div>

        {/* Yeni Adres Butonu */}
        <div style={{ marginTop: "30px", marginBottom: "20px" }}>
          <AddAddressButton onClick={() => setactiveEdit(true)} />
        </div>
        <form
          className="show-form-address wd-form-address form-checkout"
          id="formnewAddress"
          onSubmit={handleSaveAddress}
          style={activeEdit ? { display: "block" } : { display: "none" }}
        >
          <div className="title">Yeni Adres Ekle</div>

          {/* Başarı/Hata Mesajları */}
          {saveMessage && (
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "#d4edda",
                border: "1px solid #c3e6cb",
                borderRadius: "4px",
                color: "#155724",
                marginBottom: "20px",
              }}
            >
              {saveMessage}
            </div>
          )}
          {saveError && (
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "#f8d7da",
                border: "1px solid #f5c6cb",
                borderRadius: "4px",
                color: "#721c24",
                marginBottom: "20px",
              }}
            >
              {saveError}
            </div>
          )}

          {/* Adres Başlığı */}
          <fieldset className="box fieldset">
            <label htmlFor="address-title">Adres Başlığı Örneğin Evim veya İş Yerim*</label>
            <input required type="text" id="address-title" name="address_title" placeholder="Örn: Evim" />
            {fieldErrors.address_title && (
              <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                {fieldErrors.address_title[0]}
              </div>
            )}
          </fieldset>

          {/* Ad, Soyad ve Telefon */}
          <div className="box grid-3" style={{ gap: "15px" }}>
            <fieldset className="fieldset">
              <label htmlFor="first-name">Ad*</label>
              <input required type="text" id="first-name" name="first_name" />
              {fieldErrors.first_name && (
                <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.first_name[0]}
                </div>
              )}
            </fieldset>
            <fieldset className="fieldset">
              <label htmlFor="last-name">Soyad*</label>
              <input required type="text" id="last-name" name="last_name" />
              {fieldErrors.last_name && (
                <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.last_name[0]}
                </div>
              )}
            </fieldset>
            <fieldset className="fieldset">
              <label htmlFor="phone">Telefon Numarası*</label>
              <PhoneInput required id="phone" name="phone" />
              {fieldErrors.phone && (
                <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.phone[0]}
                </div>
              )}
            </fieldset>
          </div>


          {/* İl, İlçe ve Mahalle */}
          <div className="box grid-3" style={{ gap: "15px" }}>
            <fieldset className="fieldset">
              <label htmlFor="city">İl*</label>
              <SearchableSelect
                id="city"
                name="city"
                options={cities}
                value={selectedCityId}
                onChange={(value) => {
                  setSelectedCityId(value);
                  setSelectedDistrictId("");
                }}
                placeholder="Seçiniz"
                required
                searchPlaceholder="Şehir ara..."
              />
              {fieldErrors.city_id && (
                <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.city_id[0]}
                </div>
              )}
            </fieldset>

            <fieldset className="fieldset">
              <label htmlFor="district">İlçe*</label>
              <SearchableSelect
                id="district"
                name="district"
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
              {fieldErrors.district_id && (
                <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.district_id[0]}
                </div>
              )}
            </fieldset>

            <fieldset className="fieldset">
              <label htmlFor="neighborhood">Mahalle*</label>
              <SearchableSelect
                id="neighborhood"
                name="neighborhood"
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
              {fieldErrors.neighborhood_id && (
                <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.neighborhood_id[0]}
                </div>
              )}
            </fieldset>
          </div>

          {/* Adres Detayı */}
          <fieldset className="box fieldset">
            <label htmlFor="address-detail">Adres Detayı*</label>
            <textarea
              name="address_detail"
              id="address-detail"
              rows={4}
              placeholder="Detaylı adres bilgisi"
              required
            />
            {fieldErrors.address_detail && (
              <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                {fieldErrors.address_detail[0]}
              </div>
            )}
          </fieldset>


          {/* Bu adresi fatura adreslerimde kullan */}
          <fieldset className="box fieldset">
            <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="use-as-billing-address"
                className="tf-check"
                checked={useAsBillingAddress}
                onChange={(e) => {
                  setUseAsBillingAddress(e.target.checked);
                  if (!e.target.checked) {
                    setInvoiceType("individual");
                  }
                }}
              />
              <label htmlFor="use-as-billing-address" style={{ margin: 0, lineHeight: "1.5" }}>
                Bu adresi fatura adreslerimde kullan
              </label>
            </div>
          </fieldset>

          {/* Fatura Tipi Seçimi - Sadece checkbox işaretlendiğinde göster */}
          {useAsBillingAddress && (
            <>
              <fieldset className="box fieldset">
                <label className="mb_15">Fatura Türü*</label>
                <div className="d-flex gap-20">
                  <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="radio"
                      name="invoice_type"
                      id="invoice-individual-new"
                      value="individual"
                      checked={invoiceType === "individual"}
                      onChange={(e) => setInvoiceType(e.target.value)}
                      style={{ margin: 0, verticalAlign: "middle" }}
                    />
                    <label htmlFor="invoice-individual-new" style={{ margin: 0, lineHeight: "1.5" }}>
                      Bireysel
                    </label>
                  </div>
                  <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="radio"
                      name="invoice_type"
                      id="invoice-company-new"
                      value="company"
                      checked={invoiceType === "company"}
                      onChange={(e) => setInvoiceType(e.target.value)}
                      style={{ margin: 0, verticalAlign: "middle" }}
                    />
                    <label htmlFor="invoice-company-new" style={{ margin: 0, lineHeight: "1.5" }}>
                      Kurumsal
                    </label>
                  </div>
                </div>
                {fieldErrors.invoice_type && (
                  <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                    {fieldErrors.invoice_type[0]}
                  </div>
                )}
              </fieldset>

              {/* Bireysel Fatura Alanları */}
              {invoiceType === "individual" && (
                <fieldset className="box fieldset">
                  <label htmlFor="tckn">TC Kimlik No*</label>
                  <input required type="text" id="tckn" name="tckn" maxLength="11" />
                  {fieldErrors.tckn && (
                    <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                      {fieldErrors.tckn[0]}
                    </div>
                  )}
                </fieldset>
              )}

              {/* Kurumsal Fatura Alanları */}
              {invoiceType === "company" && (
                <>
                  <fieldset className="box fieldset">
                    <label htmlFor="company_name">Şirket Adı*</label>
                    <input required type="text" id="company_name" name="company_name" />
                    {fieldErrors.company_name && (
                      <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                        {fieldErrors.company_name[0]}
                      </div>
                    )}
                  </fieldset>
                  <fieldset className="box fieldset">
                    <label htmlFor="tax_office">Vergi Dairesi*</label>
                    <input required type="text" id="tax_office" name="tax_office" />
                    {fieldErrors.tax_office && (
                      <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                        {fieldErrors.tax_office[0]}
                      </div>
                    )}
                  </fieldset>
                  <fieldset className="box fieldset">
                    <label htmlFor="tax_number">Vergi No*</label>
                    <input required type="text" id="tax_number" name="tax_number" />
                    {fieldErrors.tax_number && (
                      <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                        {fieldErrors.tax_number[0]}
                      </div>
                    )}
                  </fieldset>
                </>
              )}
            </>
          )}

          {/* Butonlar */}
          <div className="d-flex align-items-center justify-content-center gap-20">
            <button type="submit" className="tf-btn btn-fill animate-hover-btn" disabled={isSaving}>
              {isSaving ? "Kaydediliyor..." : "Adresi Ekle"}
            </button>
            <button
              type="button"
              className="tf-btn btn-fill animate-hover-btn btn-hide-address"
              onClick={() => {
                setactiveEdit(false);
                setEditingAddress(null);
                setSelectedCityId("");
                setSelectedDistrictId("");
                setSelectedNeighborhoodId("");
                setSaveMessage("");
                setSaveError("");
                setFieldErrors({});
                setInvoiceType("individual");
                setUseAsBillingAddress(false);
              }}
            >
              İptal
            </button>
          </div>
        </form>
        {/* Adres Kartları */}
        <div
          style={{
            minHeight: "0px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <p>Yükleniyor...</p>
            </div>
          ) : currentAddresses.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#999",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <p>
                {activeTab === "delivery"
                  ? "Henüz teslimat adresiniz bulunmamaktadır."
                  : "Henüz fatura adresiniz bulunmamaktadır."}
              </p>
            </div>
          ) : (
            <div
              className="address-cards-container"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              {currentAddresses.map((address) => (
                <div
                  key={address.id}
                  className="address-card"
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    padding: "20px",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Başlık ve Edit Button */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: "15px",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flex: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <h6
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#333",
                          margin: 0,
                        }}
                      >
                        {address.title}
                      </h6>
                      {address.invoice_type && (
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "500",
                            color: address.invoice_type === "company" ? "#3c81b5" : "#666",
                            backgroundColor: address.invoice_type === "company" ? "#e8f4f8" : "#f5f5f5",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {address.invoice_type === "company" ? "Kurumsal" : address.invoice_type === "individual" ? "Bireysel" : ""}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleEditAddress(address.id)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "5px 10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#3c81b5",
                        fontSize: "14px",
                        fontWeight: "500",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.7";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                    >
                      Düzenle
                    </button>
                  </div>

                  {/* Adres Detayları */}
                  <div
                    className="address-details"
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      lineHeight: "1.6",
                      marginBottom: "15px",
                      flex: 1,
                    }}
                  >
                    {/* Mahalle */}
                    {address.neighborhood?.name && (
                      <div style={{ marginBottom: "4px" }}>
                        {address.neighborhood.name}
                      </div>
                    )}
                    {/* Adres Detayı */}
                    {address.address_detail && (
                      <div style={{ marginBottom: "4px" }}>
                        {address.address_detail}
                      </div>
                    )}
                    {/* Şehir / İlçe */}
                    {address.city?.name && address.district?.name && (
                      <div style={{ marginBottom: "4px" }}>
                        {address.city.name} / {address.district.name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <form
          className="edit-form-address wd-form-address form-checkout"
          id="formeditAddress"
          onSubmit={handleSaveAddress}
          style={activeAdd ? { display: "block" } : { display: "none" }}
        >
          <div className="title">Adresi Düzenle</div>

          {/* Başarı/Hata Mesajları */}
          {saveMessage && (
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "#d4edda",
                border: "1px solid #c3e6cb",
                borderRadius: "4px",
                color: "#155724",
                marginBottom: "20px",
              }}
            >
              {saveMessage}
            </div>
          )}
          {saveError && (
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "#f8d7da",
                border: "1px solid #f5c6cb",
                borderRadius: "4px",
                color: "#721c24",
                marginBottom: "20px",
              }}
            >
              {saveError}
            </div>
          )}

          {/* Adres Başlığı */}
          <fieldset className="box fieldset">
            <label htmlFor="edit-address-title">Adres Başlığı Örneğin Evim veya İş Yerim*</label>
            <input required type="text" id="edit-address-title" name="address_title" placeholder="Örn: Evim" />
            {fieldErrors.address_title && (
              <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                {fieldErrors.address_title[0]}
              </div>
            )}
          </fieldset>

          {/* Ad, Soyad ve Telefon */}
          <div className="box grid-3" style={{ gap: "15px" }}>
            <fieldset className="fieldset">
              <label htmlFor="edit-first-name">Ad*</label>
              <input required type="text" id="edit-first-name" name="first_name" />
              {fieldErrors.first_name && (
                <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.first_name[0]}
                </div>
              )}
            </fieldset>
            <fieldset className="fieldset">
              <label htmlFor="edit-last-name">Soyad*</label>
              <input required type="text" id="edit-last-name" name="last_name" />
              {fieldErrors.last_name && (
                <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.last_name[0]}
                </div>
              )}
            </fieldset>
            <fieldset className="fieldset">
              <label htmlFor="edit-phone">Telefon Numarası*</label>
              <PhoneInput required id="edit-phone" name="phone" value={editingAddress?.phone || ""} />
              {fieldErrors.phone && (
                <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.phone[0]}
                </div>
              )}
            </fieldset>
          </div>


          {/* İl, İlçe ve Mahalle */}
          <div className="box grid-3" style={{ gap: "15px" }}>
            <fieldset className="fieldset">
              <label htmlFor="edit-city">İl*</label>
              <SearchableSelect
                id="edit-city"
                name="city"
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
              {fieldErrors.city_id && (
                <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.city_id[0]}
                </div>
              )}
            </fieldset>

            <fieldset className="fieldset">
              <label htmlFor="edit-district">İlçe*</label>
              <SearchableSelect
                id="edit-district"
                name="district"
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
              {fieldErrors.district_id && (
                <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.district_id[0]}
                </div>
              )}
            </fieldset>

            <fieldset className="fieldset">
              <label htmlFor="edit-neighborhood">Mahalle*</label>
              <SearchableSelect
                id="edit-neighborhood"
                name="neighborhood"
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
              {fieldErrors.neighborhood_id && (
                <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.neighborhood_id[0]}
                </div>
              )}
            </fieldset>
          </div>

          {/* Adres Detayı */}
          <fieldset className="box fieldset">
            <label htmlFor="edit-address-detail">Adres Detayı*</label>
            <textarea
              name="address_detail"
              id="edit-address-detail"
              rows={4}
              placeholder="Detaylı adres bilgisi"
              required
            />
            {fieldErrors.address_detail && (
              <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                {fieldErrors.address_detail[0]}
              </div>
            )}
          </fieldset>

          {/* Fatura Adresi için Ek Alanlar */}
          {activeTab === "billing" && (
            <>
              <fieldset className="box fieldset">
                <label className="mb_15">Fatura Türü*</label>
                <div className="d-flex gap-20">
                  <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="radio"
                      name="invoice_type"
                      id="edit-invoice-individual"
                      value="individual"
                      checked={invoiceType === "individual"}
                      onChange={(e) => setInvoiceType(e.target.value)}
                      style={{ margin: 0, verticalAlign: "middle" }}
                    />
                    <label htmlFor="edit-invoice-individual" style={{ margin: 0, lineHeight: "1.5" }}>
                      Bireysel
                    </label>
                  </div>
                  <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="radio"
                      name="invoice_type"
                      id="edit-invoice-company"
                      value="company"
                      checked={invoiceType === "company"}
                      onChange={(e) => setInvoiceType(e.target.value)}
                      style={{ margin: 0, verticalAlign: "middle" }}
                    />
                    <label htmlFor="edit-invoice-company" style={{ margin: 0, lineHeight: "1.5" }}>
                      Kurumsal
                    </label>
                  </div>
                </div>
                {fieldErrors.invoice_type && (
                  <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                    {fieldErrors.invoice_type[0]}
                  </div>
                )}
              </fieldset>

              {/* Bireysel Fatura Alanları */}
              {invoiceType === "individual" && (
                <fieldset className="box fieldset">
                  <label htmlFor="edit-tckn">TC Kimlik No*</label>
                  <input required type="text" id="edit-tckn" name="tckn" maxLength="11" />
                  {fieldErrors.tckn && (
                    <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                      {fieldErrors.tckn[0]}
                    </div>
                  )}
                </fieldset>
              )}

              {/* Kurumsal Fatura Alanları */}
              {invoiceType === "company" && (
                <>
                  <fieldset className="box fieldset">
                    <label htmlFor="edit-company_name">Şirket Adı*</label>
                    <input required type="text" id="edit-company_name" name="company_name" />
                    {fieldErrors.company_name && (
                      <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                        {fieldErrors.company_name[0]}
                      </div>
                    )}
                  </fieldset>
                  <fieldset className="box fieldset">
                    <label htmlFor="edit-tax_office">Vergi Dairesi*</label>
                    <input required type="text" id="edit-tax_office" name="tax_office" />
                    {fieldErrors.tax_office && (
                      <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                        {fieldErrors.tax_office[0]}
                      </div>
                    )}
                  </fieldset>
                  <fieldset className="box fieldset">
                    <label htmlFor="edit-tax_number">Vergi No*</label>
                    <input required type="text" id="edit-tax_number" name="tax_number" />
                    {fieldErrors.tax_number && (
                      <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                        {fieldErrors.tax_number[0]}
                      </div>
                    )}
                  </fieldset>
                </>
              )}
            </>
          )}


          {/* Butonlar */}
          <div className="d-flex align-items-center justify-content-center gap-20">
            <button type="submit" className="tf-btn btn-fill animate-hover-btn" disabled={isSaving}>
              {isSaving ? "Kaydediliyor..." : "Adresi Güncelle"}
            </button>
            <button
              type="button"
              className="tf-btn btn-fill animate-hover-btn btn-hide-edit-address"
              onClick={() => {
                setactiveAdd(false);
                setSelectedCityId("");
                setSelectedDistrictId("");
                setSelectedNeighborhoodId("");
                setEditingAddressId(null);
                setEditingAddress(null);
                setFieldErrors({});
                setInvoiceType("individual");
              }}
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
