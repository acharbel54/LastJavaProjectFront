import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trajet } from '../models/trajet.model';

@Injectable({
  providedIn: 'root'
})
export class TrajetService {
  private apiUrl = 'http://localhost:8080/api/trajets';

  constructor(private http: HttpClient) {}

  getAllTrajets(): Observable<Trajet[]> {
    return this.http.get<Trajet[]>(this.apiUrl);
  }

  getTrajetById(id: number): Observable<Trajet> {
    return this.http.get<Trajet>(`${this.apiUrl}/${id}`);
  }

  searchTrajets(gareDepartId?: number, gareArriveeId?: number, dateDepart?: string): Observable<Trajet[]> {
    let params = new HttpParams();
    
    if (gareDepartId) {
      params = params.set('gareDepartId', gareDepartId.toString());
    }
    if (gareArriveeId) {
      params = params.set('gareArriveeId', gareArriveeId.toString());
    }
    if (dateDepart) {
      params = params.set('dateDepart', dateDepart);
    }

    return this.http.get<Trajet[]>(`${this.apiUrl}/search`, { params });
  }

  // Changement du type de paramètre pour accepter any au lieu de Trajet
  createTrajet(trajet: any): Observable<Trajet> {
    return this.http.post<Trajet>(this.apiUrl, trajet);
  }

  createSampleTrajets(): Observable<any> {
    return this.http.post(`${this.apiUrl}/samples`, {});
  }

  updateTrajet(id: number, trajet: Trajet): Observable<Trajet> {
    return this.http.put<Trajet>(`${this.apiUrl}/${id}`, trajet);
  }

  deleteTrajet(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}