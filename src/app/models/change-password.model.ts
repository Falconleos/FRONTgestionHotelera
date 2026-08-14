// src/app/models/change-password.model.ts
export interface ChangePasswordDtoRequest {
  currentPassword: string;
  newPassword: string;
}