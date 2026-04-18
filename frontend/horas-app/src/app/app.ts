import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from './shared/icon.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly title = 'Registro de Horas';
  constructor(private router: Router) {}

  salir() {
    if (confirm('¿Cerrar sesión del sistema?')) {
      this.router.navigate(['/salir']);
    }
  }
}
