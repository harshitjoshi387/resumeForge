import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/layout/layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Auth (no layout)
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password/:token',
    loadComponent: () => import('./pages/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
  },

  // Public shared document
  {
    path: 'r/:slug',
    loadComponent: () => import('./pages/public-view/public-view.component').then(m => m.PublicViewComponent),
  },

  // App shell (authenticated)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'documents',
        loadComponent: () => import('./pages/documents/documents.component').then(m => m.DocumentsComponent),
      },
      {
        path: 'documents/:id',
        loadComponent: () => import('./pages/document-editor/document-editor.component').then(m => m.DocumentEditorComponent),
      },
      {
        path: 'templates',
        loadComponent: () => import('./pages/templates/templates.component').then(m => m.TemplatesComponent),
      },
      {
        path: 'applications',
        loadComponent: () => import('./pages/applications/applications.component').then(m => m.ApplicationsComponent),
      },
      {
        path: 'shares',
        loadComponent: () => import('./pages/shares/shares.component').then(m => m.SharesComponent),
      },
      {
        path: 'exports',
        loadComponent: () => import('./pages/exports/exports.component').then(m => m.ExportsComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: 'change-password',
        loadComponent: () => import('./pages/change-password/change-password.component').then(m => m.ChangePasswordComponent),
      },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
