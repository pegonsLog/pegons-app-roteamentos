import { Routes } from '@angular/router';
import { ListaMapasComponent } from './components/lista-mapas/lista-mapas.component';

export const routes: Routes = [
  { path: 'mapas', component: ListaMapasComponent },
  { path: '', redirectTo: '', pathMatch: 'full' }
];
