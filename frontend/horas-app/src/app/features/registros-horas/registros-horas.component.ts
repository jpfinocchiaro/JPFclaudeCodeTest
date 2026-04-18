import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProyectosService } from '../../core/services/proyectos.service';
import { RegistrosHorasService } from '../../core/services/registros-horas.service';
import { Proyecto } from '../../models/proyecto.model';
import { RegistroHoras } from '../../models/registro-horas.model';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-registros-horas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './registros-horas.component.html',
  styleUrl: './registros-horas.component.css'
})
export class RegistrosHorasComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private proyectos_ = inject(ProyectosService);
  private service = inject(RegistrosHorasService);
  private fb = inject(FormBuilder);

  proyecto = signal<Proyecto | null>(null);
  registros = signal<RegistroHoras[]>([]);
  filtro = signal('');
  filtrados = computed(() => {
    const q = this.filtro().trim().toLowerCase();
    if (!q) return this.registros();
    return this.registros().filter(r =>
      r.fecha.toLowerCase().includes(q) ||
      String(r.horas).includes(q) ||
      (r.descripcion ?? '').toLowerCase().includes(q)
    );
  });
  totalFiltrado = computed(() =>
    this.filtrados().reduce((sum, r) => sum + Number(r.horas), 0)
  );
  editingId = signal<number | null>(null);
  error = signal<string | null>(null);

  proyectoId = 0;

  form = this.fb.nonNullable.group({
    fecha: [new Date().toISOString().slice(0, 10), [Validators.required]],
    horas: [1, [Validators.required, Validators.min(0.01), Validators.max(24)]],
    descripcion: ['']
  });

  ngOnInit() {
    this.proyectoId = Number(this.route.snapshot.paramMap.get('id'));
    this.proyectos_.get(this.proyectoId).subscribe(p => this.proyecto.set(p));
    this.reload();
  }

  reload() {
    this.service.list(this.proyectoId).subscribe(r => this.registros.set(r));
  }

  totalHoras(): number {
    return this.registros().reduce((sum, r) => sum + Number(r.horas), 0);
  }

  startNew() {
    this.editingId.set(0);
    this.form.reset({
      fecha: new Date().toISOString().slice(0, 10),
      horas: 1,
      descripcion: ''
    });
    this.error.set(null);
  }

  startEdit(r: RegistroHoras) {
    this.editingId.set(r.id);
    this.form.reset({
      fecha: r.fecha,
      horas: Number(r.horas),
      descripcion: r.descripcion ?? ''
    });
    this.error.set(null);
  }

  cancel() {
    this.editingId.set(null);
    this.error.set(null);
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const input = {
      proyectoId: this.proyectoId,
      fecha: v.fecha,
      horas: Number(v.horas),
      descripcion: v.descripcion?.trim() ? v.descripcion.trim() : null
    };
    const id = this.editingId();
    const onOk = () => { this.editingId.set(null); this.reload(); };
    const onErr = (err: any) => this.error.set(err.error?.message ?? 'Error al guardar');
    if (id && id > 0) {
      this.service.update(id, input).subscribe({ next: onOk, error: onErr });
    } else {
      this.service.create(input).subscribe({ next: onOk, error: onErr });
    }
  }

  remove(r: RegistroHoras) {
    if (!confirm(`¿Eliminar registro del ${r.fecha} (${r.horas} hs)?`)) return;
    this.service.delete(r.id).subscribe({
      next: () => this.reload(),
      error: (err: any) => this.error.set(err.error?.message ?? 'No se pudo eliminar')
    });
  }
}
