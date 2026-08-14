export interface UserLoginDtoRequest {
  username: string;
  password: string;
}

export interface AuthTokenResponse {
  token: string;
}