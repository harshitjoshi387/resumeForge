import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Application, AppStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly BASE = 'http://localhost:4000/api/applications';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Application[]> {
    return this.http.get<{ applications: Application[] }>(this.BASE).pipe(
      map(res => res.applications ?? [])
    );
  }

  getOne(id: number): Observable<Application> {
    return this.http.get<{ application: Application }>(`${this.BASE}/${id}`).pipe(
      map(res => res.application)
    );
  }

  create(data: { company: string; role: string; status: AppStatus; documentId?: number }): Observable<Application> {
    return this.http.post<{ application: Application }>(this.BASE, data).pipe(
      map(res => res.application)
    );
  }

  update(id: number, data: Partial<Application>): Observable<Application> {
    return this.http.put<{ application: Application }>(`${this.BASE}/${id}`, data).pipe(
      map(res => res.application)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }

  updateStatus(id: number, status: AppStatus): Observable<Application> {
    return this.update(id, { status });
  }
}
