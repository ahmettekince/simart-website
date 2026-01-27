"use client";

import { useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";
import { log } from "@/utils/logger";
import SearchableSelect from "@/components/common/SearchableSelect";

export default function AccountAddress() {
  const [activeTab, setActiveTab] = useState("delivery"); // "delivery" veya "billing"
  const [activeEdit, setactiveEdit] = useState(false);
  const [activeAdd, setactiveAdd] = useState(false);
  const [deliveryAddresses, setDeliveryAddresses] = useState([]);
  const [billingAddresses, setBillingAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state'leri
  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [districts, setDistricts] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  // Teslimat adreslerini yükle
  useEffect(() => {
    const fetchDeliveryAddresses = async () => {
      try {
        // TODO: API endpoint'i eklenecek
        // const response = await apiClient.get("/addresses?type=delivery");
        // if (response.data && response.data.status === "success") {
        //   setDeliveryAddresses(response.data.data || []);
        // }

        // Şimdilik mock data
        setDeliveryAddresses([
          {
            id: 1,
            title: "Ev",
            type: "home", // "home" veya "work"
            fullAddress: "Bahçelerüstü Mahallesi, Şehit İdris Yılmaz Caddesi 33/7 Ankara/Mamak/Saimekadın",
            isDefault: true,
          },

        ]);
      } catch (error) {
        log("Teslimat adresleri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveryAddresses();
  }, []);

  // Fatura adreslerini yükle
  useEffect(() => {
    const fetchBillingAddresses = async () => {
      try {
        // TODO: API endpoint'i eklenecek
        // const response = await apiClient.get("/addresses?type=billing");
        // if (response.data && response.data.status === "success") {
        //   setBillingAddresses(response.data.data || []);
        // }

        // Şimdilik mock data
        setBillingAddresses([]);
      } catch (error) {
        log("Fatura adresleri yüklenirken hata:", error);
      }
    };
    fetchBillingAddresses();
  }, []);

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

  // İlçeleri yükle
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedCityId) {
        setDistricts([]);
        setSelectedDistrictId("");
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

  const currentAddresses = activeTab === "delivery" ? deliveryAddresses : billingAddresses;

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
          <button
            className="tf-btn btn-outline animate-hover-btn btn-address mb_20 new-address-btn"
            onClick={() => setactiveEdit(true)}
            style={{
              backgroundColor: "#fff",
              color: "#3c81b5",
              border: "1px solid #3c81b5",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "0",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                border: "1px solid #3c81b5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                lineHeight: "1",
                fontWeight: "bold",
              }}
            >
              +
            </span>
            <span>Yeni adres</span>
          </button>
        </div>
        <form
          className="show-form-address wd-form-address form-checkout"
          id="formnewAddress"
          onSubmit={(e) => e.preventDefault()}
          style={activeEdit ? { display: "block" } : { display: "none" }}
        >
          <div className="title">Yeni Adres Ekle</div>

          {/* Adres Başlığı */}
          <fieldset className="box fieldset">
            <label htmlFor="address-title">Adres Başlığı Örneğin Evim veya İş Yerim*</label>
            <input required type="text" id="address-title" name="address_title" placeholder="Örn: Evim" />
          </fieldset>

          {/* Ad ve Soyad */}
          <div className="box grid-2">
            <fieldset className="fieldset">
              <label htmlFor="first-name">Ad*</label>
              <input required type="text" id="first-name" name="first_name" />
            </fieldset>
            <fieldset className="fieldset">
              <label htmlFor="last-name">Soyad*</label>
              <input required type="text" id="last-name" name="last_name" />
            </fieldset>
          </div>

          {/* Telefon */}
          <fieldset className="box fieldset">
            <label htmlFor="phone">Telefon Numarası*</label>
            <input required type="tel" id="phone" name="phone" />
          </fieldset>

          {/* E-posta */}
          <fieldset className="box fieldset">
            <label htmlFor="email">E-Posta Adresi*</label>
            <input required type="email" autoComplete="email" id="email" name="email" />
          </fieldset>

          {/* İl */}
          <fieldset className="box fieldset">
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
          </fieldset>

          {/* İlçe */}
          <fieldset className="box fieldset">
            <label htmlFor="district">İlçe*</label>
            <SearchableSelect
              id="district"
              name="district"
              options={districts}
              value={selectedDistrictId}
              onChange={(value) => {
                setSelectedDistrictId(value);
              }}
              placeholder={selectedCityId ? "Seçiniz" : "Önce il seçiniz"}
              disabled={!selectedCityId}
              required
              searchPlaceholder="İlçe ara..."
            />
          </fieldset>

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
          </fieldset>

          {/* Varsayılan Adres */}
          <fieldset className="box fieldset">
            <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="check-new-address"
                className="tf-check"
                name="is_default"
              />
              <label htmlFor="check-new-address" style={{ margin: 0, lineHeight: "1.5" }}>
                Varsayılan adres olarak ayarla.
              </label>
            </div>
          </fieldset>

          {/* Butonlar */}
          <div className="d-flex align-items-center justify-content-center gap-20">
            <button type="button" className="tf-btn btn-fill animate-hover-btn">
              Adresi Ekle
            </button>
            <button
              type="button"
              className="tf-btn btn-fill animate-hover-btn btn-hide-address"
              onClick={() => {
                setactiveEdit(false);
                setSelectedCityId("");
                setSelectedDistrictId("");
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
                      {address.isDefault && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#fff",
                            fontWeight: "600",
                            backgroundColor: "#3c81b5",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Varsayılan
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setactiveAdd(true)}
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
                    {address.fullAddress?.split(",").map((line, index) => (
                      <div key={index} style={{ marginBottom: "4px" }}>
                        {line.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <form
          className="edit-form-address wd-form-address form-checkout"
          id="formeditAddress"
          onSubmit={(e) => e.preventDefault()}
          style={activeAdd ? { display: "block" } : { display: "none" }}
        >
          <div className="title">Adresi Düzenle</div>

          {/* Adres Başlığı */}
          <fieldset className="box fieldset">
            <label htmlFor="edit-address-title">Adres Başlığı Örneğin Evim veya İş Yerim*</label>
            <input required type="text" id="edit-address-title" name="address_title" placeholder="Örn: Evim" />
          </fieldset>

          {/* Ad ve Soyad */}
          <div className="box grid-2">
            <fieldset className="fieldset">
              <label htmlFor="edit-first-name">Ad*</label>
              <input required type="text" id="edit-first-name" name="first_name" />
            </fieldset>
            <fieldset className="fieldset">
              <label htmlFor="edit-last-name">Soyad*</label>
              <input required type="text" id="edit-last-name" name="last_name" />
            </fieldset>
          </div>

          {/* Telefon */}
          <fieldset className="box fieldset">
            <label htmlFor="edit-phone">Telefon Numarası*</label>
            <input required type="tel" id="edit-phone" name="phone" />
          </fieldset>

          {/* E-posta */}
          <fieldset className="box fieldset">
            <label htmlFor="edit-email">E-Posta Adresi*</label>
            <input required type="email" autoComplete="email" id="edit-email" name="email" />
          </fieldset>

          {/* İl */}
          <fieldset className="box fieldset">
            <label htmlFor="edit-city">İl*</label>
            <SearchableSelect
              id="edit-city"
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
          </fieldset>

          {/* İlçe */}
          <fieldset className="box fieldset">
            <label htmlFor="edit-district">İlçe*</label>
            <SearchableSelect
              id="edit-district"
              name="district"
              options={districts}
              value={selectedDistrictId}
              onChange={(value) => {
                setSelectedDistrictId(value);
              }}
              placeholder={selectedCityId ? "Seçiniz" : "Önce il seçiniz"}
              disabled={!selectedCityId}
              required
              searchPlaceholder="İlçe ara..."
            />
          </fieldset>

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
          </fieldset>

          {/* Varsayılan Adres */}
          <fieldset className="box fieldset">
            <div className="fieldset-radio" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="check-edit-address"
                className="tf-check"
                name="is_default"
              />
              <label htmlFor="check-edit-address" style={{ margin: 0, lineHeight: "1.5" }}>
                Varsayılan adres olarak ayarla.
              </label>
            </div>
          </fieldset>

          {/* Butonlar */}
          <div className="d-flex align-items-center justify-content-center gap-20">
            <button type="button" className="tf-btn btn-fill animate-hover-btn">
              Adresi Güncelle
            </button>
            <button
              type="button"
              className="tf-btn btn-fill animate-hover-btn btn-hide-edit-address"
              onClick={() => {
                setactiveAdd(false);
                setSelectedCityId("");
                setSelectedDistrictId("");
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
