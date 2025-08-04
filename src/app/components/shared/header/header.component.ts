import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="header-toolbar">
      <div class="header-container">
        <div class="logo-section">
          <a routerLink="/" class="logo">
            <span class="logo-text">GareConnect</span>
          </a>
        </div>
        
        <nav class="nav-section">
          <a routerLink="/" mat-button class="nav-link">Accueil</a>
          <a routerLink="/search" mat-button class="nav-link">Rechercher</a>
          <a routerLink="/reservation" mat-button class="nav-link">Mes réservations</a>
        </nav>
        
        <div class="auth-section">
          <!-- Affichage quand l'utilisateur n'est PAS connecté -->
          <ng-container *ngIf="!isLoggedIn">
            <a routerLink="/login" mat-button class="auth-button">Se connecter</a>
            <a routerLink="/register" mat-raised-button color="primary" class="auth-button">S'inscrire</a>
          </ng-container>
          
          <!-- Affichage quand l'utilisateur EST connecté -->
          <ng-container *ngIf="isLoggedIn && currentUser">
            <div class="user-info">
              <mat-icon class="user-icon">account_circle</mat-icon>
              <span class="username">{{ currentUser.username }}</span>
              <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-menu-trigger">
                <mat-icon>arrow_drop_down</mat-icon>
              </button>
            </div>
            
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item>
                <mat-icon>person</mat-icon>
                <span>Mon profil</span>
              </button>
              <button mat-menu-item>
                <mat-icon>settings</mat-icon>
                <span>Paramètres</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Se déconnecter</span>
              </button>
            </mat-menu>
          </ng-container>
        </div>
      </div>
    </mat-toolbar>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  currentUser: User | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // S'abonner aux changements d'état d'authentification
    const authSub = this.authService.isLoggedIn$.subscribe(
      isLoggedIn => this.isLoggedIn = isLoggedIn
    );

    const userSub = this.authService.currentUser$.subscribe(
      user => this.currentUser = user
    );

    this.subscriptions.push(authSub, userSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}