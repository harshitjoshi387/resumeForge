import { Component, OnInit, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../icon/icon.component';
import { User } from '../../core/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  dropdownOpen = false;

  readonly navLinks = [
    { path: '/dashboard',    label: 'Dashboard',    icon: 'layout-dashboard' },
    { path: '/documents',    label: 'Documents',    icon: 'file-text' },
    { path: '/templates',    label: 'Templates',    icon: 'layout-template' },
    { path: '/applications', label: 'Applications', icon: 'briefcase' },
    { path: '/shares',       label: 'Shared links', icon: 'link' },
    { path: '/exports',      label: 'Exports',      icon: 'download' },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(u => this.currentUser = u);
  }

  get initials(): string {
    if (!this.currentUser?.name) return '?';
    return this.currentUser.name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  goProfile(): void {
    this.dropdownOpen = false;
    this.router.navigate(['/profile']);
  }

  goChangePassword(): void {
    this.dropdownOpen = false;
    this.router.navigate(['/change-password']);
  }

  signOut(): void {
    this.dropdownOpen = false;
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.nav-avatar-wrap')) {
      this.dropdownOpen = false;
    }
  }
}
