import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  DocumentReference,
  Timestamp
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Mapa, MapaFormData } from '../models/mapa.model';

@Injectable({
  providedIn: 'root'
})
export class MapaService {
  private firestore = inject(Firestore);
  private mapasCollection = collection(this.firestore, 'mapas');

  // Listar todos os mapas
  getMapas(): Observable<Mapa[]> {
    return collectionData(this.mapasCollection, { idField: 'id' }).pipe(
      map((mapas: any[]) => 
        mapas.map(mapa => ({
          ...mapa,
          dataCriacao: mapa.dataCriacao?.toDate(),
          dataAtualizacao: mapa.dataAtualizacao?.toDate()
        }))
      )
    );
  }

  // Adicionar novo mapa
  async adicionarMapa(mapaData: MapaFormData): Promise<DocumentReference> {
    // Obtém o número atual de mapas para definir a ordem
    const mapas = await new Promise<Mapa[]>((resolve) => {
      this.getMapas().subscribe(mapas => resolve(mapas));
    });
    
    const novoMapa = {
      ...mapaData,
      dataCriacao: Timestamp.now(),
      dataAtualizacao: Timestamp.now(),
      ordem: mapas.length // Adiciona no final
    };
    return await addDoc(this.mapasCollection, novoMapa);
  }

  // Atualizar mapa existente
  async atualizarMapa(id: string, mapaData: Partial<MapaFormData>): Promise<void> {
    const mapaDoc = doc(this.firestore, 'mapas', id);
    const dadosAtualizados = {
      ...mapaData,
      dataAtualizacao: Timestamp.now()
    };
    return await updateDoc(mapaDoc, dadosAtualizados);
  }

  // Atualizar apenas a ordem do mapa
  async atualizarOrdem(id: string, ordem: number): Promise<void> {
    const mapaDoc = doc(this.firestore, 'mapas', id);
    return await updateDoc(mapaDoc, { ordem });
  }

  // Deletar mapa
  async deletarMapa(id: string): Promise<void> {
    const mapaDoc = doc(this.firestore, 'mapas', id);
    return await deleteDoc(mapaDoc);
  }

  // Abrir mapa em nova aba
  abrirMapa(url: string): void {
    window.open(url, '_blank');
  }
}
