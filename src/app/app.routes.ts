import { Routes } from '@angular/router';
import { ListaMapasComponent } from './components/lista-mapas/lista-mapas.component';
import { RotasComponent } from './components/rotas/rotas.component';
import { KmlUploadComponent } from './components/kml-upload/kml-upload.component';

export const routes: Routes = [
  { path: 'mapas', component: ListaMapasComponent },
  { path: 'rotas', component: RotasComponent },
  { path: 'kml-upload', component: KmlUploadComponent },
  { path: '', redirectTo: '', pathMatch: 'full' }
];
