import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreDataService, FirestoreAddress } from '../../services/firestore-data.service';

interface TurnoData {
  nome: string;
  registros: FirestoreAddress[];
}

@Component({
  selector: 'app-lista-atendimento',
  imports: [CommonModule],
  templateUrl: './lista-atendimento.html',
  styleUrl: './lista-atendimento.css',
})
export class ListaAtendimento implements OnInit {
  turnos = signal<TurnoData[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  // Lista de turnos disponíveis
  turnosDisponiveis = ['Turno1', 'Turno2', 'Turno3', 'TurnoAdm'];

  constructor(private firestoreService: FirestoreDataService) {}

  ngOnInit(): void {
    this.loadAllTurnos();
  }

  /**
   * Carrega todos os turnos e seus registros
   */
  async loadAllTurnos(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const turnosData: TurnoData[] = [];

      for (const turno of this.turnosDisponiveis) {
        const registros = await this.firestoreService.getAddressesByShift(turno);
        
        if (registros.length > 0) {
          turnosData.push({
            nome: turno,
            registros: registros
          });
        }
      }

      this.turnos.set(turnosData);
    } catch (error: any) {
      this.errorMessage.set(`Erro ao carregar turnos: ${error.message}`);
      console.error('Erro ao carregar turnos:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Retorna o total de registros de todos os turnos
   */
  getTotalRegistros(): number {
    return this.turnos().reduce((total, turno) => total + turno.registros.length, 0);
  }
}
