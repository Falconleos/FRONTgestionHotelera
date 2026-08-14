import { Routes } from '@angular/router';
import { LoginComponent } from './components/login-component/login-component';
import { DashboardComponent } from './components/dashboard-component/dashboard-component';
import { LandingPageComponent } from './components/landing-page-component/landing-page-component';
import { UserListComponent } from './components/user-list-component/user-list-component';
import { UserFormComponent } from './components/user-form-component/user-form-component';
import { RoomListComponent } from './components/room-list-component/room-list-component';
import { RoomTypeFormComponent } from './components/room-type-form-component/room-type-form-component';
import { EmployeeListComponent } from './components/employee-list-component/employee-list-component';
import { EmployeeFormComponent } from './components/employee-form-component/employee-form-component';
import { BookingListComponent } from './components/booking-list-component/booking-list-component';
import { AvailabilityComponent } from './components/availability-component/availability-component';
import { BookingFormComponent } from './components/booking-form-component/booking-form-component';
import { CheckInListComponent } from './components/check-in-list-component/check-in-list-component';
import { CheckInCreateComponent } from './components/check-in-create-component/check-in-create-component';
import { ItemListComponent } from './components/item-list-component/item-list-component';
import { ItemFormComponent } from './components/item-form-component/item-form-component';
import { CommentListComponent } from './components/comment-list-component/comment-list-component';
import { CommentFormComponent } from './components/comment-form-component/comment-form-component';
import { AccountListComponent } from './components/account-list-component/account-list-component';
import { PaymentListComponent } from './components/payment-list-component/payment-list-component';
import { RoomFormComponent } from './components/room-form-component/room-form-component';
import { RoomAttentionListComponent } from './components/room-attention-list-component/room-attention-list-component';
import { RoomAttentionFormComponent } from './components/room-attention-form-component/room-attention-form-component';
import { AccountDetailComponent } from './components/account-detail-component/account-detail-component';
import { GalleryComponent } from './components/gallery-component/gallery-component';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'galeria', component: GalleryComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: 'usuarios', component: UserListComponent },
      { path: 'usuarios/nuevo', component: UserFormComponent },
      { path: 'rooms', component: RoomListComponent },
      { path: 'rooms/nuevo', component: RoomFormComponent },
      { path: 'room-types/nuevo', component: RoomTypeFormComponent },
      { path: 'room-types/editar/:id', component: RoomTypeFormComponent },
      { path: 'employees', component: EmployeeListComponent },
      { path: 'employees/nuevo', component: EmployeeFormComponent },
      { path: 'bookings', component: BookingListComponent },
      { path: 'bookings/disponibilidad', component: AvailabilityComponent },
      { path: 'bookings/nuevo', component: BookingFormComponent },
      { path: 'check-ins', component: CheckInListComponent },
      { path: 'check-ins/nuevo', component: CheckInCreateComponent },
      { path: 'check-ins/:checkInId/servicios', component: RoomAttentionListComponent },
      { path: 'items', component: ItemListComponent },
      { path: 'items/nuevo', component: ItemFormComponent },      
      { path: 'items/editar/:id', component: ItemFormComponent }, 
      
      // --- Rutas de Comentarios ---
      { path: 'comments', component: CommentListComponent },
      { path: 'comments/nuevo', component: CommentFormComponent },
      { path: 'comments/nuevo/:checkInId', component: CommentFormComponent },
      { path: 'comments/editar/:id', component: CommentFormComponent },      
      
      { path: 'accounts', component: AccountListComponent },
      { path: 'payments', component: PaymentListComponent },
      { path: 'check-ins/:checkInId/cuenta', component: AccountDetailComponent },
      { path: 'check-ins/:checkInId/servicios/nuevo', component: RoomAttentionFormComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];