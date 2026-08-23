import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentService } from '../../services/comment-service';
import { CommentDtoRequest } from '../../models/comment.model';

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

  content: string = '';
  rating: number = 5;

  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commentService: CommentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.commentId = +idParam;
      this.loadCommentData(this.commentId);
    }
  }

  loadCommentData(id: number): void {
    this.loading = true;
    this.commentService.getAll().subscribe({
      next: (comments: any[]) => {
        const found = comments.find((c: any) => c.id === id);
        if (found) {
          this.content = found.content;
          this.rating = found.rating;
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

    const payload: CommentDtoRequest = { 
      content: this.content, 
      rating: this.rating 
    };

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