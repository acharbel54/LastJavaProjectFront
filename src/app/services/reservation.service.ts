import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reservation {
  id?: number;
  user: any;
  trajet: any;
  nombrePlaces: number;
  prixTotal: number;
  dateReservation: string;
  statut: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE' | 'PAYEE';
  numeroReservation: string;
}

export interface CreateReservationData {
  userId: number;
  trajetId: number;
  nombrePlaces: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient) { }

  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

  getReservationsByUserId(userId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/user/${userId}`);
  }

  getReservationById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
  }

  createReservation(reservationData: CreateReservationData): Observable<any> {
    return this.http.post<any>(this.apiUrl, reservationData);
  }

  updateReservationStatus(id: number, statut: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { statut });
  }

  cancelReservation(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/cancel`, {});
  }

  deleteReservation(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}