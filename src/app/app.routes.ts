import { Routes } from '@angular/router';
import { ListaMapasComponent } from './components/lista-mapas/lista-mapas.component';
import { RotasComponent } from './components/rotas/rotas.component';
import { KmlUploadComponent } from './components/kml-upload/kml-upload.component';
import { GerenciarDados } from './components/gerenciar-dados/gerenciar-dados';
import { StorageViewerComponent } from './components/storage-viewer/storage-viewer.component';

export const routes: Routes = [
  { path: 'mapas', component: ListaMapasComponent },
  { path: 'rotas', component: RotasComponent },
  { path: 'kml-upload', component: KmlUploadComponent },
  { path: 'gerenciar-dados', component: GerenciarDados },
  { path: 'storage', component: StorageViewerComponent },
  { path: '', redirectTo: '', pathMatch: 'full' }
];
