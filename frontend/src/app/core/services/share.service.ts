import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Share } from '../models';

@Injectable({ providedIn: 'root' })
export class ShareService {
  private readonly BASE = 'http://localhost:4000/api';

  constructor(private http: HttpClient) {}

  getShares(): Observable<Share[]> {
    return this.http.get<{ shares: Share[] }>(`${this.BASE}/shares`).pipe(
      map(res => res.shares ?? [])
    );
  }

  getPublic(slug: string): Observable<{ document: any }> {
    return this.http.get<{ document: any }>(`${this.BASE}/shares/${slug}`);
  }

  revoke(documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/documents/${documentId}/share`);
  }
}
