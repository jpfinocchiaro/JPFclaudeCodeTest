import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { ReporteHorasFiltro, ReporteHorasResponse } from '../../models/reporte-horas.model';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private http = inject(HttpClient);
  private base = `${API_URL}/reportes/horas-por-proyecto`;

  horasPorProyecto(filtro: ReporteHorasFiltro): Observable<ReporteHorasResponse> {
    return this.http.get<ReporteHorasResponse>(this.base, { params: this.toParams(filtro) });
  }

  horasPorProyectoExcel(filtro: ReporteHorasFiltro): Observable<Blob> {
    return this.http.get(`${this.base}/excel`, { params: this.toParams(filtro), responseType: 'blob' });
  }

  horasPorProyectoPdf(filtro: ReporteHorasFiltro): Observable<Blob> {
    return this.http.get(`${this.base}/pdf`, { params: this.toParams(filtro), responseType: 'blob' });
  }

  private toParams(f: ReporteHorasFiltro): HttpParams {
    let p = new HttpParams().set('desde', f.desde).set('hasta', f.hasta);
    if (f.clienteId) p = p.set('clienteId', f.clienteId);
    if (f.proyectoId) p = p.set('proyectoId', f.proyectoId);
    return p;
  }
}
