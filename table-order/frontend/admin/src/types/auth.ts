export interface AdminCredentials {
  storeId: string;
  username: string;
  password: string;
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  storeId: string | null;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
}
