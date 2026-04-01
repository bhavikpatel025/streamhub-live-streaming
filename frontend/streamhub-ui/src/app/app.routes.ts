import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { StreamListComponent } from './features/streams/stream-list/stream-list.component';
import { StreamViewComponent } from './features/streams/stream-view/stream-view.component';
import { StreamerDashboardComponent } from './features/streams/streamer-dashboard/streamer-dashboard.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/streams', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'streams', component: StreamListComponent },
  { path: 'watch/:id', component: StreamViewComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: StreamerDashboardComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/streams' }
];