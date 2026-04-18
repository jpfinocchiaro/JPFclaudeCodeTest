import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { RegistroHoras, RegistroHorasInput } from '../../models/registro-horas.model';

@Injectable({ providedIn: 'root' })
export class RegistrosHorasService {
  private http = inject(HttpClient);
  private base = `${API_URL}/registros-horas`;

  list(proyectoId?: number): Observable<RegistroHoras[]> {
    let params = new HttpParams();
    if (proyectoId != null) params = params.set('proyectoId', proyectoId);
    return this.http.get<RegistroHoras[]>(this.base, { params });
  }
  create(input: RegistroHorasInput): Observable<RegistroHoras> {
    return this.http.post<RegistroHoras>(this.base, input);
  }
  update(id: number, input: RegistroHorasInput): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, input);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
