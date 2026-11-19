import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Player, PlayerService } from '../../core/services/player.service';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './player-detail.html',
  styleUrl: './player-detail.scss',
})
export class PlayerDetail implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly playerService = inject(PlayerService);

  @ViewChild('radarCanvas') radarCanvas?: ElementRef<HTMLCanvasElement>;

  player: Player | null = null;
  isLoading = true;
  errorMessage = '';

  private radarChart: Chart<'radar'> | null = null;
  private routeSub?: Subscription;
  private playerSub?: Subscription;
  private chartTimeoutId?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      this.resetState();

      const idParam = params.get('id');
      const id = Number(idParam);

      if (!id || Number.isNaN(id) || id <= 0) {
        this.isLoading = false;
        this.errorMessage = 'ID de jugador inválido.';
        return;
      }

      this.loadPlayer(id);
    });
  }

  private resetState(): void {
    this.playerSub?.unsubscribe();
    if (this.chartTimeoutId) {
      clearTimeout(this.chartTimeoutId);
      this.chartTimeoutId = undefined;
    }
    this.destroyChart();
    this.player = null;
    this.errorMessage = '';
    this.isLoading = true;
  }

  private loadPlayer(id: number): void {
    this.playerSub = this.playerService.getPlayerById(id).subscribe({
      next: (res) => {
        if (!res?.data) {
          this.player = null;
          this.isLoading = false;
          this.errorMessage = 'No se encontraron datos para este jugador.';
          return;
        }

        this.player = res.data;
        this.isLoading = false;
        this.chartTimeoutId = setTimeout(() => this.renderRadarChart(), 50);
      },
      error: (err) => {
        this.player = null;
        this.isLoading = false;
        this.errorMessage = err?.error?.error || 'No se pudo cargar el detalle del jugador.';
      },
    });
  }

  private renderRadarChart(): void {
    if (!this.player || !this.radarCanvas?.nativeElement) {
      return;
    }

    this.destroyChart();

    this.radarChart = new Chart(this.radarCanvas.nativeElement, {
      type: 'radar',
      data: {
        labels: ['Ritmo (PAC)', 'Tiro (SHO)', 'Pase (PAS)', 'Regate (DRI)', 'Defensa (DEF)', 'Físico (PHY)'],
        datasets: [
          {
            label: `${this.player.name} (${this.player.edition})`,
            data: [
              Number(this.player.pace) || 0,
              Number(this.player.shooting) || 0,
              Number(this.player.passing) || 0,
              Number(this.player.dribbling) || 0,
              Number(this.player.defending) || 0,
              Number(this.player.physical) || 0,
            ],
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.25)',
            borderColor: 'rgb(54, 162, 235)',
            pointBackgroundColor: 'rgb(54, 162, 235)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            min: 0,
            max: 99,
            ticks: {
              stepSize: 20,
            },
          },
        },
      },
    });
  }

  private destroyChart(): void {
    if (this.radarChart) {
      this.radarChart.destroy();
      this.radarChart = null;
    }
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.playerSub?.unsubscribe();
    if (this.chartTimeoutId) {
      clearTimeout(this.chartTimeoutId);
    }
    this.destroyChart();
  }
}