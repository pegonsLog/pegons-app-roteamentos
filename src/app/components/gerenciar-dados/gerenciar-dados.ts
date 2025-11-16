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
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    status: 'success' as 'pending' | 'success' | 'error'
  });

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

  async deleteAddress(address: FirestoreAddress) {
    if (!address.id) return;
    
    if (!confirm(`Tem certeza que deseja deletar o endereço de ${address.nome}?`)) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    
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

  async deleteAllAddresses() {
    const shift = this.selectedShift();
    if (!shift) return;
    
    if (!confirm(`Tem certeza que deseja deletar TODOS os endereços do ${shift}? Esta ação não pode ser desfeita!`)) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    
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
}
