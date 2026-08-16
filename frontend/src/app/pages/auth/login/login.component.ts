import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { finalize, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error = '';

  trialLoading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  startTrial(): void {
    if (this.loading || this.trialLoading) return;
    this.trialLoading = true;
    this.error = '';
    this.auth.loginTrial().pipe(
      timeout(15000),
      catchError(err => {
        this.error = err?.error?.message || 'Trial access unavailable. Start backend: cd backend && npm start';
        return of(null);
      }),
      finalize(() => { this.trialLoading = false; })
    ).subscribe(res => {
      if (res) this.router.navigate(['/dashboard']);
    });
  }

  submit(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.error = '';

    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.error = err?.error?.message || 'Login failed. Check your credentials.';
        this.loading = false;
      }
    });
  }
}
