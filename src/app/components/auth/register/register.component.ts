import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2>Inscription</h2>
        <form (ngSubmit)="onRegister()" #registerForm="ngForm">
          <div class="form-group">
            <label for="username">Nom d'utilisateur</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              [(ngModel)]="registerData.username" 
              required 
              #username="ngModel"
              placeholder="ex: jean.dupont"
            >
            <div *ngIf="username.invalid && username.touched" class="error">
              Nom d'utilisateur requis
            </div>
          </div>

          <div class="form-group">
            <label for="firstName">Prénom</label>
            <input 
              type="text" 
              id="firstName" 
              name="firstName" 
              [(ngModel)]="registerData.firstName" 
              required 
              #firstName="ngModel"
              placeholder="Jean"
            >
            <div *ngIf="firstName.invalid && firstName.touched" class="error">
              Prénom requis
            </div>
          </div>
          
          <div class="form-group">
            <label for="lastName">Nom</label>
            <input 
              type="text" 
              id="lastName" 
              name="lastName" 
              [(ngModel)]="registerData.lastName" 
              required 
              #lastName="ngModel"
              placeholder="Dupont"
            >
            <div *ngIf="lastName.invalid && lastName.touched" class="error">
              Nom requis
            </div>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              [(ngModel)]="registerData.email" 
              required 
              #email="ngModel"
              placeholder="jean.dupont@email.com"
            >
            <div *ngIf="email.invalid && email.touched" class="error">
              Email valide requis
            </div>
          </div>

          <div class="form-group">
            <label for="phoneNumber">Téléphone (optionnel)</label>
            <input 
              type="tel" 
              id="phoneNumber" 
              name="phoneNumber" 
              [(ngModel)]="registerData.phoneNumber" 
              #phoneNumber="ngModel"
              placeholder="0123456789"
            >
          </div>
          
          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              [(ngModel)]="registerData.password" 
              required 
              minlength="6"
              #password="ngModel"
              placeholder="Minimum 6 caractères"
            >
            <div *ngIf="password.invalid && password.touched" class="error">
              Mot de passe requis (min. 6 caractères)
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmer le mot de passe</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              [(ngModel)]="confirmPassword" 
              required 
              #confirmPasswordField="ngModel"
              placeholder="Répétez votre mot de passe"
            >
            <div *ngIf="confirmPasswordField.touched && registerData.password !== confirmPassword" class="error">
              Les mots de passe ne correspondent pas
            </div>
          </div>
          
          <button 
            type="submit" 
            [disabled]="registerForm.invalid || registerData.password !== confirmPassword || isLoading" 
            class="btn-primary"
          >
            <span *ngIf="isLoading">Inscription en cours...</span>
            <span *ngIf="!isLoading">S'inscrire</span>
          </button>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="success-message">
            {{ successMessage }}
          </div>
        </form>
        
        <p class="login-link">
          Déjà un compte ? 
          <a routerLink="/login">Se connecter</a>
        </p>
      </div>
    </div>
  `,
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerData = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: ''
  };

  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private router: Router, private http: HttpClient) {}

  onRegister() {
    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparer les données à envoyer (sans confirmPassword)
    const dataToSend = {
      username: this.registerData.username,
      firstName: this.registerData.firstName,
      lastName: this.registerData.lastName,
      email: this.registerData.email,
      password: this.registerData.password,
      ...(this.registerData.phoneNumber && { phoneNumber: this.registerData.phoneNumber })
    };

    console.log('Données envoyées à l\'API:', dataToSend);

    this.http.post(`${this.apiUrl}/register`, dataToSend).subscribe({
      next: (response: any) => {
        console.log('Inscription réussie:', response);
        this.successMessage = 'Inscription réussie ! Redirection vers la page de connexion...';
        this.isLoading = false;
        
        // Rediriger vers la page de login après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur lors de l\'inscription:', error);
        this.isLoading = false;
        
        if (error.status === 400) {
          this.errorMessage = 'Données invalides. Vérifiez vos informations.';
        } else if (error.status === 409) {
          this.errorMessage = 'Cet email ou nom d\'utilisateur existe déjà.';
        } else {
          this.errorMessage = 'Erreur lors de l\'inscription. Veuillez réessayer.';
        }
      }
    });
  }
}