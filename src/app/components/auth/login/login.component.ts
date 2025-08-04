import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Connexion</h2>
        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username">Nom d'utilisateur</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              [(ngModel)]="loginData.username" 
              required 
              #username="ngModel"
              placeholder="ex: jean.dupont"
            >
            <div *ngIf="username.invalid && username.touched" class="error">
              Nom d'utilisateur requis
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              [(ngModel)]="loginData.password" 
              required 
              #password="ngModel"
              placeholder="Votre mot de passe"
            >
            <div *ngIf="password.invalid && password.touched" class="error">
              Mot de passe requis
            </div>
          </div>
          
          <button 
            type="submit" 
            [disabled]="loginForm.invalid || isLoading" 
            class="btn-primary"
          >
            <span *ngIf="isLoading">Connexion en cours...</span>
            <span *ngIf="!isLoading">Se connecter</span>
          </button>

          <button type="button" (click)="testLogin()" class="btn-secondary" style="margin-top: 10px; width: 100%;">
            Test Login (jean.dupont)
          </button>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <!-- Debug info -->
          <div style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 5px;">
            <strong>Debug:</strong><br>
            Username: {{ loginData.username }}<br>
            Password: {{ loginData.password ? '***' : 'vide' }}<br>
            Loading: {{ isLoading }}
          </div>
        </form>
        
        <p class="register-link">
          Pas encore de compte ? 
          <a routerLink="/register">S'inscrire</a>
        </p>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginData = {
    username: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(
    private router: Router, 
    private http: HttpClient,
    private authService: AuthService
  ) {}

  onLogin() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('=== DEBUG LOGIN ===');
    console.log('Données envoyées:', this.loginData);
    console.log('URL:', `${this.apiUrl}/login`);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.post(`${this.apiUrl}/login`, this.loginData, { headers }).subscribe({
      next: (response: any) => {
        console.log('=== SUCCÈS ===');
        console.log('Réponse complète:', response);
        this.successMessage = 'Connexion réussie ! Redirection...';
        this.isLoading = false;
        
        // Utiliser le service d'authentification
        this.authService.login(response.user);
        
        // Rediriger vers la page d'accueil après 1 seconde
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      },
      error: (error) => {
        console.log('=== ERREUR ===');
        console.error('Erreur complète:', error);
        console.log('Status:', error.status);
        console.log('Error body:', error.error);
        console.log('Message:', error.message);
        
        this.isLoading = false;
        
        if (error.status === 400) {
          this.errorMessage = error.error?.error || 'Nom d\'utilisateur ou mot de passe incorrect.';
        } else if (error.status === 404) {
          this.errorMessage = 'Utilisateur non trouvé.';
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
        } else {
          this.errorMessage = `Erreur ${error.status}: ${error.error?.error || error.message}`;
        }
      }
    });
  }

  testLogin() {
    const testData = {
      username: "jean.dupont",
      password: "motdepasse123"
    };
    
    console.log('Test avec données hardcodées:', testData);
    
    this.http.post(`${this.apiUrl}/login`, testData).subscribe({
      next: (response: any) => {
        console.log('Test réussi:', response);
        this.authService.login(response.user);
        this.router.navigate(['/']);
      },
      error: (error) => console.error('Test échoué:', error)
    });
  }
}