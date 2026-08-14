export type RoleType = 'ADMIN' | 'RECEPCIONIST' | 'HOUSEKEEPING' | 'MAINTENANCE' | 'RELIEF_STAFF' | 'GUEST';

export interface UserDtoRequestCreation {
  username: string;
  password?: string;
  name: string;
  surname: string;
  dni: string;
  email: string;
  phoneNumber: string;
  birthDay?: string; // Formato 'yyyy-MM-dd'
  role: RoleType;
}