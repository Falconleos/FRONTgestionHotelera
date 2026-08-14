import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentService } from '../../services/comment-service';
import { CheckInService } from '../../services/check-in-service';
import { CheckInDtoResponse } from '../../models/check-in.model';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-form-component.html',
  styleUrls: ['./comment-form-component.css']
})
export class CommentFormComponent implements OnInit {
  isEditMode = false;
  commentId?: number;
  checkInId?: number;

  content: string = '';
  rating: number = 5;
  selectedCheckInId: number | null = null;

  availableCheckIns: CheckInDtoResponse[] = [];
  isGuest = false;
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commentService: CommentService,
    private checkInService: CheckInService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkUserRole();

    const checkInParam = this.route.snapshot.paramMap.get('checkInId');
    if (checkInParam) {
      this.checkInId = +checkInParam;
      this.selectedCheckInId = this.checkInId;
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.commentId = +idParam;
      this.loadCommentData(this.commentId);
    } else if (this.isGuest) {
      this.loadGuestCheckIns();
    } else {
      this.loadAllCheckIns();
    }
  }

  checkUserRole(): void {
    const storedRoles = localStorage.getItem('role') || '';
    this.isGuest = storedRoles.includes('GUEST') && !storedRoles.includes('ADMIN') && !storedRoles.includes('RECEPCIONIST');
  }

  loadGuestCheckIns(): void {
    this.loading = true;
    this.checkInService.getMyCheckIns().subscribe({
      next: (data: CheckInDtoResponse[]) => {
        this.availableCheckIns = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar tus estadías.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadAllCheckIns(): void {
    this.loading = true;
    this.checkInService.getAll().subscribe({
      next: (data: CheckInDtoResponse[]) => {
        this.availableCheckIns = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las estadías.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadCommentData(id: number): void {
    this.loading = true;
    this.commentService.getAll().subscribe({
      next: (comments: any[]) => {
        const found = comments.find((c: any) => c.id === id);
        if (found) {
          this.content = found.content;
          this.rating = found.rating;
          this.selectedCheckInId = found.checkInId;
        } else {
          this.errorMessage = 'Comentario no encontrado.';
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el comentario.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  saveComment(): void {
    if (!this.content.trim()) return;

    const targetCheckInId = this.checkInId || this.selectedCheckInId;
    if (!targetCheckInId) {
      alert('Debe seleccionar una estadía.');
      return;
    }

    const payload = { content: this.content, rating: this.rating, checkInId: targetCheckInId };

    if (this.isEditMode && this.commentId) {
      this.commentService.update(this.commentId, payload).subscribe({
        next: () => this.router.navigate(['/dashboard/comments']),
        error: () => alert('Error al actualizar el comentario.')
      });
    } else {
      this.commentService.create(payload).subscribe({
        next: () => this.router.navigate(['/dashboard/comments']),
        error: () => alert('Error al crear el comentario.')
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/comments']);
  }
}