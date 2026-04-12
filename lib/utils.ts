const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

export const resolveImage = (url?: string): string => {
  if (!url) return '/placeholder-avatar.jpg'
  
  // Full URL (Cloudinary)
  if (url.startsWith('http')) return url
  
  // Relative - prepend API_URL
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

export const resolveMediaUrl = resolveImage

export const formatCurrency = (amount: number | string | undefined): string => {
  return new Intl.NumberFormat('en-IN').format(Number(amount || 0))
}

