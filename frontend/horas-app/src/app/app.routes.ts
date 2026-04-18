import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'proyectos' },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./features/clientes/clientes-list.component').then(m => m.ClientesListComponent)
  },
  {
    path: 'proyectos',
    loadComponent: () =>
      import('./features/proyectos/proyectos-list.component').then(m => m.ProyectosListComponent)
  },
  {
    path: 'horas',
    loadComponent: () =>
      import('./features/registros-horas/horas-selector.component').then(m => m.HorasSelectorComponent)
  },
  {
    path: 'proyectos/:id/horas',
    loadComponent: () =>
      import('./features/registros-horas/registros-horas.component').then(m => m.RegistrosHorasComponent)
  },
  {
    path: 'salir',
    loadComponent: () =>
      import('./features/salir/salir.component').then(m => m.SalirComponent)
  },
  { path: '**', redirectTo: 'proyectos' }
];
