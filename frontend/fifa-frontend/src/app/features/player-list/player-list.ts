import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Player, PlayerService } from '../../core/services/player.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './player-list.html',
  styleUrl: './player-list.scss',
})
export class PlayerList implements OnInit {
  private readonly playerService = inject(PlayerService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  players: Player[] = [];
  isLoading = false;
  errorMessage = '';

  currentPage = 1;
  limit = 10;
  totalItems = 0;
  totalPages = 1;

  filterForm = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    club: new FormControl('', { nonNullable: true }),
    position: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.loadPlayers();
  }

  private getCurrentFilters() {
    const { name, club, position } = this.filterForm.getRawValue();
    return {
      name,
      club,
      position,
      page: this.currentPage,
      limit: this.limit,
    };
  }

  loadPlayers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.playerService.getPlayers(this.getCurrentFilters()).subscribe({
      next: (res) => {
        this.players = res.data;
        this.currentPage = res.pagination.currentPage;
        this.totalItems = res.pagination.totalItems;
        this.totalPages = Math.max(res.pagination.totalPages, 1);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.error || 'Error al cargar los jugadores.';
      },
    });
  }

  onFilter(): void {
    this.currentPage = 1;
    this.loadPlayers();
  }

  onClearFilters(): void {
    this.filterForm.reset({ name: '', club: '', position: '' });
    this.currentPage = 1;
    this.loadPlayers();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.loadPlayers();
  }

  onExportCsv(): void {
    this.errorMessage = '';
    this.playerService.exportCsv(this.getCurrentFilters()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'players.csv';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.errorMessage = 'No se pudo exportar el listado a CSV.';
      },
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}