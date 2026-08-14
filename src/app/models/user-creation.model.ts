// src/app/models/user.model.ts
export type RoleType = 'ADMIN' | 'RECEPCIONIST' | 'HOUSEKEEPING' | 'MAINTENANCE' | 'RELIEF_STAFF' | 'GUEST';

export interface UserDtoRequestCreation {
  username: string;
  password?: string;
  name: string;
  surname: string;
  dni: string;
  gender?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  birthDay?: string; // Formato 'yyyy-MM-dd' (requerido por @NotNull en Java)
  role: RoleType;   // Requerido por @NotNull en Java
}