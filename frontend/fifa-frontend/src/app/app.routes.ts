import { Routes, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Login } from './features/login/login';
import { PlayerList } from './features/player-list/player-list';
import { PlayerDetail } from './features/player-detail/player-detail';
import { PlayerForm } from './features/player-form/player-form';

const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/login');
};

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'players', component: PlayerList, canActivate: [authGuard] },
  { path: 'players/new', component: PlayerForm, canActivate: [authGuard] },
  { path: 'players/:id/edit', component: PlayerForm, canActivate: [authGuard] },
  { path: 'players/:id', component: PlayerDetail, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];