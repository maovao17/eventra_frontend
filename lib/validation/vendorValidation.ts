interface VendorData {
  businessName?: string
  service?: string
  location?: string
  price?: string | number
  [key: string]: unknown
}

export function validateVendorProfile(data: VendorData) {
  const errors: Record<string, string> = {}

  if (!data.businessName || data.businessName.trim() === "") {
    errors.businessName = "Business name is required"
  }

  if (!data.service || data.service.trim() === "") {
    errors.service = "At least one service is required"
  }

  if (!data.location || data.location.trim() === "") {
    errors.location = "Location is required"
  }

  if (data.price === undefined || data.price === "" || isNaN(Number(data.price))) {
    errors.price = "Valid price is required"
  }

  return errors
}
