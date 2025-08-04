import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TrajetService } from '../../services/trajet.service';
import { GareService } from '../../services/gare.service';
import { ReservationService, CreateReservationData } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { Trajet, Gare } from '../../models/trajet.model';

// Interface pour les données de création de trajet
interface CreateTrajetData {
  gareDepartId: string;
  gareArriveeId: string;
  dateDepart: string;
  heureDepart: string;
  dateArrivee: string;
  heureArrivee: string;
  prix: number | null;
  typeTransport: string;
  placesTotales: number | null;
  placesDisponibles: number | null;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="search-container">
      <h2>Rechercher un trajet</h2>
      
      <div class="search-form">
        <div class="form-row">
          <div class="form-group">
            <label for="departure">Gare de départ</label>
            <select 
              id="departure" 
              [(ngModel)]="searchData.gareDepartId"
              class="form-select"
            >
              <option value="">Sélectionnez une gare de départ</option>
              <option *ngFor="let gare of gares" [value]="gare.id">
                {{gare.nom}} - {{gare.ville}}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="arrival">Gare d'arrivée</label>
            <select 
              id="arrival" 
              [(ngModel)]="searchData.gareArriveeId"
              class="form-select"
            >
              <option value="">Sélectionnez une gare d'arrivée</option>
              <option *ngFor="let gare of gares" [value]="gare.id">
                {{gare.nom}} - {{gare.ville}}
              </option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="date">Date de départ</label>
            <input 
              type="date" 
              id="date" 
              [(ngModel)]="searchData.date"
              class="form-input"
            >
          </div>
          
          <div class="form-group">
            <label for="passengers">Nombre de passagers</label>
            <select id="passengers" [(ngModel)]="searchData.passengers" class="form-select">
              <option value="1">1 passager</option>
              <option value="2">2 passagers</option>
              <option value="3">3 passagers</option>
              <option value="4">4 passagers</option>
            </select>
          </div>
        </div>
        
        <div class="form-actions">
          <button (click)="onSearch()" class="btn-search" [disabled]="isLoading">
            {{ isLoading ? 'Recherche...' : 'Rechercher' }}
          </button>
          <button (click)="showAllTrajets()" class="btn-show-all" [disabled]="isLoading">
            Afficher tous les trajets
          </button>
          <button (click)="toggleCreateForm()" class="btn-create" [disabled]="isLoading">
            {{ showCreateForm ? 'Annuler' : 'Ajouter un trajet' }}
          </button>
        </div>
      </div>

      <!-- Formulaire de création de trajet -->
      <div *ngIf="showCreateForm" class="create-form">
        <h3>Créer un nouveau trajet</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="create-departure">Gare de départ *</label>
            <select 
              id="create-departure" 
              [(ngModel)]="newTrajet.gareDepartId"
              class="form-select"
              required
            >
              <option value="">Sélectionnez une gare de départ</option>
              <option *ngFor="let gare of gares" [value]="gare.id">
                {{gare.nom}} - {{gare.ville}}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="create-arrival">Gare d'arrivée *</label>
            <select 
              id="create-arrival" 
              [(ngModel)]="newTrajet.gareArriveeId"
              class="form-select"
              required
            >
              <option value="">Sélectionnez une gare d'arrivée</option>
              <option *ngFor="let gare of gares" [value]="gare.id">
                {{gare.nom}} - {{gare.ville}}
              </option>
            </select>
          </div>
        </div>

        <!-- Date et heure de départ séparées -->
        <div class="form-row">
          <div class="form-group">
            <label for="departure-date">Date de départ *</label>
            <input 
              type="date" 
              id="departure-date" 
              [(ngModel)]="newTrajet.dateDepart"
              class="form-input"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="departure-time">Heure de départ *</label>
            <input 
              type="time" 
              id="departure-time" 
              [(ngModel)]="newTrajet.heureDepart"
              class="form-input"
              required
            >
          </div>
        </div>

