import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientesService } from '../../core/services/clientes.service';
import { Cliente } from '../../models/cliente.model';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconComponent],
  templateUrl: './clientes-list.component.html',
  styleUrl: './clientes-list.component.css'
})
export class ClientesListComponent implements OnInit {
  private service = inject(ClientesService);
  private fb = inject(FormBuilder);

  clientes = signal<Cliente[]>([]);
  filtro = signal('');
  vista = signal<'tabla' | 'tarjetas'>('tarjetas');
  filtrados = computed(() => {
    const q = this.filtro().trim().toLowerCase();
    if (!q) return this.clientes();
    return this.clientes().filter(c =>
      String(c.id).includes(q) ||
      c.nombre.toLowerCase().includes(q)
    );
  });
  editingId = signal<number | null>(null);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(200)]]
  });

  ngOnInit() { this.reload(); }

  reload() {
    this.service.list().subscribe(cs => this.clientes.set(cs));
  }

  startNew() {
    this.editingId.set(0);
    this.form.reset({ nombre: '' });
    this.error.set(null);
  }

  startEdit(c: Cliente) {
    this.editingId.set(c.id);
    this.form.reset({ nombre: c.nombre });
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
      this.service.update(id, input).subscribe({ next: onOk, error: onErr });
    } else {
      this.service.create(input).subscribe({ next: onOk, error: onErr });
    }
  }

  remove(c: Cliente) {
    if (!confirm(`¿Eliminar cliente "${c.nombre}"?`)) return;
    this.service.delete(c.id).subscribe({
      next: () => this.reload(),
      error: (err: any) => this.error.set(err.error?.message ?? 'No se pudo eliminar')
    });
  }
}
