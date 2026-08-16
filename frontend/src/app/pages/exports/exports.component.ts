import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExportService, ExportRecord } from '../../core/services/export.service';
import { DocumentService } from '../../core/services/document.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-exports',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './exports.component.html',
  styleUrl: './exports.component.scss'
})
export class ExportsComponent {
  readonly loading = signal(true);
  readonly error = signal('');
  readonly exports = signal<ExportRecord[]>([]);
  downloadingId: number | null = null;

  constructor(
    private exportSvc: ExportService,
    private docSvc: DocumentService
  ) {
    afterNextRender(() => this.loadExports());
  }

  private loadExports(): void {
    this.loading.set(true);
    this.error.set('');
    this.exportSvc.getAll().pipe(
      timeout(15000),
      catchError(() => {
        this.error.set('Could not load exports. Is the backend running?');
        return of([] as ExportRecord[]);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe(list => this.exports.set(list));
  }

  reDownload(record: ExportRecord): void {
    if (this.downloadingId) return;
    this.downloadingId = record.id;
    this.docSvc.exportPdf(record.documentId).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = record.fileUrl || `${record.document?.title || 'document'}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.downloadingId = null;
      },
      error: () => { this.downloadingId = null; }
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
