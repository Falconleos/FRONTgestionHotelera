// src/app/models/user.model.ts
import { RoleEntity } from './role.model';

export interface UserDtoResponse {
  id: number;
  username: string;
  name: string;
  surname: string;
  dni: string;
  gender?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  birthDay: string; // O Date, dependiendo de cómo manejes las fechas en tu cliente
  roles?: RoleEntity[];
  createAt?: string;
  accountNonExpired?: boolean;
  accountNonLocked?: boolean;
  credentialsNonExpired?: boolean;
  enabled?: boolean;
}

export interface UserDtoRequest {
  username: string;
  password?: string;
  name: string;
  surname: string;
  dni: string;
  gender?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  birthDay: string; // Formato "YYYY-MM-DD" que envía LocalDate desde Java
}