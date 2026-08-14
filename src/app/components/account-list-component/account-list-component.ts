import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Importar RouterModule
import { AccountService } from '../../services/account-service';
import { AccountDTOResponse } from '../../models/account.model';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, RouterModule], // Agregar RouterModule aquí
  templateUrl: './account-list-component.html',
  styleUrls: ['./account-list-component.css']
})
export class AccountListComponent implements OnInit {
  accounts: AccountDTOResponse[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private accountService: AccountService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAllAccounts().subscribe({
      next: (data: AccountDTOResponse[]) => {
        this.accounts = Array.isArray(data) ? [...data] : [];
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
}