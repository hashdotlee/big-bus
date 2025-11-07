/**
 * User roles enum
 */
export enum UserRole {
  CUSTOMER = 'customer',
  DRIVER = 'driver',
  STAFF = 'staff',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

/**
 * User status enum
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  avatar?: string;
  userType: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * JWT Payload
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Login request DTO
 */
export interface LoginDto {
  username: string; // email or phone
  password: string;
  twoFactorCode?: string;
}

/**
 * Register request DTO
 */
export interface RegisterDto {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  userType: UserRole;
  referralCode?: string;
}

/**
 * Auth tokens response
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

/**
 * Forgot password DTO
 */
export interface ForgotPasswordDto {
  email: string;
}

/**
 * Reset password DTO
 */
export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

/**
 * Change password DTO
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/**
 * Update profile DTO
 */
export interface UpdateProfileDto {
  fullName?: string;
  phone?: string;
  avatar?: string;
}

/**
 * Two-factor authentication setup
 */
export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
}

/**
 * Verify 2FA DTO
 */
export interface Verify2FADto {
  code: string;
}
