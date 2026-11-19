import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Player {
  id?: number;
  name: string;
  club?: string | null;
  position?: string | null;
  gender: 'male' | 'female';
  edition: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface PlayerFilters {
  name?: string;
  club?: string;
  position?: string;
  page?: number;
  limit?: number;
}

export interface PlayersListResponse {
  data: Player[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:3000/api/players';

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  private buildFilterParams(filters: PlayerFilters, includePagination = true): HttpParams {
    let params = new HttpParams();
    if (filters.name?.trim()) {
      params = params.set('name', filters.name.trim());
    }
    if (filters.club?.trim()) {
      params = params.set('club', filters.club.trim());
    }
    if (filters.position?.trim()) {
      params = params.set('position', filters.position.trim());
    }
    if (includePagination) {
      params = params.set('page', String(filters.page ?? 1));
      params = params.set('limit', String(filters.limit ?? 10));
    }
    return params;
  }

  getPlayers(filters: PlayerFilters = {}): Observable<PlayersListResponse> {
    return this.http.get<PlayersListResponse>(this.apiUrl, {
      headers: this.getAuthHeaders(),
      params: this.buildFilterParams(filters, true),
    });
  }

  getPlayerById(id: number): Observable<{ data: Player }> {
    return this.http.get<{ data: Player }>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  createPlayer(player: Player): Observable<{ message: string; data: Player }> {
    return this.http.post<{ message: string; data: Player }>(this.apiUrl, player, {
      headers: this.getAuthHeaders(),
    });
  }

  updatePlayer(id: number, player: Player): Observable<{ message: string; data: Player }> {
    return this.http.put<{ message: string; data: Player }>(`${this.apiUrl}/${id}`, player, {
      headers: this.getAuthHeaders(),
    });
  }

  exportCsv(filters: PlayerFilters = {}): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      headers: this.getAuthHeaders(),
      params: this.buildFilterParams(filters, false),
      responseType: 'blob',
    });
  }
}