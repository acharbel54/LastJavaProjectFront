import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

export interface Gare {
  id?: number;
  nom: string;
  ville: string;
  adresse?: string;
  codeGare?: string;
  latitude?: number;
  longitude?: number;
}

@Component({
  selector: 'app-gares',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <div class="gares-container">
      <div class="page-header">
        <h1>Accueil - Réseau Ferroviaire</h1>
        <p class="page-description">
          Bienvenue sur GareConnect ! Découvrez toutes les gares desservies par notre réseau ferroviaire
        </p>
        
        <!-- Actions header -->
        <div class="header-actions">
          <button mat-raised-button color="accent" (click)="addNewGare()" [disabled]="isLoading">
            <mat-icon>add</mat-icon>
            Ajouter une gare
          </button>
        </div>
      </div>

      <!-- Loading spinner -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Chargement des gares...</p>
      </div>

      <!-- Error message -->
      <div *ngIf="errorMessage" class="error-container">
        <mat-icon class="error-icon">error</mat-icon>
        <h3>Erreur de chargement</h3>
        <p>{{ errorMessage }}</p>
        <button mat-raised-button color="primary" (click)="loadGares()">
          <mat-icon>refresh</mat-icon>
          Réessayer
        </button>
      </div>

      <!-- Gares list -->
      <div *ngIf="!isLoading && !errorMessage && gares.length > 0" class="gares-grid">
        <mat-card *ngFor="let gare of gares" class="gare-card">
          <mat-card-header>
            <div mat-card-avatar class="gare-avatar">
              <mat-icon>train</mat-icon>
            </div>
            <mat-card-title>{{ gare.nom }}</mat-card-title>
            <mat-card-subtitle>{{ gare.ville }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="gare-info">
              <div *ngIf="gare.codeGare" class="info-item">
                <mat-icon>confirmation_number</mat-icon>
                <span>Code: {{ gare.codeGare }}</span>
              </div>
              
              <div *ngIf="gare.adresse" class="info-item">
                <mat-icon>location_on</mat-icon>
                <span>{{ gare.adresse }}</span>
              </div>
              
              <div class="info-item">
                <mat-icon>location_city</mat-icon>
                <span>{{ gare.ville }}</span>
              </div>
              
              <div *ngIf="gare.latitude && gare.longitude" class="info-item">
                <mat-icon>my_location</mat-icon>
                <span>{{ gare.latitude }}, {{ gare.longitude }}</span>
              </div>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <div class="action-buttons">
              <div class="primary-actions">
                <button mat-button color="primary">
                  <mat-icon>directions</mat-icon>
                  Itinéraire
                </button>
                <button mat-button color="accent">
                  <mat-icon>schedule</mat-icon>
                  Horaires
                </button>
              </div>
              <div class="admin-actions">
                <button mat-icon-button color="primary" (click)="editGare(gare)" title="Modifier">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteGare(gare)" title="Supprimer">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Empty state -->
      <div *ngIf="!isLoading && !errorMessage && gares.length === 0" class="empty-state">
        <mat-icon class="empty-icon">train</mat-icon>
        <h3>Aucune gare trouvée</h3>
        <p>Il n'y a actuellement aucune gare enregistrée dans le système.</p>
        <button mat-raised-button color="primary" (click)="addNewGare()">
          <mat-icon>add</mat-icon>
          Ajouter une nouvelle gare
        </button>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <div *ngIf="showEditDialog" class="dialog-overlay" (click)="closeEditDialog()">
      <div class="edit-dialog" (click)="$event.stopPropagation()">
        <h2>{{ isEditMode ? 'Modifier la gare' : 'Ajouter une nouvelle gare' }}</h2>
        
        <form (ngSubmit)="saveGare()" #editForm="ngForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom de la gare</mat-label>
            <input matInput [(ngModel)]="editingGare.nom" name="nom" required>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Ville</mat-label>
            <input matInput [(ngModel)]="editingGare.ville" name="ville" required>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Adresse</mat-label>
            <input matInput [(ngModel)]="editingGare.adresse" name="adresse">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Code gare</mat-label>
            <input matInput [(ngModel)]="editingGare.codeGare" name="codeGare">
          </mat-form-field>

          <div class="coordinates-row">
            <mat-form-field appearance="outline">
              <mat-label>Latitude</mat-label>
              <input matInput type="number" [(ngModel)]="editingGare.latitude" name="latitude" step="0.000001">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Longitude</mat-label>
              <input matInput type="number" [(ngModel)]="editingGare.longitude" name="longitude" step="0.000001">
            </mat-form-field>
          </div>

          <div class="dialog-actions">
            <button type="button" mat-button (click)="closeEditDialog()">Annuler</button>
            <button type="submit" mat-raised-button color="primary" [disabled]="!editForm.valid || isLoading">
              <mat-icon>{{ isEditMode ? 'save' : 'add' }}</mat-icon>
              {{ isEditMode ? 'Enregistrer' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./gares.component.scss']
})
export class GaresComponent implements OnInit {
  gares: Gare[] = [];
  isLoading = false;
  errorMessage = '';
  showEditDialog = false;
  editingGare: Gare = {} as Gare;
  isEditMode = false;

  private apiUrl = 'http://localhost:8080/api/gares';

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadGares();
  }

  loadGares(): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('Chargement des gares depuis l\'API...');

    this.http.get<Gare[]>(this.apiUrl).subscribe({
      next: (gares) => {
        console.log('Gares reçues:', gares);
        this.gares = gares;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des gares:', error);
        this.errorMessage = 'Impossible de charger la liste des gares. Vérifiez que le serveur est démarré.';
        this.isLoading = false;
      }
    });
  }

  addNewGare(): void {
    this.editingGare = {
      nom: '',
      ville: '',
      adresse: '',
      codeGare: '',
      latitude: undefined,
      longitude: undefined
    };
    this.isEditMode = false;
    this.showEditDialog = true;
  }

  editGare(gare: Gare): void {
    this.editingGare = { ...gare }; // Copie de l'objet pour éviter la modification directe
    this.isEditMode = true;
    this.showEditDialog = true;
  }

  closeEditDialog(): void {
    this.showEditDialog = false;
    this.editingGare = {} as Gare;
    this.isEditMode = false;
  }

  saveGare(): void {
    if (!this.editingGare.nom || !this.editingGare.ville) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;

    if (this.isEditMode) {
      // Modification d'une gare existante
      this.http.put<Gare>(`${this.apiUrl}/${this.editingGare.id}`, this.editingGare).subscribe({
        next: (updatedGare) => {
          console.log('Gare modifiée:', updatedGare);
          
          // Mettre à jour la gare dans la liste
          const index = this.gares.findIndex(g => g.id === updatedGare.id);
          if (index !== -1) {
            this.gares[index] = updatedGare;
          }
          
          this.isLoading = false;
          this.closeEditDialog();
          
          this.snackBar.open('Gare modifiée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          this.isLoading = false;
          
          this.snackBar.open('Erreur lors de la modification de la gare', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      // Création d'une nouvelle gare
      this.http.post<Gare>(this.apiUrl, this.editingGare).subscribe({
        next: (newGare) => {
          console.log('Nouvelle gare créée:', newGare);
          
          // Ajouter la nouvelle gare à la liste
          this.gares.push(newGare);
          
          this.isLoading = false;
          this.closeEditDialog();
          
          this.snackBar.open('Nouvelle gare créée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.isLoading = false;
          
          this.snackBar.open('Erreur lors de la création de la gare', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  deleteGare(gare: Gare): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la gare "${gare.nom}" ?`)) {
      this.isLoading = true;

      this.http.delete(`${this.apiUrl}/${gare.id}`).subscribe({
        next: () => {
          console.log('Gare supprimée:', gare.nom);
          
          // Retirer la gare de la liste
          this.gares = this.gares.filter(g => g.id !== gare.id);
          this.isLoading = false;
          
          this.snackBar.open('Gare supprimée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.isLoading = false;
          
          this.snackBar.open('Erreur lors de la suppression de la gare', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}