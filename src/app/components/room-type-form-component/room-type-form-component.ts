import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { RoomTypeService } from '../../services/room-type-service';
import { RoomTypeDTORequest } from '../../models/room-type.model';

@Component({
  selector: 'app-room-type-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './room-type-form-component.html',
  styleUrls: ['./room-type-form-component.css']
})
export class RoomTypeFormComponent implements OnInit {
  roomTypeForm!: FormGroup;
  isEditMode = false;
  roomTypeId: number | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private roomTypeService: RoomTypeService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.roomTypeId = Number(idParam);
      this.loadRoomTypeData(this.roomTypeId);
    }
  }

  initForm(): void {
    this.roomTypeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      capacity: ['', [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required, Validators.maxLength(250)]],
      pricePerNight: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  loadRoomTypeData(id: number): void {
    this.loading = true;
    this.roomTypeService.getById(id).subscribe({
      next: (data) => {
        this.roomTypeForm.patchValue({
          name: data.name,
          capacity: data.capacity,
          description: data.description,
          pricePerNight: data.pricePerNight
        });
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'No se pudo cargar la información del tipo de habitación.';
        this.loading = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.roomTypeForm.invalid) {
      this.roomTypeForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const requestData: RoomTypeDTORequest = this.roomTypeForm.value;

    if (this.isEditMode && this.roomTypeId) {
      this.roomTypeService.updateRoomType(this.roomTypeId, requestData).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/rooms']);
        },
        error: (err) => {
          this.errorMessage = 'Error al actualizar el tipo de habitación.';
          this.loading = false;
          this.cdr.markForCheck();
          console.error(err);
        }
      });
    } else {
      this.roomTypeService.createRoomType(requestData).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/rooms']);
        },
        error: (err) => {
          this.errorMessage = 'Error al crear el tipo de habitación. Verifica que el nombre no exista previamente.';
          this.loading = false;
          this.cdr.markForCheck();
          console.error(err);
        }
      });
    }
  }
}