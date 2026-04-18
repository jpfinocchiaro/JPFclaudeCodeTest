import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { Cliente, ClienteInput } from '../../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private http = inject(HttpClient);
  private base = `${API_URL}/clientes`;

  list(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.base);
  }
  create(input: ClienteInput): Observable<Cliente> {
    return this.http.post<Cliente>(this.base, input);
  }
  update(id: number, input: ClienteInput): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, input);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
