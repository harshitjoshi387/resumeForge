import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  form: FormGroup;
  saving = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private userSvc: UserService,
    private router: Router
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving) return;
    const { password, confirm } = this.form.value;
    if (password !== confirm) {
      this.error = 'Passwords do not match.';
      return;
    }
    this.saving = true;
    this.error = '';
    this.success = '';

    this.userSvc.updateMe({ password }).subscribe({
      next: () => {
        this.success = 'Password updated successfully.';
        this.saving = false;
        setTimeout(() => this.router.navigate(['/profile']), 1500);
      },
      error: err => {
        this.error = err?.error?.message || 'Failed to update password.';
        this.saving = false;
      }
    });
  }
}