        <!-- Date et heure d'arrivée séparées -->
        <div class="form-row">
          <div class="form-group">
            <label for="arrival-date">Date d'arrivée *</label>
            <input 
              type="date" 
              id="arrival-date" 
              [(ngModel)]="newTrajet.dateArrivee"
              class="form-input"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="arrival-time">Heure d'arrivée *</label>
            <input 
              type="time" 
              id="arrival-time" 
              [(ngModel)]="newTrajet.heureArrivee"
              class="form-input"
              required
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="price">Prix (FCFA) *</label>
            <input 
              type="number" 
              id="price" 
              [(ngModel)]="newTrajet.prix"
              class="form-input"
              min="0"
              step="100"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="transport-type">Type de transport *</label>
            <select 
              id="transport-type" 
              [(ngModel)]="newTrajet.typeTransport"
              class="form-select"
              required
            >
              <option value="">Sélectionnez un type</option>
              <option value="Express">Express</option>
              <option value="Rapide">Rapide</option>
              <option value="Local">Local</option>
              <option value="TGV">TGV</option>
              <option value="TER">TER</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="total-places">Places totales *</label>
            <input 
              type="number" 
              id="total-places" 
              [(ngModel)]="newTrajet.placesTotales"
              class="form-input"
              min="1"
              max="200"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="available-places">Places disponibles *</label>
            <input 
              type="number" 
              id="available-places" 
              [(ngModel)]="newTrajet.placesDisponibles"
              class="form-input"
              min="0"
              [max]="newTrajet.placesTotales || 200"
              required
            >
          </div>
        </div>

        <div class="form-actions">
          <button (click)="createTrajet()" class="btn-create" [disabled]="isLoading || !isFormValid()">
            {{ isLoading ? 'Création...' : 'Créer le trajet' }}
          </button>
          <button (click)="resetCreateForm()" class="btn-reset" [disabled]="isLoading">
            Réinitialiser
          </button>
        </div>
      </div>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div *ngIf="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <div *ngIf="isLoading" class="loading">
        Chargement des trajets...
      </div>
      
      <div *ngIf="trajets.length > 0 && !isLoading" class="results">
        <h3>{{ isSearchResult ? 'Résultats de recherche' : 'Tous les trajets disponibles' }} ({{ trajets.length }})</h3>
        <div *ngFor="let trajet of trajets" class="result-card">
          <div class="train-info">
            <h4>{{ trajet.typeTransport }} {{ trajet.id }}</h4>
            <p>{{ trajet.gareDepart.nom }} ({{ trajet.gareDepart.ville }}) → {{ trajet.gareArrivee.nom }} ({{ trajet.gareArrivee.ville }})</p>
          </div>
          <div class="time-info">
            <p><strong>Départ:</strong> {{ formatDateTime(trajet.heureDepart) }}</p>
            <p><strong>Arrivée:</strong> {{ formatDateTime(trajet.heureArrivee) }}</p>
            <p><strong>Durée:</strong> {{ calculateDuration(trajet.heureDepart, trajet.heureArrivee) }}</p>
          </div>
          <div class="price-info">
            <p class="price">{{ trajet.prix }} FCFA</p>
            <p class="places">{{ trajet.placesDisponibles }}/{{ trajet.placesTotales }} places</p>
            <div class="reservation-section">
              <div *ngIf="!showReservationForm[trajet.id!]" class="reservation-buttons">
                <button 
                  class="btn-book" 
                  [disabled]="trajet.placesDisponibles === 0"
                  (click)="showReservationFormForTrajet(trajet.id!)"
                >
                  {{ trajet.placesDisponibles === 0 ? 'Complet' : 'Réserver' }}
                </button>
              </div>
              
              <div *ngIf="showReservationForm[trajet.id!]" class="reservation-form">
                <div class="form-group">
                  <label>Nombre de places:</label>
                  <select 
                    [(ngModel)]="getReservationData(trajet.id!).nombrePlaces"
                    class="form-select-small"
                  >
                    <option *ngFor="let i of getAvailablePlacesArray(trajet.placesDisponibles!)" [value]="i">
                      {{ i }} place{{ i > 1 ? 's' : '' }}
                    </option>
                  </select>
                </div>
                <div class="reservation-actions">
                  <button 
                    class="btn-confirm" 
                    (click)="makeReservation(trajet)"
                    [disabled]="isReservationLoading[trajet.id!]"
                  >
                    {{ isReservationLoading[trajet.id!] ? 'Réservation...' : 'Confirmer' }}
                  </button>
                  <button 
                    class="btn-cancel" 
                    (click)="hideReservationForm(trajet.id!)"
                    [disabled]="isReservationLoading[trajet.id!]"
                  >
                    Annuler
                  </button>
                </div>
                <div *ngIf="getReservationData(trajet.id!).nombrePlaces" class="price-preview">
                  Total: {{ (trajet.prix! * getReservationData(trajet.id!).nombrePlaces) | number:'1.0-0' }} FCFA
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="trajets.length === 0 && !isLoading && !errorMessage && !showCreateForm" class="no-results">
        <p>{{ isSearchResult ? 'Aucun trajet trouvé pour cette recherche.' : 'Aucun trajet disponible.' }}</p>
        <button (click)="toggleCreateForm()" class="btn-create">
          Créer un trajet
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchData = {
    gareDepartId: '',
    gareArriveeId: '',
    date: '',
    passengers: '1'
  };

