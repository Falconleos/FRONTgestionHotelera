// src/app/models/role.model.ts
export type RoleType = 'ADMIN' | 'RECEPCIONIST' | 'GUEST';

export interface RoleEntity {
  id: number;
  name: RoleType;
  description: string;
}