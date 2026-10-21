// frontend/src/types/index.ts

export type UserRole = 'admin' | 'landlord' | 'tenant';

export interface User {
  user_id: number;
  full_name: string;
  phone: string;
  email: string;
  role: UserRole;
  is_active?: number;
  created_at?: string;
}

export interface HouseImage {
  image_id: number;
  house_id: number;
  image_path: string;
  is_primary: number;
}

export interface House {
  house_id: number;
  landlord_id: number;
  title: string;
  location: string;
  house_type: string; // 'Single Room' | 'Bedsitter' | '1 Bedroom' | '2 Bedroom' | '3 Bedroom'
  rent: number;
  deposit: number;
  description: string;
  amenities: string;
  amenities_list: string[];
  status: 'Vacant' | 'Occupied';
  approval_status: 'approved' | 'pending' | 'rejected';
  beds: number;
  baths: number;
  parking: number;
  date_posted: string;
  landlord_name?: string;
  landlord_phone?: string;
  landlord_email?: string;
  primary_image?: string;
  total_images?: number;
  images?: HouseImage[];
}

export interface Booking {
  booking_id: number;
  house_id: number;
  tenant_id: number;
  booking_date: string;
  booking_time: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'declined' | 'completed';
  created_at: string;
  house_title?: string;
  house_location?: string;
  house_rent?: number;
  house_type?: string;
  house_status?: string;
  house_image?: string;
  landlord_name?: string;
  landlord_phone?: string;
  landlord_email?: string;
  tenant_name?: string;
  tenant_phone?: string;
  tenant_email?: string;
}

export interface AdminStats {
  houses: {
    total: number;
    vacant: number;
    occupied: number;
    pending_approvals: number;
  };
  users: {
    total: number;
    landlords: number;
    tenants: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
  };
}
