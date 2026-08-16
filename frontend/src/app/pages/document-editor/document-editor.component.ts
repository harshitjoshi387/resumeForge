import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DocumentService } from '../../core/services/document.service';
import { Document, Section, Item } from '../../core/models';
import { IconComponent } from '../../shared/icon/icon.component';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-document-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  templateUrl: './document-editor.component.html',
  styleUrl: './document-editor.component.scss'
})
export class DocumentEditorComponent {
  readonly loading = signal(true);
  readonly error = signal('');
  docId = 0;
  document: Document | null = null;
  savingTitle = false;
  exporting = false;
  sharing = false;
  actionMsg = '';

  newSectionTitle = '';
  addingSection = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private docSvc: DocumentService
  ) {
    afterNextRender(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        this.router.navigate(['/documents']);
        return;
      }
      this.docId = +id;
      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.docSvc.getOne(this.docId).pipe(
      timeout(15000),
      catchError(() => {
        this.error.set('Document not found or you do not have access.');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe(doc => {
      if (doc) this.document = doc;
    });
  }

  saveTitle(): void {
    if (!this.document || this.savingTitle) return;
    this.savingTitle = true;
    this.docSvc.update(this.docId, { title: this.document.title }).subscribe({
      next: () => { this.savingTitle = false; this.flash('Title saved'); },
      error: () => { this.savingTitle = false; }
    });
  }

  addSection(): void {
    const heading = this.newSectionTitle.trim();
    if (!heading || this.addingSection) return;
    this.addingSection = true;
    this.docSvc.createSection(this.docId, { heading }).subscribe({
      next: () => {
        this.newSectionTitle = '';
        this.addingSection = false;
        this.load();
      },
      error: () => { this.addingSection = false; }
    });
  }

  updateSectionHeading(section: Section): void {
    this.docSvc.updateSection(this.docId, section.id, { heading: section.title }).subscribe();
  }

  deleteSection(section: Section): void {
    if (!confirm(`Delete section "${section.title}"?`)) return;
    this.docSvc.deleteSection(this.docId, section.id).subscribe({ next: () => this.load() });
  }

  addItem(section: Section): void {
    this.docSvc.createItem(this.docId, section.id, { content: 'New bullet point' }).subscribe({
      next: () => this.load()
    });
  }

  updateItem(section: Section, item: Item): void {
    this.docSvc.updateItem(this.docId, section.id, item.id, { content: item.content }).subscribe();
  }

  deleteItem(section: Section, item: Item): void {
    this.docSvc.deleteItem(this.docId, section.id, item.id).subscribe({ next: () => this.load() });
  }

  exportPdf(): void {
    if (this.exporting) return;
    this.exporting = true;
    this.docSvc.exportPdf(this.docId).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.document?.title || 'document'}.pdf`.replace(/[^a-zA-Z0-9._-]/g, '_');
        a.click();
        URL.revokeObjectURL(url);
        this.exporting = false;
        this.flash('PDF exported');
      },
      error: () => { this.exporting = false; }
    });
  }

  share(): void {
    if (this.sharing) return;
    this.sharing = true;
    this.docSvc.share(this.docId).subscribe({
      next: res => {
        const url = `${window.location.origin}/r/${res.slug}`;
        navigator.clipboard.writeText(url).then(() => this.flash(`Link copied: ${url}`));
        this.sharing = false;
      },
      error: () => { this.sharing = false; }
    });
  }

  private flash(msg: string): void {
    this.actionMsg = msg;
    setTimeout(() => this.actionMsg = '', 3000);
  }
}
