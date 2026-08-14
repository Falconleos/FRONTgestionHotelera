import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { RoomService } from '../../services/room-service';
import { RoomTypeService } from '../../services/room-type-service';
import { RoomTypeDTOResponse } from '../../models/room-type.model';
import { RoomDTORequest } from '../../models/room-request.model';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './room-form-component.html',
  styleUrls: ['./room-form-component.css']
})
export class RoomFormComponent implements OnInit {
  roomForm!: FormGroup;
  roomTypes: RoomTypeDTOResponse[] = [];
  loading = false;
  loadingTypes = true;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private roomTypeService: RoomTypeService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRoomTypes();

    // Capturar el roomTypeId enviado por query params desde la lista de tipos
    const typeIdParam = this.route.snapshot.queryParamMap.get('roomTypeId');
    if (typeIdParam) {
      this.roomForm.patchValue({ roomTypeId: Number(typeIdParam) });
    }
  }

  initForm(): void {
    this.roomForm = this.fb.group({
      number: ['', [Validators.required, Validators.min(1)]],
      roomTypeId: ['', [Validators.required]]
    });
  }

  loadRoomTypes(): void {
    this.loadingTypes = true;
    this.roomTypeService.getAll().subscribe({
      next: (data) => {
        this.roomTypes = Array.isArray(data) ? [...data] : [];
        this.loadingTypes = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'No se pudieron cargar los tipos de habitación.';
        this.loadingTypes = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const requestData: RoomDTORequest = this.roomForm.value;

    this.roomService.createRoom(requestData).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/rooms']);
      },
      error: (err) => {
        this.errorMessage = 'Error al crear la habitación. Verifica que el número no exista previamente.';
        this.loading = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }
}