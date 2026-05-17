// Auth
export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  expiresAt: string;
}

export interface PasswordChangeRequiredResponse {
  requiresPasswordChange: true;
  token: string;
}

export type LoginResponse = AuthResponse | PasswordChangeRequiredResponse;

// Users
export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string | null;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
}

// Restaurants
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  timeZone: string | null;
  openTime: string;
  closeTime: string;
  isActive: boolean;
}

export interface CreateRestaurantRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  timeZone?: string | null;
  openTime: string;
  closeTime: string;
}

export interface UpdateRestaurantRequest {
  name?: string | null;
  address?: string | null;
  latitude?: number;
  longitude?: number;
  openTime?: string;
  closeTime?: string;
}

export interface PatchRestaurantRequest {
  isActive?: boolean | null;
}
