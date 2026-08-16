import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { User } from '../models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly BASE = 'http://localhost:4000/api/users';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getMe(): Observable<User> {
    return this.http.get<{ user: User }>(`${this.BASE}/me`).pipe(
      map(res => res.user)
    );
  }

  updateMe(data: Partial<User & { password?: string; currentPassword?: string }>): Observable<User> {
    return this.http.put<{ user: User }>(`${this.BASE}/me`, data).pipe(
      map(res => res.user),
      tap(user => this.auth.updateCurrentUser(user))
    );
  }

  deleteMe(): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/me`);
  }
}
