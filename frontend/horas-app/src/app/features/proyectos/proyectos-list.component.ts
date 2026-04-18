import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProyectosService } from '../../core/services/proyectos.service';
import { ClientesService } from '../../core/services/clientes.service';
import { Proyecto } from '../../models/proyecto.model';
import { Cliente } from '../../models/cliente.model';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-proyectos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './proyectos-list.component.html',
  styleUrl: './proyectos-list.component.css'
})
export class ProyectosListComponent implements OnInit {
  private proyectos_ = inject(ProyectosService);
  private clientes_ = inject(ClientesService);
  private fb = inject(FormBuilder);

  proyectos = signal<Proyecto[]>([]);
  clientes = signal<Cliente[]>([]);
  filtro = signal('');
  vista = signal<'tabla' | 'tarjetas'>('tarjetas');
  filtrados = computed(() => {
    const q = this.filtro().trim().toLowerCase();
    if (!q) return this.proyectos();
    return this.proyectos().filter(p =>
      p.codigo.toLowerCase().includes(q) ||
      p.descripcion.toLowerCase().includes(q) ||
      p.clienteNombre.toLowerCase().includes(q)
    );
  });
  editingId = signal<number | null>(null);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    descripcion: ['', [Validators.required, Validators.maxLength(500)]],
    clienteId: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit() { this.reload(); }

  reload() {
    forkJoin({
      proyectos: this.proyectos_.list(),
      clientes: this.clientes_.list()
    }).subscribe(({ proyectos, clientes }) => {
      this.proyectos.set(proyectos);
      this.clientes.set(clientes);
    });
  }

  startNew() {
    this.editingId.set(0);
    this.form.reset({ descripcion: '', clienteId: 0 });
    this.error.set(null);
  }

  startEdit(p: Proyecto) {
    this.editingId.set(p.id);
    this.form.reset({ descripcion: p.descripcion, clienteId: p.clienteId });
    this.error.set(null);
  }

  cancel() {
    this.editingId.set(null);
    this.error.set(null);
  }

  save() {
    if (this.form.invalid) return;
    const input = this.form.getRawValue();
    const id = this.editingId();
    const onOk = () => { this.editingId.set(null); this.reload(); };
    const onErr = (err: any) => this.error.set(err.error?.message ?? 'Error al guardar');
    if (id && id > 0) {
      this.proyectos_.update(id, input).subscribe({ next: onOk, error: onErr });
    } else {
      this.proyectos_.create(input).subscribe({ next: onOk, error: onErr });
    }
  }

  remove(p: Proyecto) {
    if (!confirm(`¿Eliminar proyecto "${p.codigo}"? Se borran también sus registros de horas.`)) return;
    this.proyectos_.delete(p.id).subscribe({
      next: () => this.reload(),
      error: (err: any) => this.error.set(err.error?.message ?? 'No se pudo eliminar')
    });
  }
}
