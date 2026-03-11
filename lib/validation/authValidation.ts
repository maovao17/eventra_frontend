interface SignupData {
  name?: string
  email?: string
  phone?: string
  password?: string
  [key: string]: unknown
}

interface LoginData {
  phone?: string
  email?: string
  password?: string
  otp?: string
  [key: string]: unknown
}

/**
 * Basic frontend validation for signup form fields.
 * Returns an object where each key is a field name and the
 * value is the corresponding error message.
 */
export function validateSignup(data: SignupData) {
  const errors: Record<string, string> = {}

  if (!data.name || data.name.trim() === "") {
    errors.name = "Name is required"
  }

  if (data.email !== undefined) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!data.email || !re.test(data.email)) {
      errors.email = "Valid email is required"
    }
  }

  if (!data.phone || data.phone.trim() === "") {
    errors.phone = "Phone number is required"
  }

  if (data.password !== undefined) {
    if (!data.password || data.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }
  }

  return errors
}

/**
 * Basic frontend validation for login form fields.
 */
export function validateLogin(data: LoginData) {
  const errors: Record<string, string> = {}

  if (!data.phone || data.phone.trim() === "") {
    errors.phone = "Phone number is required"
  }

  if (data.email !== undefined) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!data.email || !re.test(data.email)) {
      errors.email = "Valid email is required"
    }
  }

  if (data.password !== undefined) {
    if (!data.password || data.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }
  }

  // OTP is optional and usually validated separately

  return errors
}
