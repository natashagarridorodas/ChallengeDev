import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthResponse {
  message: string;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/auth';
  private readonly tokenKey = 'fifa_jwt_token';

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => {
        if (res.token) {
          localStorage.setItem(this.tokenKey, res.token);
        }
      })
    );
  }

  register(email: string, password: string): Observable<{ message: string; userId: number }> {
    return this.http.post<{ message: string; userId: number }>(`${this.apiUrl}/register`, {
      email,
      password,
    });
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }
}