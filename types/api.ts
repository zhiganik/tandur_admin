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
  expiresAt: string;
}

export interface PasswordChangeRequiredResponse {
  requiresPasswordChange: true;
  token: string;
}

export type LoginResponse = AuthResponse | PasswordChangeRequiredResponse;

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Users
export interface RestaurantRef {
  id: string;
  name: string;
}

export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  dateOfBirth: string | null;
  roles: string[];
  createdAt: string;
  restaurants: RestaurantRef[];
}

export interface MeDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  emailConfirmed: boolean;
  phone: string | null;
  phoneNumberConfirmed: boolean;
  dateOfBirth: string | null;
  roles: string[];
  createdAt: string;
  restaurants: RestaurantRef[];
}

export interface UpdateProfileRequest {
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface SendPhoneRequest {
  newPhone: string;
}

export interface VerifyPhoneRequest {
  newPhone: string;
  code: string;
}

export interface SendEmailRequest {
  newEmail: string;
}

export interface VerifyEmailRequest {
  newEmail: string;
  code: string;
}

// Restaurants
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  timeZone: string | null;
  isActive: boolean;
  isOpenNow: boolean;
  distanceKm: number | null;
  currency: string;
}

export interface CreateRestaurantRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  timeZone?: string | null;
  currency: string;
}

export interface UpdateRestaurantRequest {
  name?: string | null;
  address?: string | null;
  latitude?: number;
  longitude?: number;
  currency?: string;
}

// Schedule
export interface TimeSlot {
  from: string;
  to: string;
}

export interface ScheduleDay {
  dayOfWeek: number; // 0=Sunday … 6=Saturday
  isDayOff: boolean;
  timeSlots: TimeSlot[];
}

export interface UpdateScheduleDayRequest {
  isDayOff: boolean;
  timeSlots: TimeSlot[];
}

export interface UpdateFullScheduleRequest {
  days: ScheduleDay[];
}

// Overrides
export interface ScheduleOverride {
  id: string;
  date: string;
  reason: string;
  isInstant: boolean;
  timeSlots: TimeSlot[];
}

export interface CreateOverrideRequest {
  date: string;
  reason: string;
  timeSlots: TimeSlot[];
}

export interface UpdateOverrideRequest {
  reason: string;
  timeSlots: TimeSlot[];
}

export interface InstantCloseRequest {
  reason: string;
  timeSlots: TimeSlot[];
}

export interface PatchRestaurantRequest {
  isActive?: boolean | null;
}

// Categories
export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
  isVisible: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  sortOrder?: number;
  isVisible: boolean;
}

export interface UpdateCategoryRequest {
  name: string;
  sortOrder?: number;
  isVisible: boolean;
}

export interface PatchCategoryRequest {
  isVisible?: boolean | null;
  sortOrder?: number | null;
}

// Menu
export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface CreateMenuItemRequest {
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  price: number;
  isAvailable: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateMenuItemRequest {
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  price: number;
  categoryId: string;
  sortOrder?: number;
  isAvailable: boolean;
  isActive: boolean;
}

export interface MenuDto {
  categories: Category[];
  items: MenuItem[];
}

export interface PatchMenuItemRequest {
  isAvailable?: boolean | null;
  isActive?: boolean | null;
  price?: number | null;
  categoryId?: string | null;
  sortOrder?: number | null;
}
