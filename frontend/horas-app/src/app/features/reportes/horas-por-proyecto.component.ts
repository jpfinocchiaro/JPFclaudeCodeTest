import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ClientesService } from '../../core/services/clientes.service';
import { ProyectosService } from '../../core/services/proyectos.service';
import { ReportesService } from '../../core/services/reportes.service';
import { Cliente } from '../../models/cliente.model';
import { Proyecto } from '../../models/proyecto.model';
import { ReporteHorasFiltro, ReporteHorasResponse } from '../../models/reporte-horas.model';
import { IconComponent } from '../../shared/icon.component';

type Vista = 'resumen' | 'detalle';

@Component({
  selector: 'app-horas-por-proyecto',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './horas-por-proyecto.component.html',
  styleUrl: './horas-por-proyecto.component.css'
})
export class HorasPorProyectoComponent implements OnInit {
  private clientes_ = inject(ClientesService);
  private proyectos_ = inject(ProyectosService);
  private reportes_ = inject(ReportesService);

  clientes = signal<Cliente[]>([]);
  proyectos = signal<Proyecto[]>([]);

  desde = signal<string>('');
  hasta = signal<string>('');
  clienteId = signal<number | null>(null);
  proyectoId = signal<number | null>(null);

  mesSeleccionado = signal<string>('');

  proyectosFiltrados = computed(() => {
    const cid = this.clienteId();
    if (!cid) return this.proyectos();
    return this.proyectos().filter(p => p.clienteId === cid);
  });

  reporte = signal<ReporteHorasResponse | null>(null);
  vista = signal<Vista>('resumen');
  cargando = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.setMesActual();
    forkJoin({
      clientes: this.clientes_.list(),
      proyectos: this.proyectos_.list()
    }).subscribe(({ clientes, proyectos }) => {
      this.clientes.set(clientes);
      this.proyectos.set(proyectos);
    });
  }

  setMesActual() {
    const hoy = new Date();
    const ym = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
    this.aplicarMes(ym);
  }

  aplicarMes(ym: string) {
    if (!ym) return;
    const [y, m] = ym.split('-').map(Number);
    const primer = new Date(y, m - 1, 1);
    const ultimo = new Date(y, m, 0);
    this.desde.set(this.fmt(primer));
    this.hasta.set(this.fmt(ultimo));
    this.mesSeleccionado.set(ym);
  }

  onMesChange(ym: string) {
    this.aplicarMes(ym);
  }

  onClienteChange(v: string) {
    const n = v ? Number(v) : null;
    this.clienteId.set(n);
    const pid = this.proyectoId();
    if (pid && n !== null) {
      const p = this.proyectos().find(x => x.id === pid);
      if (!p || p.clienteId !== n) this.proyectoId.set(null);
    }
  }

  onProyectoChange(v: string) {
    this.proyectoId.set(v ? Number(v) : null);
  }

  private fmt(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private buildFiltro(): ReporteHorasFiltro | null {
    const desde = this.desde();
    const hasta = this.hasta();
    if (!desde || !hasta) {
      this.error.set('Debe indicar fecha desde y hasta.');
      return null;
    }
    if (hasta < desde) {
      this.error.set('La fecha hasta no puede ser anterior a desde.');
      return null;
    }
    this.error.set(null);
    return {
      desde,
      hasta,
      clienteId: this.clienteId(),
      proyectoId: this.proyectoId()
    };
  }

  generar() {
    const f = this.buildFiltro();
    if (!f) return;
    this.cargando.set(true);
    this.reportes_.horasPorProyecto(f).subscribe({
      next: r => {
        this.reporte.set(r);
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(err.error?.message ?? 'Error al generar el reporte');
        this.cargando.set(false);
      }
    });
  }

  exportar(tipo: 'excel' | 'pdf') {
    const f = this.buildFiltro();
    if (!f) return;
    const obs = tipo === 'excel'
      ? this.reportes_.horasPorProyectoExcel(f)
      : this.reportes_.horasPorProyectoPdf(f);
    const ext = tipo === 'excel' ? 'xlsx' : 'pdf';
    this.cargando.set(true);
    obs.subscribe({
      next: blob => {
        this.cargando.set(false);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `horas-por-proyecto_${f.desde}_${f.hasta}.${ext}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      },
      error: err => {
        this.error.set(err.error?.message ?? 'Error al exportar');
        this.cargando.set(false);
      }
    });
  }

  limpiar() {
    this.clienteId.set(null);
    this.proyectoId.set(null);
    this.reporte.set(null);
    this.error.set(null);
    this.setMesActual();
  }
}
