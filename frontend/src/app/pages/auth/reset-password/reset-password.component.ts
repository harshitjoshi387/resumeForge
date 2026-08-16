import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';
  success = '';
  token = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      password:  ['', [Validators.required, Validators.minLength(6)]],
      confirm:   ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) this.router.navigate(['/forgot-password']);
  }

  submit(): void {
    if (this.form.invalid || this.loading) return;
    const { password, confirm } = this.form.value;
    if (password !== confirm) {
      this.error = 'Passwords do not match.';
      return;
    }
    this.loading = true;
    this.error = '';

    this.auth.resetPassword(this.token, password).subscribe({
      next: () => {
        this.success = 'Password updated! Redirecting to sign in…';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: err => {
        this.error = err?.error?.message || 'Reset failed. The link may have expired.';
        this.loading = false;
      }
    });
  }
}
