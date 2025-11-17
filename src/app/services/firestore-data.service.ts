import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  CollectionReference,
  DocumentData,
  writeBatch
} from '@angular/fire/firestore';
import { AddressWithCoordinates } from '../models/address.model';

export interface FirestoreAddress {
  id?: string;
  nome: string;
  endereco: string;
  turno: string;
  nivelAtendimento?: string;
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'success' | 'error';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreDataService {

  constructor(private firestore: Firestore) { }

  /**
   * Salva múltiplos endereços no Firestore, organizados por turno
   */
  async saveAddressesByShift(addresses: AddressWithCoordinates[]): Promise<void> {
    const batch = writeBatch(this.firestore);
    const addressesByShift = new Map<string, AddressWithCoordinates[]>();
    
    // Agrupa por turno
    addresses.forEach(addr => {
      const turno = addr.turno || 'Sem Turno';
      if (!addressesByShift.has(turno)) {
        addressesByShift.set(turno, []);
      }
      addressesByShift.get(turno)!.push(addr);
    });

    // Salva cada turno em sua coleção
    for (const [turno, shiftAddresses] of addressesByShift.entries()) {
      // Normaliza o nome do turno para usar como ID da coleção (sem espaços)
      const collectionName = this.normalizeCollectionName(turno);
      const colRef = collection(this.firestore, collectionName);
      
      for (const addr of shiftAddresses) {
        const docRef = doc(colRef);
        const data: any = {
          nome: addr.nome,
          endereco: addr.endereco,
          turno: addr.turno,
          status: addr.status || 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Adiciona campos opcionais apenas se tiverem valor
        if (addr.latitude !== undefined && addr.latitude !== null) {
          data.latitude = addr.latitude;
        }
        if (addr.longitude !== undefined && addr.longitude !== null) {
          data.longitude = addr.longitude;
        }
        if (addr.errorMessage) {
          data.errorMessage = addr.errorMessage;
        }
        if (addr.nivelAtendimento) {
          data.nivelAtendimento = addr.nivelAtendimento;
        }
        
        batch.set(docRef, data);
      }
    }

    await batch.commit();
  }

  /**
   * Busca todos os endereços de um turno específico
   */
  async getAddressesByShift(turno: string): Promise<FirestoreAddress[]> {
    const collectionName = this.normalizeCollectionName(turno);
    const colRef = collection(this.firestore, collectionName);
    const snapshot = await getDocs(colRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirestoreAddress));
  }

  /**
   * Busca todos os turnos disponíveis (coleções)
   */
  async getAllShifts(): Promise<string[]> {
    // Retorna lista de turnos padrão que correspondem aos nomes das coleções
    // Os nomes aqui devem ser os mesmos que aparecem na coluna "turno" da planilha
    const knownShifts = ['Turno1', 'Turno2', 'Turno3', 'TurnoAdm'];
    return knownShifts;
  }

  /**
   * Adiciona um novo endereço
   */
  async addAddress(address: Omit<FirestoreAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const collectionName = this.normalizeCollectionName(address.turno);
    const colRef = collection(this.firestore, collectionName);
    
    const data = {
      ...address,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(colRef, data);
    return docRef.id;
  }

  /**
   * Atualiza um endereço existente
   */
  async updateAddress(turno: string, id: string, updates: Partial<FirestoreAddress>): Promise<void> {
    const collectionName = this.normalizeCollectionName(turno);
    const docRef = doc(this.firestore, collectionName, id);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  /**
   * Deleta um endereço
   */
  async deleteAddress(turno: string, id: string): Promise<void> {
    const collectionName = this.normalizeCollectionName(turno);
    const docRef = doc(this.firestore, collectionName, id);
    await deleteDoc(docRef);
  }

  /**
   * Deleta todos os endereços de um turno
   */
  async deleteAllAddressesByShift(turno: string): Promise<void> {
    const collectionName = this.normalizeCollectionName(turno);
    const colRef = collection(this.firestore, collectionName);
    const snapshot = await getDocs(colRef);
    
    const batch = writeBatch(this.firestore);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }

  /**
   * Normaliza o nome do turno para usar como nome de coleção no Firestore
   * Substitui espaços por underscores e remove caracteres especiais
   */
  private normalizeCollectionName(turno: string | any): string {
    const turnoStr = String(turno || 'Sem_Turno');
    return turnoStr.replace(/\s+/g, '_');
  }
}
