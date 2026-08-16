import { Component, HostListener, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../core/services/application.service';
import { DocumentService } from '../../core/services/document.service';
import { Application, AppStatus, Document } from '../../core/models';
import { IconComponent } from '../../shared/icon/icon.component';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.scss'
})
export class ApplicationsComponent {
  readonly loading = signal(true);
  readonly error = signal('');
  readonly applications = signal<Application[]>([]);
  readonly documents = signal<Document[]>([]);
  viewMode: 'kanban' | 'list' = 'kanban';
  showModal = false;
  saving = false;
  formError = '';
  activeMenu: number | null = null;
  draggingId: number | null = null;

  form = { company: '', role: '', status: 'Saved' as AppStatus, documentId: '' };

  readonly columns: AppStatus[] = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];
  readonly statusColors: Record<string, string> = {
    Saved: 'var(--status-saved)',
    Applied: 'var(--status-applied)',
    Interview: 'var(--status-interview)',
    Offer: 'var(--status-offer)',
    Rejected: 'var(--status-rejected)',
  };

  constructor(
    private appSvc: ApplicationService,
    private docSvc: DocumentService
  ) {
    afterNextRender(() => {
      this.load();
      this.docSvc.getAll().pipe(timeout(15000), catchError(() => of([] as Document[])))
        .subscribe(d => this.documents.set(d));
    });
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.appSvc.getAll().pipe(
      timeout(15000),
      catchError(() => {
        this.error.set('Could not load applications. Is the backend running?');
        return of([] as Application[]);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe(apps => this.applications.set(apps));
  }

  appsIn(status: AppStatus): Application[] {
    return this.applications().filter(a => a.status === status);
  }

  countIn(status: AppStatus): number {
    return this.appsIn(status).length;
  }

  openModal(): void {
    this.form = { company: '', role: '', status: 'Saved', documentId: '' };
    this.formError = '';
    this.showModal = true;
  }

  create(): void {
    if (!this.form.company.trim() || !this.form.role.trim() || this.saving) return;
    this.saving = true;
    this.formError = '';

    const payload: any = {
      company: this.form.company.trim(),
      role: this.form.role.trim(),
      status: this.form.status,
    };
    if (this.form.documentId) payload.documentId = +this.form.documentId;

    this.appSvc.create(payload).subscribe({
      next: () => { this.showModal = false; this.saving = false; this.load(); },
      error: err => {
        this.formError = err?.error?.message || 'Failed to create application.';
        this.saving = false;
      }
    });
  }

  deleteApp(app: Application, e: Event): void {
    e.stopPropagation();
    this.activeMenu = null;
    if (!confirm(`Remove ${app.company}?`)) return;
    this.appSvc.delete(app.id).subscribe({ next: () => this.load() });
  }

  toggleMenu(id: number, e: Event): void {
    e.stopPropagation();
    this.activeMenu = this.activeMenu === id ? null : id;
  }

  @HostListener('document:click')
  closeMenu(): void { this.activeMenu = null; }

  onDragStart(app: Application): void {
    this.draggingId = app.id;
  }

  onDragEnd(): void {
    this.draggingId = null;
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
  }

  onDrop(status: AppStatus, e: DragEvent): void {
    e.preventDefault();
    const id = this.draggingId;
    if (!id) return;
    const apps = this.applications();
    const app = apps.find(a => a.id === id);
    if (!app || app.status === status) return;
    this.appSvc.updateStatus(id, status).subscribe({
      next: updated => {
        this.applications.set(
          apps.map(a => a.id === id ? { ...a, status: updated.status } : a)
        );
      }
    });
    this.draggingId = null;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