  newTrajet: CreateTrajetData = {
    gareDepartId: '',
    gareArriveeId: '',
    dateDepart: '',
    heureDepart: '',
    dateArrivee: '',
    heureArrivee: '',
    prix: null,
    typeTransport: '',
    placesTotales: null,
    placesDisponibles: null
  };

  trajets: Trajet[] = [];
  gares: Gare[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isSearchResult = false;
  showCreateForm = false;

  // Nouvelles propriétés pour la réservation
  showReservationForm: { [key: number]: boolean } = {};
  reservationData: { [key: number]: { nombrePlaces: number } } = {};
  isReservationLoading: { [key: number]: boolean } = {};

  constructor(
    private trajetService: TrajetService,
    private gareService: GareService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadGares();
    this.loadAllTrajets();
  }

  loadGares(): void {
    this.gareService.getAllGares().subscribe({
      next: (gares: Gare[]) => {
        this.gares = gares;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des gares:', error);
      }
    });
  }

  loadAllTrajets(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.isSearchResult = false;
    
    this.trajetService.getAllTrajets().subscribe({
      next: (trajets: Trajet[]) => {
        this.trajets = trajets;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des trajets:', error);
        this.errorMessage = 'Erreur lors du chargement des trajets. Vérifiez que le backend est démarré.';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchData.gareDepartId && !this.searchData.gareArriveeId) {
      this.showAllTrajets();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.isSearchResult = true;

    const gareDepartId = this.searchData.gareDepartId ? Number(this.searchData.gareDepartId) : undefined;
    const gareArriveeId = this.searchData.gareArriveeId ? Number(this.searchData.gareArriveeId) : undefined;
    const dateDepart = this.searchData.date ? this.searchData.date + 'T00:00:00' : undefined;

    this.trajetService.searchTrajets(gareDepartId, gareArriveeId, dateDepart).subscribe({
      next: (trajets: Trajet[]) => {
        this.trajets = trajets;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors de la recherche:', error);
        this.errorMessage = 'Erreur lors de la recherche des trajets.';
        this.isLoading = false;
      }
    });
  }

  showAllTrajets(): void {
    this.loadAllTrajets();
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.showCreateForm) {
      this.resetCreateForm();
    }
  }

  resetCreateForm(): void {
    this.newTrajet = {
      gareDepartId: '',
      gareArriveeId: '',
      dateDepart: '',
      heureDepart: '',
      dateArrivee: '',
      heureArrivee: '',
      prix: null,
      typeTransport: '',
      placesTotales: null,
      placesDisponibles: null
    };
  }

  isFormValid(): boolean {
    return !!(
      this.newTrajet.gareDepartId &&
      this.newTrajet.gareArriveeId &&
      this.newTrajet.dateDepart &&
      this.newTrajet.heureDepart &&
      this.newTrajet.dateArrivee &&
      this.newTrajet.heureArrivee &&
      this.newTrajet.prix &&
      this.newTrajet.typeTransport &&
      this.newTrajet.placesTotales &&
      this.newTrajet.placesDisponibles !== null &&
      this.newTrajet.gareDepartId !== this.newTrajet.gareArriveeId &&
      this.isValidDateTime() &&
      this.newTrajet.placesDisponibles! <= this.newTrajet.placesTotales!
    );
  }

  // Nouvelle méthode pour valider les dates et heures
  isValidDateTime(): boolean {
    if (!this.newTrajet.dateDepart || !this.newTrajet.heureDepart || 
        !this.newTrajet.dateArrivee || !this.newTrajet.heureArrivee) {
      return false;
    }

    const departDateTime = new Date(`${this.newTrajet.dateDepart}T${this.newTrajet.heureDepart}`);
    const arriveeDateTime = new Date(`${this.newTrajet.dateArrivee}T${this.newTrajet.heureArrivee}`);
    
    return departDateTime < arriveeDateTime;
  }

  createTrajet(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement et vérifier que l\'heure d\'arrivée est après l\'heure de départ.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const gareDepart = this.gares.find(g => g.id === Number(this.newTrajet.gareDepartId));
    const gareArrivee = this.gares.find(g => g.id === Number(this.newTrajet.gareArriveeId));

    if (!gareDepart || !gareArrivee) {
      this.errorMessage = 'Erreur: Gares non trouvées.';
      this.isLoading = false;
      return;
    }

    // Combiner date et heure pour créer les timestamps complets
    const heureDepart = `${this.newTrajet.dateDepart}T${this.newTrajet.heureDepart}:00`;
    const heureArrivee = `${this.newTrajet.dateArrivee}T${this.newTrajet.heureArrivee}:00`;

    const trajetData = {
      gareDepart: gareDepart,
      gareArrivee: gareArrivee,
      heureDepart: heureDepart,
      heureArrivee: heureArrivee,
      prix: this.newTrajet.prix!,
      typeTransport: this.newTrajet.typeTransport,
      placesTotales: this.newTrajet.placesTotales!,
      placesDisponibles: this.newTrajet.placesDisponibles!
    };

    this.trajetService.createTrajet(trajetData).subscribe({
      next: (response: any) => {
        this.successMessage = 'Trajet créé avec succès !';
        this.resetCreateForm();
        this.showCreateForm = false;
        this.loadAllTrajets();
      },
      error: (error: any) => {
        console.error('Erreur lors de la création du trajet:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la création du trajet.';
        this.isLoading = false;
      }
    });
  }

  // Nouvelles méthodes pour la réservation
  showReservationFormForTrajet(trajetId: number): void {
    this.showReservationForm[trajetId] = true;
    this.reservationData[trajetId] = { nombrePlaces: 1 };
    this.errorMessage = '';
    this.successMessage = '';
  }

  hideReservationForm(trajetId: number): void {
    this.showReservationForm[trajetId] = false;
    delete this.reservationData[trajetId];
  }

  // Nouvelle méthode pour obtenir les données de réservation de manière sûre
  getReservationData(trajetId: number): { nombrePlaces: number } {
    if (!this.reservationData[trajetId]) {
      this.reservationData[trajetId] = { nombrePlaces: 1 };
    }
    return this.reservationData[trajetId];
  }

  getAvailablePlacesArray(maxPlaces: number): number[] {
    return Array.from({ length: Math.min(maxPlaces, 10) }, (_, i) => i + 1);
  }

  makeReservation(trajet: Trajet): void {
    const nombrePlaces = this.getReservationData(trajet.id!).nombrePlaces;

    if (!nombrePlaces || nombrePlaces <= 0) {
      this.errorMessage = 'Veuillez sélectionner un nombre de places valide.';
      return;
    }

    // Vérifier si l'utilisateur est connecté
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage = 'Vous devez être connecté pour faire une réservation.';
      return;
    }

    this.isReservationLoading[trajet.id!] = true;
    this.errorMessage = '';
    this.successMessage = '';

    const reservationData: CreateReservationData = {
      userId: currentUser.id,
      trajetId: trajet.id!,
      nombrePlaces: nombrePlaces
    };

    console.log('=== DEBUG CRÉATION RÉSERVATION ===');
    console.log('Utilisateur connecté:', currentUser);
    console.log('Données de réservation:', reservationData);

    this.reservationService.createReservation(reservationData).subscribe({
      next: (response: any) => {
        console.log('Réservation créée avec succès:', response);
        this.successMessage = `Réservation confirmée ! Numéro: ${response.numeroReservation}`;
        this.hideReservationForm(trajet.id!);
        this.isReservationLoading[trajet.id!] = false;
        
        // Mettre à jour les places disponibles localement
        trajet.placesDisponibles = trajet.placesDisponibles! - nombrePlaces;
        
        // Recharger les trajets pour avoir les données à jour
        this.loadAllTrajets();
      },
      error: (error: any) => {
        console.error('Erreur lors de la réservation:', error);
        this.errorMessage = error.error?.error || 'Erreur lors de la réservation.';
        this.isReservationLoading[trajet.id!] = false;
      }
    });
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