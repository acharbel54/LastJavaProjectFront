import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { SearchComponent } from './components/search/search.component';
import { ReservationComponent } from './components/reservation/reservation.component';
import { GaresComponent } from './components/gares/gares.component';

export const routes: Routes = [
  { path: '', component: GaresComponent },
  { path: 'accueil', component: GaresComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'search', component: SearchComponent },
  { path: 'reservation', component: ReservationComponent },
  { path: '**', redirectTo: '' }
];