import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreditNoteService } from '../../services/credit-note-service';
import { AccountService } from '../../services/account-service';
import { BookingService } from '../../services/booking-service';
import { BookingCancellationDtoResponse } from '../../models/booking.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-credit-note-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './credit-note-list-component.html',
  styleUrls: ['./credit-note-list-component.css']
})
export class CreditNoteListComponent implements OnInit {
  creditNotes: any[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  searchCode: string = '';

  // --- Variables para el control del Modal de Detalle ---
  showModal: boolean = false;
  loadingDetail: boolean = false;
  cancellationDetail: BookingCancellationDtoResponse | null = null;
  detailError: string = '';
  selectedCreditNote: any = null;

  constructor(
    private creditNoteService: CreditNoteService,
    private accountService: AccountService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCreditNotes();
  }

  loadCreditNotes(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.creditNoteService.getAllCreditNotes().subscribe({
      next: (notes) => {
        console.log("Notas de crédito crudas del backend:", notes);
        
        if (!notes || notes.length === 0) {
          this.creditNotes = [];
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        const accountRequests = notes.map(note => {
          const accountId = note.accountId;
          if (!accountId) return of(note);

          return this.accountService.getAccountById(accountId).pipe(
            map(account => {
              console.log(`Datos obtenidos para la cuenta ${accountId}:`, account);
              return {
                ...note,
                account: account 
              };
            }),
            catchError((err) => {
              console.error(`Error al buscar la cuenta ${accountId}:`, err);
              return of(note);
            })
          );
        });

        forkJoin(accountRequests).subscribe({
          next: (enrichedNotes) => {
            console.log("Notas de crédito enriquecidas finales:", enrichedNotes);
            this.creditNotes = enrichedNotes;
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error general en forkJoin:', err);
            this.creditNotes = notes;
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar las notas de crédito:', err);
        this.errorMessage = 'No se pudieron cargar las notas de crédito.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(): void {
    if (!this.searchCode.trim()) {
      this.loadCreditNotes();
      return;
    }
    
    const query = this.searchCode.toLowerCase();
    this.creditNotes = this.creditNotes.filter(note => 
      String(note.id).includes(query) || 
      String(note.accountId).includes(query) ||
      String(note.account?.name || '').toLowerCase().includes(query) ||
      String(note.account?.surname || '').toLowerCase().includes(query) ||
      String(note.account?.dni || '').includes(query)
    );
  }

  viewDetail(id: number): void {
    console.log('Ver detalle de nota de crédito ID:', id);
    const note = this.creditNotes.find(n => n.id === id);
    if (!note) return;

    this.selectedCreditNote = note;
    this.showModal = true;
    this.loadingDetail = true;
    this.cancellationDetail = null;
    this.detailError = '';
    this.cdr.detectChanges();

    const targetBookingId = note.account?.bookingId;
    if (!targetBookingId) {
      this.loadingDetail = false;
      this.detailError = 'La cuenta asociada no contiene un identificador de reserva (bookingId).';
      this.cdr.detectChanges();
      return;
    }

    this.bookingService.getCancellationHistory().subscribe({
      next: (history: BookingCancellationDtoResponse[]) => {
        const found = history.find(c => c.bookingId === targetBookingId);
        if (found) {
          this.cancellationDetail = found;
        } else {
          this.detailError = `No se encontró un registro de cancelación vinculado a la reserva #${targetBookingId}.`;
        }
        this.loadingDetail = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener el historial de cancelaciones:', err);
        this.loadingDetail = false;
        this.detailError = 'Error de conexión al intentar obtener los detalles de la cancelación.';
        this.cdr.detectChanges();
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCreditNote = null;
    this.cancellationDetail = null;
    this.detailError = '';
    this.cdr.detectChanges();
  }
}