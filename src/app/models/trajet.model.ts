export interface Gare {
  id?: number;
  nom: string;
  ville: string;
  adresse: string;
  codeGare: string;
  latitude?: number;
  longitude?: number;
}

export interface Trajet {
  id: number;
  gareDepart: Gare;
  gareArrivee: Gare;
  heureDepart: string;
  heureArrivee: string;
  prix: number;
  placesDisponibles: number;
  placesTotales: number;
  typeTransport: string;
}