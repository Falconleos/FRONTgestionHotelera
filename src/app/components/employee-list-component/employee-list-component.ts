// src/app/components/employee-list/employee-list.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmployeeService } from '../../services/employee-service';
import { EmployeeDtoResponse } from '../../models/employee.model';
import { AuthService } from '../../services/auth-service';
import { UserService } from '../../services/user-service';
import { UserDtoResponse } from '../../models/user.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-list-component.html',
  styleUrls: ['./employee-list-component.css']
})
export class EmployeeListComponent implements OnInit {
  employees: EmployeeDtoResponse[] = [];
  loading = true;
  errorMessage = '';
  isAdmin = false;
  selectedEmployee: EmployeeDtoResponse | null = null;
  selectedUser: UserDtoResponse | null = null;
  detailLoading = false;
  detailError = '';
  userAvatarUrl = 'assets/default-avatar.png';

  // Almacena las URLs de blobs en caché para los avatares y roles de la tabla
  employeeAvatars: { [key: number]: string } = {};
  employeeRoles: { [key: number]: string } = {};

  constructor(
    private employeeService: EmployeeService,
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadEmployees();
  }

  checkUserRole(): void {
    const storedRoles = localStorage.getItem('role');
    if (storedRoles) {
      try {
        const roles = JSON.parse(storedRoles);
        if (Array.isArray(roles)) {
          this.isAdmin = roles.some((r: any) => {
            const val = typeof r === 'string' ? r : (r.authority || r.name || '');
            return val === 'ADMIN' || val === 'ROLE_ADMIN';
          });
        } else {
          const val = typeof roles === 'string' ? roles : '';
          this.isAdmin = val === 'ADMIN' || val === 'ROLE_ADMIN';
        }
      } catch (e) {
        this.isAdmin = storedRoles.includes('ADMIN') && !storedRoles.includes('RECEPCIONIST');
      }
    } else {
      this.isAdmin = false;
    }
  }

  loadEmployees(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.employeeService.getAll().subscribe({
      next: (data: EmployeeDtoResponse[]) => {
        this.employees = Array.isArray(data) ? [...data] : [];
        this.loading = false;

        // Precarga las fotos de perfil y roles de cada empleado en la tabla
        this.employees.forEach(emp => {
          this.loadEmployeeAvatar(emp.id);
          this.loadEmployeeRole(emp.id);
        });

        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.errorMessage = 'No se pudieron cargar los empleados o no cuentas con los permisos necesarios.';
        this.loading = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }

  // Método para obtener y cachear el rol del usuario vinculado basándose en RoleEntity
  private loadEmployeeRole(employeeId: number): void {
    this.userService.getById(employeeId).subscribe({
      next: (user: any) => {
        let roleName = 'N/A';
        
        // Comprueba si viene un objeto RoleEntity único o una lista de roles
        const rawRole = user.role || (user.roles && user.roles[0]);

        if (rawRole) {
          if (typeof rawRole === 'string') {
            roleName = rawRole;
          } else {
            // Maneja RoleEntity (.name o .authority)
            roleName = rawRole.name || rawRole.authority || 'N/A';
          }
        }

        this.employeeRoles[employeeId] = roleName;
        this.cdr.markForCheck();
      },
      error: () => {
        this.employeeRoles[employeeId] = 'N/A';
        this.cdr.markForCheck();
      }
    });
  }

  getEmployeeRole(emp: EmployeeDtoResponse | null): string {
    if (!emp || !emp.id) return 'N/A';
    return this.employeeRoles[emp.id] || 'Cargando...';
  }

  deleteEmployee(id: number): void {
    if (!this.isAdmin) {
      alert('No tienes permisos de Administrador para realizar esta acción.');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar el perfil de este empleado?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.employees = this.employees.filter((emp: EmployeeDtoResponse) => emp.id !== id);
          delete this.employeeAvatars[id];
          delete this.employeeRoles[id];
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          alert('Error al eliminar el empleado. Recuerda que esta acción requiere rol ADMIN.');
          console.error(err);
        }
      });
    }
  }

  openEmployeeDetail(employee: EmployeeDtoResponse): void {
    const employeeId = employee.id;
    this.selectedEmployee = employee;
    this.selectedUser = null;
    this.detailError = '';
    this.detailLoading = true;
    this.userAvatarUrl = this.employeeAvatars[employeeId] || 'assets/default-avatar.png';

    // El perfil de usuario y el de empleado comparten el mismo ID.
    this.userService.getById(employeeId).subscribe({
      next: (user) => {
        if (this.selectedEmployee?.id !== employeeId) return;

        this.selectedUser = user;
        this.detailLoading = false;
        this.loadUserAvatarModal(user.id);
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (this.selectedEmployee?.id !== employeeId) return;

        this.detailError = 'No se pudo cargar la información de usuario asociada.';
        this.detailLoading = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }

  closeEmployeeDetail(): void {
    this.selectedEmployee = null;
    this.selectedUser = null;
    this.detailError = '';
    this.detailLoading = false;
  }

  deleteEmployeeModal(id: number): void {
    this.closeEmployeeDetail();
    this.deleteEmployee(id);
  }

  private loadEmployeeAvatar(employeeId: number): void {
    if (this.employeeAvatars[employeeId]) return;

    this.userService.getProfilePicture(employeeId).subscribe({
      next: (blob) => {
        this.employeeAvatars[employeeId] = URL.createObjectURL(blob);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.employeeAvatars[employeeId] = 'assets/default-avatar.png';
        this.cdr.markForCheck();
      }
    });
  }

  getEmployeeAvatarUrl(emp: EmployeeDtoResponse | null): string {
    if (!emp || !emp.id) return 'assets/default-avatar.png';
    return this.employeeAvatars[emp.id] || 'assets/default-avatar.png';
  }

  private loadUserAvatarModal(userId: number): void {
    this.userService.getProfilePicture(userId).subscribe({
      next: (blob) => {
        if (this.selectedUser?.id !== userId) return;

        const objectUrl = URL.createObjectURL(blob);
        this.userAvatarUrl = objectUrl;
        this.employeeAvatars[userId] = objectUrl; // Actualiza también la caché de la tabla
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar la foto de perfil', err);
        this.cdr.markForCheck();
      }
    });
  }
}