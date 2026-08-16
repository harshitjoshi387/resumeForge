import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Document, Section, Item } from '../models';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly BASE = 'http://localhost:4000/api/documents';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Document[]> {
    return this.http.get<{ documents: Document[] }>(this.BASE).pipe(
      map(res => res.documents ?? [])
    );
  }

  getOne(id: number): Observable<Document> {
    return this.http.get<{ document: Document }>(`${this.BASE}/${id}`).pipe(
      map(res => this.normalizeDocument(res.document))
    );
  }

  create(data: { title: string; type: string; templateId?: number }): Observable<Document> {
    return this.http.post<{ document: Document }>(this.BASE, data).pipe(
      map(res => res.document)
    );
  }

  update(id: number, data: Partial<Document>): Observable<Document> {
    return this.http.put<{ document: Document }>(`${this.BASE}/${id}`, data).pipe(
      map(res => res.document)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }

  duplicate(id: number): Observable<Document> {
    return this.http.post<{ document: Document }>(`${this.BASE}/${id}/duplicate`, {}).pipe(
      map(res => res.document)
    );
  }

  share(id: number): Observable<{ slug: string }> {
    return this.http.post<{ share: { slug: string } }>(`${this.BASE}/${id}/share`, {}).pipe(
      map(res => ({ slug: res.share.slug }))
    );
  }

  unshare(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}/share`);
  }

  exportPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.BASE}/${id}/export/pdf`, { responseType: 'blob' });
  }

  createSection(docId: number, data: { heading: string; position?: number }): Observable<Section> {
    return this.http.post<{ section: Section }>(`${this.BASE}/${docId}/sections`, data).pipe(
      map(res => this.normalizeSection(res.section))
    );
  }

  updateSection(docId: number, sectionId: number, data: { heading?: string; position?: number }): Observable<Section> {
    return this.http.patch<{ section: Section }>(`${this.BASE}/${docId}/sections/${sectionId}`, data).pipe(
      map(res => this.normalizeSection(res.section))
    );
  }

  deleteSection(docId: number, sectionId: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${docId}/sections/${sectionId}`);
  }

  createItem(docId: number, sectionId: number, data: { content: string; position?: number }): Observable<Item> {
    return this.http.post<{ item: Item }>(`${this.BASE}/${docId}/sections/${sectionId}/items`, data).pipe(
      map(res => this.normalizeItem(res.item))
    );
  }

  updateItem(docId: number, sectionId: number, itemId: number, data: { content?: string; position?: number }): Observable<Item> {
    return this.http.patch<{ item: Item }>(`${this.BASE}/${docId}/sections/${sectionId}/items/${itemId}`, data).pipe(
      map(res => this.normalizeItem(res.item))
    );
  }

  deleteItem(docId: number, sectionId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${docId}/sections/${sectionId}/items/${itemId}`);
  }

  private normalizeDocument(doc: Document): Document {
    if (doc.sections) {
      doc.sections = doc.sections
        .map(s => this.normalizeSection(s))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return doc;
  }

  private normalizeSection(section: Section & { heading?: string; position?: number }): Section {
    return {
      ...section,
      title: section.title ?? section.heading ?? '',
      order: section.order ?? section.position ?? 0,
      items: (section.items ?? [])
        .map(i => this.normalizeItem(i as Item & { position?: number }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    };
  }

  private normalizeItem(item: Item & { position?: number }): Item {
    return {
      ...item,
      order: item.order ?? item.position ?? 0,
    };
  }
}
