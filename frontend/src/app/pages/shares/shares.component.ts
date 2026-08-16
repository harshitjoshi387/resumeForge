import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ShareService } from '../../core/services/share.service';
import { Share } from '../../core/models';
import { IconComponent } from '../../shared/icon/icon.component';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-shares',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './shares.component.html',
  styleUrl: './shares.component.scss'
})
export class SharesComponent {
  readonly loading = signal(true);
  readonly error = signal('');
  readonly shares = signal<Share[]>([]);
  copiedId: number | null = null;

  constructor(private shareSvc: ShareService) {
    afterNextRender(() => this.load());
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.shareSvc.getShares().pipe(
      timeout(15000),
      catchError(() => {
        this.error.set('Could not load shared links. Is the backend running?');
        return of([] as Share[]);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe(list => this.shares.set(list));
  }

  shareUrl(slug: string): string {
    return `${window.location.origin}/r/${slug}`;
  }

  copyLink(share: Share): void {
    navigator.clipboard.writeText(this.shareUrl(share.slug)).then(() => {
      this.copiedId = share.id;
      setTimeout(() => this.copiedId = null, 2000);
    });
  }

  openLink(slug: string): void {
    window.open(this.shareUrl(slug), '_blank');
  }

  printLink(slug: string): void {
    const w = window.open(this.shareUrl(slug), '_blank');
    w?.addEventListener('load', () => w.print());
  }

  revoke(share: Share): void {
    if (!confirm(`Revoke the link for "${share.document?.title || 'this document'}"?`)) return;
    this.shareSvc.revoke(share.documentId).subscribe({
      next: () => this.load(),
      error: () => {}
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
