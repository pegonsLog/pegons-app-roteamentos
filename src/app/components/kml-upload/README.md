# Componente KML Upload

## Descrição
Componente Angular standalone para fazer upload de arquivos KML, extrair dados (nome, endereço e turno) e exportar para Excel.

## Funcionalidades

### 1. Upload de Arquivo KML
- Aceita apenas arquivos com extensão `.kml`
- Validação automática do formato do arquivo
- Feedback visual durante o processamento

### 2. Extração de Dados
O componente extrai automaticamente:
- **Nome**: Extraído da tag `<name>` do Placemark
- **Endereço**: Extraído prioritariamente de `<ExtendedData>` com `<Data name="endereco">`, com fallback para:
  - Tag `<address>`
  - Descrição (procura por padrão "endereço:" ou "address:")
- **Turno**: Extraído de `<ExtendedData>` com `<Data name="turno">`, com fallback para descrição

**Nota**: O componente ignora outros campos do ExtendedData como latitude, longitude e status, extraindo apenas nome, endereço e turno conforme solicitado.

### 3. Visualização de Dados
- Tabela responsiva com todos os dados extraídos
- Turno exibido como texto simples em preto
- Valores decimais do turno são convertidos para inteiros (1.0 → 1)

### 4. Exportação para Excel
- Gera arquivo `.xlsx` com todos os dados
- Colunas formatadas com cabeçalhos em português
- Largura de colunas otimizada para leitura
- Nome do arquivo com timestamp: `locais_YYYYMMDD_HHMMSS.xlsx`

## Estrutura do Arquivo KML Esperado

```xml
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Placemark>
      <name>DENER MOREIRA</name>
      <description><![CDATA[endereco: AV. JUIZ MARCO TULIO ISAAC, 9285 - NOVA BADEN - BETIM]]></description>
      <styleUrl>#icon-1899-0288D1</styleUrl>
      <ExtendedData>
        <Data name="endereco">
          <value>AV. JUIZ MARCO TULIO ISAAC, 9285 - NOVA BADEN - BETIM</value>
        </Data>
        <Data name="turno">
          <value>1.0</value>
        </Data>
      </ExtendedData>
      <Point>
        <coordinates>-44.1363352,-19.9477183,0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>
```

## Como Usar

1. Acesse a rota `/kml-upload` na aplicação
2. Clique no campo de upload e selecione um arquivo `.kml`
3. Aguarde o processamento automático
4. Visualize os dados extraídos na tabela
5. Clique em "Exportar para Excel" para baixar o arquivo `.xlsx`

## Dependências

- **@angular/core**: ^20.1.0
- **@angular/common**: ^20.1.0
- **xlsx**: ^0.18.5 (para exportação Excel)
- **bootstrap**: ^5.3.8 (para estilização)
- **bootstrap-icons**: ^1.13.1 (para ícones)

## Arquivos do Componente

```
kml-upload/
├── kml-upload.component.ts      # Lógica do componente
├── kml-upload.component.html    # Template HTML
├── kml-upload.component.css     # Estilos
└── README.md                    # Documentação
```

## Interface de Dados

```typescript
interface LocalData {
  nome: string;      // Nome do local
  endereco: string;  // Endereço completo
  turno: string;     // Turno de funcionamento
}
```

## Signals Utilizados

- `isProcessing`: Indica se o arquivo está sendo processado
- `errorMessage`: Mensagem de erro (se houver)
- `successMessage`: Mensagem de sucesso
- `extractedData`: Array com os dados extraídos
- `fileName`: Nome do arquivo selecionado

## Tratamento de Erros

O componente trata os seguintes erros:
- Arquivo com extensão inválida
- Arquivo KML corrompido ou inválido
- Erro ao ler o arquivo
- Erro ao processar XML
- Erro ao exportar para Excel

## Melhorias Futuras

- [ ] Suporte para múltiplos arquivos
- [ ] Validação de coordenadas geográficas
- [ ] Exportação para outros formatos (CSV, JSON)
- [ ] Edição inline dos dados extraídos
- [ ] Filtros e busca na tabela
- [ ] Visualização em mapa dos locais
- [ ] Importação de dados adicionais personalizados

## Autor

Desenvolvido para o sistema Pegons App Roteamentos
