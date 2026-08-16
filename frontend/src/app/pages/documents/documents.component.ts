import { Component, HostListener, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../core/services/document.service';
import { Document } from '../../core/models';
import { IconComponent } from '../../shared/icon/icon.component';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss'
})
export class DocumentsComponent {
  readonly loading = signal(true);
  readonly error = signal('');
  readonly documents = signal<Document[]>([]);
  search = '';
  typeFilter = '';
  activeMenu: number | null = null;
  showCreateModal = false;
  creating = false;
  createError = '';
  newTitle = '';
  newType = 'resume';

  readonly types = ['resume', 'cover-letter', 'cv'];

  constructor(private docSvc: DocumentService, private router: Router) {
    afterNextRender(() => this.load());
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.docSvc.getAll().pipe(
      timeout(15000),
      catchError(() => {
        this.error.set('Could not load documents. Is the backend running?');
        return of([] as Document[]);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe(docs => this.documents.set(docs));
  }

  get filtered(): Document[] {
    let list = this.documents();
    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      list = list.filter(d => d.title.toLowerCase().includes(q));
    }
    if (this.typeFilter) {
      list = list.filter(d => d.type === this.typeFilter);
    }
    return list;
  }

  toggleMenu(id: number, e: Event): void {
    e.stopPropagation();
    this.activeMenu = this.activeMenu === id ? null : id;
  }

  @HostListener('document:click')
  closeMenu(): void { this.activeMenu = null; }

  openEditor(id: number): void {
    this.router.navigate(['/documents', id]);
  }

  duplicate(doc: Document, e: Event): void {
    e.stopPropagation();
    this.activeMenu = null;
    this.docSvc.duplicate(doc.id).subscribe({
      next: () => this.load(),
      error: () => {}
    });
  }

  delete(doc: Document, e: Event): void {
    e.stopPropagation();
    this.activeMenu = null;
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    this.docSvc.delete(doc.id).subscribe({
      next: () => this.load(),
      error: () => {}
    });
  }

  shareDoc(doc: Document, e: Event): void {
    e.stopPropagation();
    this.activeMenu = null;
    this.docSvc.share(doc.id).subscribe({
      next: res => {
        const url = `${window.location.origin}/r/${res.slug}`;
        navigator.clipboard.writeText(url).then(() => alert(`Link copied: ${url}`));
      },
      error: () => {}
    });
  }

  createDocument(): void {
    if (!this.newTitle.trim() || this.creating) return;
    this.creating = true;
    this.createError = '';
    this.docSvc.create({ title: this.newTitle.trim(), type: this.newType }).subscribe({
      next: doc => {
        this.showCreateModal = false;
        this.newTitle = '';
        this.router.navigate(['/documents', doc.id]);
      },
      error: err => {
        this.createError = err?.error?.message || 'Failed to create document.';
        this.creating = false;
      }
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
