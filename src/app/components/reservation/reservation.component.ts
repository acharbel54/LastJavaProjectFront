import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReservationService, Reservation } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="reservation-container">
      <h2>Mes Réservations</h2>
      
      <div *ngIf="!isAuthenticated" class="auth-required">
        <p>Vous devez être connecté pour voir vos réservations.</p>
        <a routerLink="/login" class="btn-primary">Se connecter</a>
      </div>
      
      <div *ngIf="isAuthenticated && isLoading" class="loading">
        Chargement des réservations...
      </div>

      <div *ngIf="isAuthenticated && errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div *ngIf="isAuthenticated && successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <div *ngIf="isAuthenticated && !isLoading && reservations.length === 0 && !errorMessage" class="no-reservations">
        <p>Aucune réservation trouvée.</p>
        <a routerLink="/search" class="btn-primary">Rechercher des trajets</a>
      </div>

      <div *ngIf="isAuthenticated && reservations.length > 0" class="reservations-list">
        <div *ngFor="let reservation of reservations" class="reservation-card">
          <div class="reservation-header">
            <h3>{{ reservation.numeroReservation }}</h3>
            <span class="status" [ngClass]="'status-' + reservation.statut.toLowerCase()">
              {{ getStatusLabel(reservation.statut) }}
            </span>
          </div>
          
          <div class="reservation-content">
            <div class="trip-info">
              <h4>Informations du trajet</h4>
              <p>{{reservation.trajet.gareDepart.nom}} ({{reservation.trajet.gareDepart.ville}}) → {{reservation.trajet.gareArrivee.nom}} ({{reservation.trajet.gareArrivee.ville}})</p>
              <p><strong>Départ:</strong> {{formatDateTime(reservation.trajet.heureDepart)}}</p>
              <p><strong>Arrivée:</strong> {{formatDateTime(reservation.trajet.heureArrivee)}}</p>
              <p><strong>Durée:</strong> {{calculateDuration(reservation.trajet.heureDepart, reservation.trajet.heureArrivee)}}</p>
            </div>
            
            <div class="passenger-info">
              <p><strong>Nombre de places:</strong> {{reservation.nombrePlaces}}</p>
              <p><strong>Prix total:</strong> {{reservation.prixTotal}} FCFA</p>
              <p><strong>Date de réservation:</strong> {{formatDateTime(reservation.dateReservation)}}</p>
            </div>
          </div>
          
          <div class="reservation-actions">
            <button 
              class="btn-secondary" 
              (click)="showReservationDetails(reservation)"
            >
              Voir détails
            </button>
            <button 
              *ngIf="reservation.statut === 'EN_ATTENTE'" 
              class="btn-danger" 
              (click)="cancelReservation(reservation.id!)"
              [disabled]="isCancelling[reservation.id!]"
            >
              <span *ngIf="isCancelling[reservation.id!]">Annulation...</span>
              <span *ngIf="!isCancelling[reservation.id!]">Annuler</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal pour les détails -->
      <div *ngIf="selectedReservation" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Détails de la réservation</h3>
            <button class="close-btn" (click)="closeModal()">×</button>
          </div>
          
          <div class="modal-body">
            <div class="detail-section">
              <h4>Informations de réservation</h4>
              <p><strong>Numéro:</strong> {{selectedReservation.numeroReservation}}</p>
              <p><strong>Statut:</strong> {{getStatusLabel(selectedReservation.statut)}}</p>
              <p><strong>Date de réservation:</strong> {{formatDateTime(selectedReservation.dateReservation)}}</p>
              <p><strong>Nombre de places:</strong> {{selectedReservation.nombrePlaces}}</p>
              <p><strong>Prix total:</strong> {{selectedReservation.prixTotal}} FCFA</p>
            </div>
            
            <div class="detail-section">
              <h4>Détails du trajet</h4>
              <p><strong>Type:</strong> {{selectedReservation.trajet.typeTransport}}</p>
              <p><strong>Trajet ID:</strong> {{selectedReservation.trajet.id}}</p>
              <p><strong>Départ:</strong> {{selectedReservation.trajet.gareDepart.nom}} ({{selectedReservation.trajet.gareDepart.ville}})</p>
              <p><strong>Arrivée:</strong> {{selectedReservation.trajet.gareArrivee.nom}} ({{selectedReservation.trajet.gareArrivee.ville}})</p>
              <p><strong>Heure de départ:</strong> {{formatDateTime(selectedReservation.trajet.heureDepart)}}</p>
              <p><strong>Heure d'arrivée:</strong> {{formatDateTime(selectedReservation.trajet.heureArrivee)}}</p>
              <p><strong>Durée du voyage:</strong> {{calculateDuration(selectedReservation.trajet.heureDepart, selectedReservation.trajet.heureArrivee)}}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit {
  reservations: Reservation[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isCancelling: { [key: number]: boolean } = {};
  selectedReservation: Reservation | null = null;
  isAuthenticated = false;

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuthAndLoadReservations();
  }

  checkAuthAndLoadReservations(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    
    if (this.isAuthenticated) {
      this.loadReservations();
    }
  }

  loadReservations(): void {
    const currentUser = this.authService.getCurrentUser();
    
    console.log('=== DEBUG RESERVATIONS ===');
    console.log('Utilisateur connecté:', currentUser);
    
    if (!currentUser) {
      this.errorMessage = 'Utilisateur non connecté.';
      this.isAuthenticated = false;
      return;
    }

    console.log('ID utilisateur:', currentUser.id);
    console.log('URL appelée:', `http://localhost:8080/api/reservations/user/${currentUser.id}`);

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.reservationService.getReservationsByUserId(currentUser.id).subscribe({
      next: (reservations: Reservation[]) => {
        console.log('Réservations reçues:', reservations);
        console.log('Nombre de réservations:', reservations.length);
        
        this.reservations = reservations.sort((a, b) => 
          new Date(b.dateReservation).getTime() - new Date(a.dateReservation).getTime()
        );
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des réservations:', error);
        console.log('Détails de l\'erreur:', error);
        this.errorMessage = 'Erreur lors du chargement des réservations. Vérifiez que le backend est démarré.';
        this.isLoading = false;
      }
    });
  }

  cancelReservation(reservationId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    this.isCancelling[reservationId] = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.reservationService.cancelReservation(reservationId).subscribe({
      next: (response: any) => {
        this.successMessage = 'Réservation annulée avec succès.';
        this.isCancelling[reservationId] = false;
        this.loadReservations(); // Recharger les réservations
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'annulation:', error);
        this.errorMessage = error.error?.error || 'Erreur lors de l\'annulation de la réservation.';
        this.isCancelling[reservationId] = false;
      }
    });
  }

  showReservationDetails(reservation: Reservation): void {
    this.selectedReservation = reservation;
  }

  closeModal(): void {
    this.selectedReservation = null;
  }

  getStatusLabel(statut: string): string {
    const statusLabels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'CONFIRMEE': 'Confirmée',
      'ANNULEE': 'Annulée',
      'PAYEE': 'Payée'
    };
    return statusLabels[statut] || statut;
  }

  formatDateTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateDuration(depart: string, arrivee: string): string {
    const departTime = new Date(depart);
    const arriveeTime = new Date(arrivee);
    const diffMs = arriveeTime.getTime() - departTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes.toString().padStart(2, '0')}min`;
  }
}