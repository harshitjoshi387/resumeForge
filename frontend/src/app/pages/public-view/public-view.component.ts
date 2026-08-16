import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ShareService } from '../../core/services/share.service';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-public-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-view.component.html',
  styleUrl: './public-view.component.scss'
})
export class PublicViewComponent {
  readonly loading = signal(true);
  readonly error = signal('');
  document: any = null;

  constructor(private route: ActivatedRoute, private shareSvc: ShareService) {
    afterNextRender(() => this.loadDocument());
  }

  private loadDocument(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.error.set('Invalid link.');
      this.loading.set(false);
      return;
    }

    this.shareSvc.getPublic(slug).subscribe({
      next: res => {
        this.document = this.normalize(res.document);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('This shared link is invalid or has been revoked.');
        this.loading.set(false);
      }
    });
  }

  private normalize(doc: any): any {
    if (doc?.sections) {
      doc.sections = doc.sections
        .map((s: any) => ({
          ...s,
          heading: s.heading || s.title,
          items: (s.items || []).sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
        }))
        .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));
    }
    return doc;
  }
}
