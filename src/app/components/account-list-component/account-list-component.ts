import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // 1. Importar Router
import { AccountService } from '../../services/account-service';
import { AccountDTOResponse } from '../../models/account.model';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-list-component.html',
  styleUrls: ['./account-list-component.css']
})
export class AccountListComponent implements OnInit {
  accounts: AccountDTOResponse[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private accountService: AccountService,
    private router: Router, // 2. Inyectar Router aquí
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAllAccounts().subscribe({
      next: (data: AccountDTOResponse[]) => {
        this.accounts = Array.isArray(data) ? data.map(acc => {
          const base = acc.baseAmount || 0;
          const services = acc.servicesTotal || 0;
          const subtotal = base + services;
          const adjustment = acc.adjustmentPercentage || 0;
          const total = subtotal + (subtotal * (adjustment / 100));
          const paid = acc.paidAmount || 0;
          
          return {
            ...acc,
            totalAmount: total,
            remainingBalance: Math.max(0, total - paid)
          };
        }) : [];
        
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.errorMessage = 'No se pudieron cargar las cuentas.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // 3. Agregar este método para manejar la navegación al detalle
  viewAccountDetail(id: number): void {
    // Asegúrate de que esta ruta coincida con la que tengas en tu archivo de rutas
    this.router.navigate([`/dashboard/accounts/${id}`]);
  }
}