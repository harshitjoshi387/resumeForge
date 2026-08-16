import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE = 'http://localhost:4000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): User | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  }

  get token(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('token');
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.BASE}/login`, { email, password }).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.BASE}/register`, { name, email, password }).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  forgotPassword(email: string): Observable<{ message: string; resetUrl?: string }> {
    return this.http.post<{ message: string; resetUrl?: string }>(`${this.BASE}/forget-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.BASE}/reset-password/${token}`, { password });
  }

  /** Temporary demo account — Trial Free */
  loginTrial(): Observable<AuthResponse> {
    return this.login('trial@resumeforge.com', 'trial123');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private handleAuth(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUserSubject.next(res.user);
  }
}
