import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TemplateService } from '../../core/services/template.service';
import { DocumentService } from '../../core/services/document.service';
import { Template } from '../../core/models';
import { IconComponent } from '../../shared/icon/icon.component';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './templates.component.html',
  styleUrl: './templates.component.scss'
})
export class TemplatesComponent {
  readonly loading = signal(true);
  readonly error = signal('');
  readonly templates = signal<Template[]>([]);
  usingId: number | null = null;

  readonly accentColors = [
    '#00e5c3', '#1e90ff', '#ff6348', '#ffa502',
    '#c56cf0', '#2ed573', '#eccc68', '#ff4757'
  ];

  constructor(
    private templateSvc: TemplateService,
    private docSvc: DocumentService,
    private router: Router
  ) {
    afterNextRender(() => this.loadTemplates());
  }

  private loadTemplates(): void {
    this.loading.set(true);
    this.error.set('');
    this.templateSvc.getAll().pipe(
      timeout(15000),
      catchError(() => {
        this.error.set('Could not load templates. Is the backend running?');
        return of([] as Template[]);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe(ts => this.templates.set(ts));
  }

  accentFor(i: number): string {
    return this.accentColors[i % this.accentColors.length];
  }

  useTemplate(t: Template): void {
    if (this.usingId) return;
    this.usingId = t.id;
    this.docSvc.create({ title: `Untitled (${t.name})`, type: t.type || 'resume', templateId: t.id }).subscribe({
      next: doc => this.router.navigate(['/documents', doc.id]),
      error: () => { this.usingId = null; }
    });
  }

  previewLines(t: Template): string[] {
    const type = (t.type || '').toLowerCase();
    if (type === 'sidebar' || (t.name || '').toLowerCase().includes('sidebar')) {
      return ['sidebar'];
    }
    return ['simple'];
  }
}
