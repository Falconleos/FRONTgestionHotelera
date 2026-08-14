import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CommentService } from '../../services/comment-service';
import { CommentDtoResponse } from '../../models/comment.model';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './comment-list-component.html',
  styleUrls: ['./comment-list-component.css']
})
export class CommentListComponent implements OnInit {
  comments: CommentDtoResponse[] = [];
  loading = true;
  errorMessage = '';
  isAdminOrRecepcionist = false;
  isGuest = false;

  constructor(
    private commentService: CommentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkUserRoles();
    this.loadComments();
  }

  checkUserRoles(): void {
    const storedRoles = localStorage.getItem('role') || '';
    this.isAdminOrRecepcionist = storedRoles.includes('ADMIN') || storedRoles.includes('RECEPCIONIST');
    this.isGuest = storedRoles.includes('GUEST');
  }

  loadComments(): void {
    this.loading = true;
    this.errorMessage = '';

    if (this.isGuest && !this.isAdminOrRecepcionist) {
      this.commentService.getMyComments().subscribe({
        next: (data: CommentDtoResponse[]) => {
          this.comments = Array.isArray(data) ? [...data] : [];
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.errorMessage = 'No se pudieron cargar tus comentarios.';
          this.loading = false;
          this.cdr.markForCheck();
          console.error(err);
        }
      });
      return;
    }

    this.commentService.getAll().subscribe({
      next: (data: CommentDtoResponse[]) => {
        this.comments = Array.isArray(data) ? [...data] : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.errorMessage = 'No se pudieron cargar los comentarios del sistema.';
        this.loading = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }

  onNewCommentClick(): void {
    this.router.navigate(['/dashboard/comments/nuevo']);
  }

  deleteComment(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
      this.commentService.deleteComment(id).subscribe({
        next: () => {
          this.comments = this.comments.filter(comment => comment.id !== id);
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          alert('Error al eliminar el comentario.');
          console.error(err);
        }
      });
    }
  }
}