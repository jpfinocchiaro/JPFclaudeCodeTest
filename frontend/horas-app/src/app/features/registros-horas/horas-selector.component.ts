import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProyectosService } from '../../core/services/proyectos.service';
import { Proyecto } from '../../models/proyecto.model';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-horas-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <section class="page">
      <header class="page-header">
        <h2>Cargar horas</h2>
      </header>

      @if (proyectos().length === 0) {
        <div class="card">
          <p>No hay proyectos cargados. Creá uno primero desde <a routerLink="/proyectos">Proyectos</a>.</p>
        </div>
      } @else {
        <div class="card form">
          <label>
            Elegí un proyecto para cargar horas
            <select [(ngModel)]="seleccionado">
              <option [ngValue]="0">-- seleccionar --</option>
              @for (p of proyectos(); track p.id) {
                <option [ngValue]="p.id">{{ p.codigo }} — {{ p.descripcion }} ({{ p.clienteNombre }})</option>
              }
            </select>
          </label>
          <div class="actions">
            <button class="btn primary" [disabled]="!seleccionado" (click)="ir()"><app-icon name="clock"/> Cargar horas</button>
          </div>
        </div>

        <h3>O elegí desde la lista</h3>
        <div class="toolbar">
          <div class="search">
            <input type="text" placeholder="Buscar por código, descripción o cliente..." [ngModel]="filtro()" (ngModelChange)="filtro.set($event)" />
          </div>
          <span class="count">{{ filtrados().length }} de {{ proyectos().length }}</span>
        </div>
        <table class="data">
          <thead>
            <tr><th>Código</th><th>Descripción</th><th>Cliente</th><th class="actions-col">Acción</th></tr>
          </thead>
          <tbody>
            @for (p of filtrados(); track p.id) {
              <tr>
                <td>{{ p.codigo }}</td>
                <td>{{ p.descripcion }}</td>
                <td>{{ p.clienteNombre }}</td>
                <td class="actions-col">
                  <a class="btn sm primary" [routerLink]="['/proyectos', p.id, 'horas']"><app-icon name="clock"/> Cargar horas</a>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="empty">Sin resultados</td></tr>
            }
          </tbody>
        </table>
      }
    </section>
  `
})
export class HorasSelectorComponent implements OnInit {
  private proyectos_ = inject(ProyectosService);
  private router = inject(Router);

  proyectos = signal<Proyecto[]>([]);
  filtro = signal('');
  filtrados = computed(() => {
    const q = this.filtro().trim().toLowerCase();
    if (!q) return this.proyectos();
    return this.proyectos().filter(p =>
      p.codigo.toLowerCase().includes(q) ||
      p.descripcion.toLowerCase().includes(q) ||
      p.clienteNombre.toLowerCase().includes(q)
    );
  });
  seleccionado = 0;

  ngOnInit() {
    this.proyectos_.list().subscribe(ps => this.proyectos.set(ps));
  }

  ir() {
    if (this.seleccionado) {
      this.router.navigate(['/proyectos', this.seleccionado, 'horas']);
    }
  }
}
