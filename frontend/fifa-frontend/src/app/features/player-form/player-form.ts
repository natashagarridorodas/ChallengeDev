import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Player, PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'app-player-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './player-form.html',
  styleUrl: './player-form.scss',
})
export class PlayerForm implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly playerService = inject(PlayerService);

  playerId: number | null = null;
  isEditMode = false;
  isSubmitting = false;
  errorMessage = '';

  private readonly skillValidators = [
    Validators.required,
    Validators.min(0),
    Validators.max(99),
  ];

  playerForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    club: new FormControl('', {
      nonNullable: true,
    }),
    position: new FormControl('', {
      nonNullable: true,
    }),
    gender: new FormControl<'male' | 'female'>('male', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    edition: new FormControl<number>(2023, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(2015), Validators.max(2023)],
    }),
    pace: new FormControl<number>(50, {
      nonNullable: true,
      validators: this.skillValidators,
    }),
    shooting: new FormControl<number>(50, {
      nonNullable: true,
      validators: this.skillValidators,
    }),
    passing: new FormControl<number>(50, {
      nonNullable: true,
      validators: this.skillValidators,
    }),
    dribbling: new FormControl<number>(50, {
      nonNullable: true,
      validators: this.skillValidators,
    }),
    defending: new FormControl<number>(50, {
      nonNullable: true,
      validators: this.skillValidators,
    }),
    physical: new FormControl<number>(50, {
      nonNullable: true,
      validators: this.skillValidators,
    }),
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const parsedId = Number(idParam);
      if (!parsedId || Number.isNaN(parsedId)) {
        this.errorMessage = 'ID de jugador inválido.';
        return;
      }

      this.playerId = parsedId;
      this.isEditMode = true;
      this.loadPlayer(parsedId);
    }
  }

  private loadPlayer(id: number): void {
    this.playerService.getPlayerById(id).subscribe({
      next: (res) => {
        const p = res.data;
        this.playerForm.patchValue({
          name: p.name,
          club: p.club ?? '',
          position: p.position ?? '',
          gender: p.gender,
          edition: p.edition,
          pace: p.pace,
          shooting: p.shooting,
          passing: p.passing,
          dribbling: p.dribbling,
          defending: p.defending,
          physical: p.physical,
        });
      },
      error: (err) => {
        this.errorMessage = err?.error?.error || 'No se pudieron cargar los datos del jugador.';
      },
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.playerForm.invalid) {
      this.playerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const raw = this.playerForm.getRawValue();

    const payload: Player = {
      name: raw.name.trim(),
      club: raw.club.trim() ? raw.club.trim() : null,
      position: raw.position.trim() ? raw.position.trim() : null,
      gender: raw.gender,
      edition: Number(raw.edition),
      pace: Number(raw.pace),
      shooting: Number(raw.shooting),
      passing: Number(raw.passing),
      dribbling: Number(raw.dribbling),
      defending: Number(raw.defending),
      physical: Number(raw.physical),
    };

    const request$ = this.isEditMode && this.playerId
      ? this.playerService.updatePlayer(this.playerId, payload)
      : this.playerService.createPlayer(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/players']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.error || 'No se pudo guardar el jugador.';
      },
    });
  }
}