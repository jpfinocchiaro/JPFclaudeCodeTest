import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-salir',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <section class="page salir">
      <div class="card salir-card">
        <div class="salir-icon">
          <app-icon name="log-out" [size]="48"/>
        </div>
        <h2>Sesión cerrada</h2>
        <p class="muted">Gracias por usar Registro de Horas. Podés volver a ingresar cuando quieras.</p>
        <a routerLink="/proyectos" class="btn primary">
          <app-icon name="arrow-left"/> Volver al sistema
        </a>
      </div>
    </section>
  `,
  styles: [`
    .salir { display: flex; justify-content: center; padding-top: 3rem; }
    .salir-card { text-align: center; max-width: 420px; padding: 2.5rem 2rem; }
    .salir-icon { display: inline-flex; width: 88px; height: 88px; border-radius: 50%; background: var(--color-primary-soft); color: var(--color-primary); align-items: center; justify-content: center; margin-bottom: 1rem; }
    .salir h2 { margin: 0 0 0.5rem; font-size: 1.4rem; }
    .salir p { margin: 0 0 1.5rem; }
  `]
})
export class SalirComponent {}
