import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapaService } from '../../services/mapa.service';
import { Mapa, MapaFormData } from '../../models/mapa.model';

@Component({
  selector: 'app-lista-mapas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-mapas.component.html',
  styleUrl: './lista-mapas.component.css'
})
export class ListaMapasComponent implements OnInit {
  mapas = signal<Mapa[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  
  // Controle do modal
  showModal = signal(false);
  isEditMode = signal(false);
  mapaEditandoId = signal<string | null>(null);
  
  // Formulário
  formData = signal<MapaFormData>({
    nomeMapa: '',
    urlMapa: '',
    empresaCliente: '',
    empresaCotante: ''
  });

  constructor(private mapaService: MapaService) {}

  ngOnInit(): void {
    this.carregarMapas();
  }

  carregarMapas(): void {
    this.isLoading.set(true);
    this.mapaService.getMapas().subscribe({
      next: (mapas) => {
        this.mapas.set(mapas);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Erro ao carregar mapas: ' + error.message);
        this.isLoading.set(false);
      }
    });
  }

  abrirModal(mapa?: Mapa): void {
    if (mapa) {
      // Modo edição
      this.isEditMode.set(true);
      this.mapaEditandoId.set(mapa.id || null);
      this.formData.set({
        nomeMapa: mapa.nomeMapa,
        urlMapa: mapa.urlMapa,
        empresaCliente: mapa.empresaCliente,
        empresaCotante: mapa.empresaCotante
      });
    } else {
      // Modo criação
      this.isEditMode.set(false);
      this.mapaEditandoId.set(null);
      this.resetForm();
    }
    this.showModal.set(true);
  }

  fecharModal(): void {
    this.showModal.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.formData.set({
      nomeMapa: '',
      urlMapa: '',
      empresaCliente: '',
      empresaCotante: ''
    });
  }

  async salvarMapa(): Promise<void> {
    const form = this.formData();
    
    // Validação básica
    if (!form.nomeMapa || !form.urlMapa || !form.empresaCliente || !form.empresaCotante) {
      this.errorMessage.set('Todos os campos são obrigatórios');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      if (this.isEditMode() && this.mapaEditandoId()) {
        // Atualizar
        await this.mapaService.atualizarMapa(this.mapaEditandoId()!, form);
        this.successMessage.set('Mapa atualizado com sucesso!');
      } else {
        // Criar novo
        await this.mapaService.adicionarMapa(form);
        this.successMessage.set('Mapa adicionado com sucesso!');
      }
      
      this.fecharModal();
      setTimeout(() => this.successMessage.set(''), 3000);
    } catch (error: any) {
      this.errorMessage.set('Erro ao salvar mapa: ' + error.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async deletarMapa(id: string, nomeMapa: string): Promise<void> {
    if (!confirm(`Tem certeza que deseja deletar o mapa "${nomeMapa}"?`)) {
      return;
    }

    this.isLoading.set(true);
    try {
      await this.mapaService.deletarMapa(id);
      this.successMessage.set('Mapa deletado com sucesso!');
      setTimeout(() => this.successMessage.set(''), 3000);
    } catch (error: any) {
      this.errorMessage.set('Erro ao deletar mapa: ' + error.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  abrirMapa(url: string): void {
    this.mapaService.abrirMapa(url);
  }
}
