import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Gare } from '../models/trajet.model';

@Injectable({
  providedIn: 'root'
})
export class GareService {
  private apiUrl = 'http://localhost:8080/api/gares';

  constructor(private http: HttpClient) {}

  getAllGares(): Observable<Gare[]> {
    return this.http.get<Gare[]>(this.apiUrl);
  }

  getGareById(id: number): Observable<Gare> {
    return this.http.get<Gare>(`${this.apiUrl}/${id}`);
  }

  searchGares(searchTerm: string): Observable<Gare[]> {
    return this.http.get<Gare[]>(`${this.apiUrl}/search?q=${searchTerm}`);
  }

  createGare(gare: Gare): Observable<Gare> {
    return this.http.post<Gare>(this.apiUrl, gare);
  }

  updateGare(id: number, gare: Gare): Observable<Gare> {
    return this.http.put<Gare>(`${this.apiUrl}/${id}`, gare);
  }

  deleteGare(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}