import apiClient from "@/utils/apiClient";
import { log } from "@/utils/logger";

/**
 * Tüm şehirleri getirir (Client-side)
 * @returns {Promise<Array>} Şehirler listesi
 */
export async function getCities() {
  try {
    const response = await apiClient.get("/cities");
    if (response.data && response.data.status === "success" && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    log("Şehirler yüklenirken hata:", error);
    return [];
  }
}

/**
 * Belirli bir şehre ait ilçeleri getirir (Client-side)
 * @param {string|number} cityId - Şehir ID'si
 * @returns {Promise<Array>} İlçeler listesi
 */
export async function getDistricts(cityId) {
  if (!cityId) {
    return [];
  }
  try {
    const response = await apiClient.get(`/districts?city_id=${cityId}`);
    if (response.data && response.data.status === "success" && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    log("İlçeler yüklenirken hata:", error);
    return [];
  }
}

/**
 * Belirli bir ilçeye ait mahalleleri getirir (Client-side)
 * @param {string|number} districtId - İlçe ID'si
 * @returns {Promise<Array>} Mahalleler listesi
 */
export async function getNeighborhoods(districtId) {
  if (!districtId) {
    return [];
  }
  try {
    const response = await apiClient.get(`/neighborhoods?district_id=${districtId}`);
    if (response.data && response.data.status === "success" && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    log("Mahalleler yüklenirken hata:", error);
    return [];
  }
}
