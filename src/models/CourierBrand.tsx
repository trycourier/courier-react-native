export interface CourierBrandResponse {
  data?: CourierBrandData
}

export interface CourierBrandData {
  brand?: CourierBrand
}

export interface CourierBrand {
  settings?: CourierBrandSettings
}

export interface CourierBrandSettings {
  inapp?: CourierBrandInApp
  colors?: CourierBrandColors
}

export interface CourierBrandInApp {
  disableCourierFooter?: boolean;
}

export interface CourierBrandColors {
  primary?: string;
}