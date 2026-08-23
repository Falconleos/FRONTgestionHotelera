import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreditNoteDtoResponse } from '../models/credit-note.model'; // Ajusta la ruta según tu estructura de carpetas

@Injectable({
  providedIn: 'root'
})
export class CreditNoteService {
  // En tu credit-note.service.ts
private apiUrl = 'http://localhost:8080/private/credit-notes'; // Asegúrate de que tenga /private/

  constructor(private http: HttpClient) {}

  getAllCreditNotes(): Observable<CreditNoteDtoResponse[]> {
    return this.http.get<CreditNoteDtoResponse[]>(this.apiUrl, { withCredentials: true });
  }
}