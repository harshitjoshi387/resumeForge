import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Template } from '../models';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private readonly BASE = 'http://localhost:4000/api/templates';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Template[]> {
    return this.http.get<{ templates: Template[] }>(this.BASE).pipe(
      map(res => res.templates ?? [])
    );
  }

  getOne(id: number): Observable<Template> {
    return this.http.get<{ template: Template }>(`${this.BASE}/${id}`).pipe(
      map(res => res.template)
    );
  }
}
