import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
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

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!id || Number.isNaN(id)) {
      this.isLoading = false;
      this.errorMessage = 'ID de jugador inválido.';
      return;
    }

    this.playerService.getPlayerById(id).subscribe({
      next: (res) => {
        this.player = res.data;
        this.isLoading = false;
        setTimeout(() => this.renderRadarChart(), 0);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.error || 'No se pudo cargar el detalle del jugador.';
      },
    });
  }

  private renderRadarChart(): void {
    if (!this.player || !this.radarCanvas?.nativeElement) {
      return;
    }

    if (this.radarChart) {
      this.radarChart.destroy();
    }

    this.radarChart = new Chart(this.radarCanvas.nativeElement, {
      type: 'radar',
      data: {
        labels: ['Ritmo (PAC)', 'Tiro (SHO)', 'Pase (PAS)', 'Regate (DRI)', 'Defensa (DEF)', 'Físico (PHY)'],
        datasets: [
          {
            label: `${this.player.name} (${this.player.edition})`,
            data: [
              this.player.pace,
              this.player.shooting,
              this.player.passing,
              this.player.dribbling,
              this.player.defending,
              this.player.physical,
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

  ngOnDestroy(): void {
    if (this.radarChart) {
      this.radarChart.destroy();
    }
  }
}