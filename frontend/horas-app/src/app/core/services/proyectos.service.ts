import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { Proyecto, ProyectoInput } from '../../models/proyecto.model';

@Injectable({ providedIn: 'root' })
export class ProyectosService {
  private http = inject(HttpClient);
  private base = `${API_URL}/proyectos`;

  list(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(this.base);
  }
  get(id: number): Observable<Proyecto> {
    return this.http.get<Proyecto>(`${this.base}/${id}`);
  }
  create(input: ProyectoInput): Observable<Proyecto> {
    return this.http.post<Proyecto>(this.base, input);
  }
  update(id: number, input: ProyectoInput): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, input);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
