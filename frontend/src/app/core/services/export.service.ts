import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface ExportRecord {
  id: number;
  format: string;
  fileUrl: string;
  documentId: number;
  userId: number;
  createdAt: string;
  document?: { id: number; title: string; type?: string };
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly BASE = 'http://localhost:4000/api/exports';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ExportRecord[]> {
    return this.http.get<{ exports: ExportRecord[] }>(this.BASE).pipe(
      map(res => res.exports ?? [])
    );
  }
}
