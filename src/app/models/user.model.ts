  // src/app/models/user.model.ts
  import { RoleEntity } from './role.model';

  export interface UserDtoResponse {
    id: number;
    username: string;
    roles: RoleEntity[];
    name: string;
    surname: string;
    dni: string;
    email: string;
    phoneNumber: string;
    birthDay: string;
    createAt: string;
    accountNonExpired: boolean;
    accountNonLocked: boolean;
    credentialsNonExpired: boolean;
    enabled: boolean;
  }

  export interface UserDtoRequest {
    username: string;
    password?: string;
    name: string;
    surname: string;
    dni: string;
    email: string;
    phoneNumber: string;
    birthDay: string;
  }