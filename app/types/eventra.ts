export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'partial' | 'paid';

export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface Booking {
  id?: string;
  _id?: string;
  requestId: string;
  eventId: string;
  vendorId: string;
  customerId: string;
  status: BookingStatus;
  amount: number;
  paymentStatus?: PaymentStatus;
  date?: string;
}

export interface Request {
  id: string;
  eventId: string;
  vendorId: string;
  customerId: string;
  status: RequestStatus;
  createdAt: string;
  clientName: string;
}

export interface Vendor {
  id: string;
  userId?: string;
  name: string;
  category: string;
  location: string;
  price: number;
  rating: number;
  responseTime: string;
  image: string;
  description: string;
  services: string[];
  portfolio: string[];
}

export interface Payment {
  id: string;
  bookingId: string;
  eventId: string;
  vendorId: string;
  customerId: string;
  requestId: string;
  amount: number;
  bookingAmount: number;
  platformFee: number;
  commissionAmount: number;
  vendorPayoutAmount: number;
  payoutId?: string;
  status: 'success' | 'failed';
}

export interface EventItem {
  id?: string;
  _id?: string;
  name: string;
  eventType: string;
  eventDate?: string;
  date?: string;
  location?: { label?: string; address?: string };
  status: string;
  budget?: number;
  guestCount?: number;
  customerId?: string;
  createdAt?: string;
}

export interface Notification {
  _id: string;
  message: string;
  type: string;
  read?: boolean;
  bookingId?: string;
  daysBefore?: number;
}
