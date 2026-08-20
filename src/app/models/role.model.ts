// src/app/models/role.model.ts
export type RoleType = 'ADMIN' | 'RECEPCIONIST' | 'GUEST' | 'HOUSEKEEPING'|'MAINTENANCE'|'RELIEF_STAFF';

export interface RoleEntity {
  id: number;
  name: RoleType;
  description: string;
}