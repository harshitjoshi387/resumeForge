import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  form!: FormGroup;
  readonly loading = signal(true);
  saving = false;
  readonly error = signal('');
  readonly success = signal('');

  constructor(
    private fb: FormBuilder,
    private userSvc: UserService,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    afterNextRender(() => this.loadProfile());
  }

  private loadProfile(): void {
    const user = this.auth.currentUser;
    if (user) {
      this.form.patchValue({ name: user.name, email: user.email });
      this.loading.set(false);
      return;
    }

    this.userSvc.getMe().subscribe({
      next: u => {
        this.form.patchValue({ name: u.name, email: u.email });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load profile.');
        this.loading.set(false);
      }
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    this.error.set('');
    this.success.set('');

    this.userSvc.updateMe(this.form.value).subscribe({
      next: () => {
        this.success.set('Profile updated successfully.');
        this.saving = false;
      },
      error: err => {
        this.error.set(err?.error?.message || 'Failed to update profile.');
        this.saving = false;
      }
    });
  }
}
