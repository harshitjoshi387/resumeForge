import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats } from '../../core/models';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  readonly loading = signal(true);
  readonly error = signal('');
  readonly stats = signal<DashboardStats | null>(null);
  readonly userName = signal('');

  readonly statCards = [
    { key: 'documents',    label: 'Documents',      icon: 'file-text'   },
    { key: 'applications', label: 'Applications',   icon: 'briefcase'   },
    { key: 'versions',     label: 'Saved versions', icon: 'layers'      },
    { key: 'exports',      label: 'Exports',        icon: 'upload'      },
  ];

  readonly statusColors: Record<string, string> = {
    Saved:     'var(--status-saved)',
    Applied:   'var(--status-applied)',
    Interview: 'var(--status-interview)',
    Offer:     'var(--status-offer)',
    Rejected:  'var(--status-rejected)',
  };

  constructor(
    private dashSvc: DashboardService,
    private auth: AuthService,
    private router: Router
  ) {
    // SSR: ngOnInit runs on server only — loadStats must run after browser hydration.
    afterNextRender(() => this.loadStats());
  }

  private loadStats(): void {
    this.userName.set(this.auth.currentUser?.name || '');
    this.loading.set(true);
    this.error.set('');
    this.dashSvc.getStats().pipe(
      timeout(15000),
      catchError(() => {
        this.error.set('Could not load dashboard. Make sure the backend is running on port 4000.');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe(data => {
      if (data) this.stats.set(data);
    });
  }

  statValue(key: string): number {
    const s = this.stats();
    if (!s) return 0;
    return (s as unknown as Record<string, number>)[key] ?? 0;
  }

  totalApps(): number {
    return this.stats()?.applicationPipeline?.reduce((s, p) => s + p.count, 0) || 1;
  }

  barWidth(count: number): string {
    return `${Math.round((count / this.totalApps()) * 100)}%`;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  goToDocument(id: number): void {
    this.router.navigate(['/documents', id]);
  }
}
