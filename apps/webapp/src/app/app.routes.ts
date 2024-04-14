import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component')
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/create/create.component')
  },
  {
    path: 'simulator/:id',
    loadComponent: () => import('./pages/simulator/simulator.component')
  },
  {
    path: '**',
    redirectTo: ''
  }
];
