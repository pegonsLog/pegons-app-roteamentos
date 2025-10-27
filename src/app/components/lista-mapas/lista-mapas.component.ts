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
  
  // Controle de drag and drop
  draggedIndex: number | null = null;
  dragOverIndex: number | null = null;
  
  // Formulário (não usar signal para compatibilidade com ngModel)
  formData: MapaFormData = {
    nomeMapa: '',
    urlMapa: ''
  };

  constructor(private mapaService: MapaService) {}

  ngOnInit(): void {
    this.carregarMapas();
  }

  carregarMapas(): void {
    this.isLoading.set(true);
    this.mapaService.getMapas().subscribe({
      next: (mapas) => {
        // Ordena os mapas pela propriedade ordem
        const mapasSorted = mapas.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
        this.mapas.set(mapasSorted);
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
      this.formData = {
        nomeMapa: mapa.nomeMapa,
        urlMapa: mapa.urlMapa
      };
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
    this.formData = {
      nomeMapa: '',
      urlMapa: ''
    };
  }

  async salvarMapa(): Promise<void> {
    const form = this.formData;
    
    // Validação básica
    if (!form.nomeMapa || !form.urlMapa) {
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

  // Métodos de Drag and Drop
  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', index.toString());
    }
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverIndex = index;
  }

  onDragLeave(event: DragEvent): void {
    this.dragOverIndex = null;
  }

  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();
    
    if (this.draggedIndex === null || this.draggedIndex === dropIndex) {
      this.draggedIndex = null;
      this.dragOverIndex = null;
      return;
    }

    const mapasArray = [...this.mapas()];
    const draggedMapa = mapasArray[this.draggedIndex];
    
    // Remove o item da posição original
    mapasArray.splice(this.draggedIndex, 1);
    
    // Insere na nova posição
    mapasArray.splice(dropIndex, 0, draggedMapa);
    
    // Atualiza a ordem de todos os mapas
    mapasArray.forEach((mapa, index) => {
      mapa.ordem = index;
    });
    
    // Atualiza o signal
    this.mapas.set(mapasArray);
    
    // Salva a nova ordem no banco de dados
    this.salvarOrdem(mapasArray);
    
    this.draggedIndex = null;
    this.dragOverIndex = null;
  }

  onDragEnd(): void {
    this.draggedIndex = null;
    this.dragOverIndex = null;
  }

  isDragging(index: number): boolean {
    return this.draggedIndex === index;
  }

  isDragOver(index: number): boolean {
    return this.dragOverIndex === index && this.draggedIndex !== index;
  }

  async salvarOrdem(mapas: Mapa[]): Promise<void> {
    try {
      // Atualiza a ordem de cada mapa no banco de dados
      const promises = mapas.map(mapa => 
        this.mapaService.atualizarOrdem(mapa.id!, mapa.ordem!)
      );
      
      await Promise.all(promises);
      this.successMessage.set('Ordem dos mapas atualizada!');
      setTimeout(() => this.successMessage.set(''), 2000);
    } catch (error: any) {
      this.errorMessage.set('Erro ao salvar ordem: ' + error.message);
      this.carregarMapas(); // Recarrega para reverter a mudança visual
    }
  }
}
