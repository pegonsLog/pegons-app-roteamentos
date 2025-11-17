import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreDataService, FirestoreAddress } from '../../services/firestore-data.service';

@Component({
  selector: 'app-gerenciar-dados',
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciar-dados.html',
  styleUrl: './gerenciar-dados.css',
})
export class GerenciarDados implements OnInit {
  shifts = signal<string[]>([]);
  selectedShift = signal<string>('');
  addresses = signal<FirestoreAddress[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  
  // Formulário de edição/criação
  showModal = signal(false);
  editingAddress = signal<FirestoreAddress | null>(null);
  formData = signal({
    nome: '',
    endereco: '',
    turno: '',
    nivelAtendimento: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    status: 'success' as 'pending' | 'success' | 'error'
  });

  // Modais de confirmação de delete
  showDeleteModal = signal(false);
  showDeleteAllModal = signal(false);
  addressToDelete = signal<FirestoreAddress | null>(null);

  // Controle de ordenação
  isSorted = signal(false);

  constructor(private firestoreService: FirestoreDataService) {}

  async ngOnInit() {
    await this.loadShifts();
  }

  async loadShifts() {
    this.isLoading.set(true);
    try {
      const shifts = await this.firestoreService.getAllShifts();
      this.shifts.set(shifts);
      if (shifts.length > 0) {
        this.selectedShift.set(shifts[0]);
        await this.loadAddresses();
      }
    } catch (error: any) {
      this.errorMessage.set(`Erro ao carregar turnos: ${error.message}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadAddresses() {
    if (!this.selectedShift()) return;
    
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const addresses = await this.firestoreService.getAddressesByShift(this.selectedShift());
      this.addresses.set(addresses);
    } catch (error: any) {
      this.errorMessage.set(`Erro ao carregar endereços: ${error.message}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onShiftChange() {
    await this.loadAddresses();
  }

  openCreateModal() {
    this.editingAddress.set(null);
    this.formData.set({
      nome: '',
      endereco: '',
      turno: this.selectedShift(),
      nivelAtendimento: '',
      latitude: undefined,
      longitude: undefined,
      status: 'success'
    });
    this.showModal.set(true);
  }

  openEditModal(address: FirestoreAddress) {
    this.editingAddress.set(address);
    this.formData.set({
      nome: address.nome,
      endereco: address.endereco,
      turno: address.turno,
      nivelAtendimento: address.nivelAtendimento || '',
      latitude: address.latitude,
      longitude: address.longitude,
      status: address.status
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingAddress.set(null);
  }

  async saveAddress() {
    const form = this.formData();
    if (!form.nome || !form.endereco || !form.turno) {
      this.errorMessage.set('Preencha todos os campos obrigatórios');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    
    try {
      const editing = this.editingAddress();
      if (editing && editing.id) {
        // Atualizar
        await this.firestoreService.updateAddress(editing.turno, editing.id, form);
        this.successMessage.set('✅ Endereço atualizado com sucesso!');
      } else {
        // Criar
        await this.firestoreService.addAddress(form);
        this.successMessage.set('✅ Endereço criado com sucesso!');
      }
      
      this.closeModal();
      await this.loadAddresses();
      setTimeout(() => this.successMessage.set(''), 3000);
    } catch (error: any) {
      this.errorMessage.set(`❌ Erro ao salvar: ${error.message}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  openDeleteModal(address: FirestoreAddress) {
    this.addressToDelete.set(address);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.addressToDelete.set(null);
  }

  async confirmDelete() {
    const address = this.addressToDelete();
    if (!address || !address.id) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.closeDeleteModal();
    
    try {
      await this.firestoreService.deleteAddress(address.turno, address.id);
      this.successMessage.set('✅ Endereço deletado com sucesso!');
      await this.loadAddresses();
      setTimeout(() => this.successMessage.set(''), 3000);
    } catch (error: any) {
      this.errorMessage.set(`❌ Erro ao deletar: ${error.message}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  openDeleteAllModal() {
    this.showDeleteAllModal.set(true);
  }

  closeDeleteAllModal() {
    this.showDeleteAllModal.set(false);
  }

  async confirmDeleteAll() {
    const shift = this.selectedShift();
    if (!shift) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.closeDeleteAllModal();
    
    try {
      await this.firestoreService.deleteAllAddressesByShift(shift);
      this.successMessage.set('✅ Todos os endereços foram deletados!');
      await this.loadAddresses();
      setTimeout(() => this.successMessage.set(''), 3000);
    } catch (error: any) {
      this.errorMessage.set(`❌ Erro ao deletar: ${error.message}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateNivelAtendimento(address: FirestoreAddress, novoNivel: string) {
    if (!address.id) return;
    
    try {
      await this.firestoreService.updateAddress(address.turno, address.id, {
        nivelAtendimento: novoNivel
      });
      
      // Atualiza localmente
      const updatedAddresses = this.addresses().map(addr => 
        addr.id === address.id ? { ...addr, nivelAtendimento: novoNivel } : addr
      );
      this.addresses.set(updatedAddresses);
    } catch (error: any) {
      this.errorMessage.set(`❌ Erro ao atualizar: ${error.message}`);
    }
  }

  sortByNivelAndNome() {
    const currentAddresses = [...this.addresses()];
    
    if (this.isSorted()) {
      // Se já está ordenado, volta para ordem original (recarrega)
      this.loadAddresses();
      this.isSorted.set(false);
    } else {
      // Ordena: primeiro por nível (Pleno antes de Misto), depois por nome
      const sorted = currentAddresses.sort((a, b) => {
        // Define ordem de prioridade para nível de atendimento
        const nivelOrder: { [key: string]: number } = {
          'Atend. Pleno': 1,
          'Atend. Misto': 2,
          '': 3 // Sem nível vai para o final
        };
        
        const nivelA = nivelOrder[a.nivelAtendimento || ''] || 3;
        const nivelB = nivelOrder[b.nivelAtendimento || ''] || 3;
        
        // Primeiro compara por nível
        if (nivelA !== nivelB) {
          return nivelA - nivelB;
        }
        
        // Se níveis iguais, ordena por nome
        return a.nome.localeCompare(b.nome);
      });
      
      this.addresses.set(sorted);
      this.isSorted.set(true);
    }
  }
}
