# 🗺️ Google Routes API - Componente de Cálculo de Rotas

## ✨ Funcionalidade Implementada

Componente completo para calcular rotas usando a **Google Routes API (v2)**, com suporte a:
- Cálculo de rotas simples (origem → destino)
- Pontos intermediários (waypoints)
- Rotas alternativas
- Opções de evitar pedágios, rodovias e balsas
- Exportação de rotas
- Integração com Google Maps

## 🎯 Como Usar

### Acessar o Componente

1. Inicie o servidor: `ng serve`
2. Acesse: http://localhost:4200/rotas
3. Ou clique em **"Calcular Rotas"** no menu de navegação

### ✨ Validação Automática de Endereços

O componente valida automaticamente todos os endereços antes de calcular a rota:

**Validação em Tempo Real:**
- Ao sair do campo (blur), o endereço é validado com a Geocoding API
- ✅ **Ícone verde**: Endereço válido e encontrado
- ❌ **Ícone vermelho**: Endereço inválido ou não encontrado
- 🔄 **Spinner**: Validando endereço...

**Validação Completa ao Calcular:**
- Antes de calcular a rota, TODOS os endereços são validados
- Origem, destino e waypoints são verificados em paralelo
- Se algum endereço for inválido, a mensagem de erro mostra qual(is)
- Apenas após validação bem-sucedida, a rota é calculada

### Calcular uma Rota Simples

1. **Origem**: Digite o endereço de partida
   - Ex: "Av. Paulista, 1000 - São Paulo, SP"
2. **Destino**: Digite o endereço de chegada
   - Ex: "Rua Augusta, 500 - São Paulo, SP"
3. Clique em **"Calcular Rota"**

### Adicionar Pontos Intermediários

1. Preencha origem e destino
2. Digite um endereço no campo "Pontos Intermediários"
3. Clique no botão **+** ou pressione Enter
4. Adicione quantos pontos quiser
5. Clique em **"Calcular Rota"**

### Opções Avançadas

- ☑️ **Mostrar rotas alternativas**: Calcula múltiplas opções de rota
- ☑️ **Evitar pedágios**: Prioriza rotas sem pedágios
- ☑️ **Evitar rodovias**: Usa vias locais
- ☑️ **Evitar balsas**: Evita travessias de balsa

### Visualizar Resultados

Após calcular, você verá:
- **Duração estimada** (considerando tráfego)
- **Distância total**
- **Detalhes por trecho** (se houver waypoints)
- **Avisos** (se houver restrições na rota)
- **Consumo de combustível** (quando disponível)

### Ações Disponíveis

- **Abrir no Google Maps**: Abre a rota no Google Maps em nova aba
- **KML**: Exporta rota em formato KML editável no Google My Maps
- **JSON**: Exporta dados estruturados da rota em JSON
- **Limpar**: Reseta o formulário

### 🛡️ Segurança e Validação

**Por que validar endereços?**

1. **Economia**: Evita chamadas desnecessárias à Routes API (que é mais cara)
2. **Feedback Rápido**: Usuário sabe imediatamente se o endereço está correto
3. **Melhor UX**: Mensagens claras sobre qual endereço está inválido
4. **Prevenção de Erros**: Não tenta calcular rotas com endereços inválidos

**Fluxo de Validação:**

```
1. Usuário digita endereço
2. Ao sair do campo → Geocoding API valida
3. Feedback visual instantâneo
4. Ao clicar "Calcular Rota":
   a. Valida TODOS os endereços em paralelo (forkJoin)
   b. Se algum inválido → Mostra erro específico
   c. Se todos válidos → Prossegue com Routes API
5. Calcula rota com endereços validados
```

## 🔧 Estrutura Técnica

### Arquivos Criados

```
src/app/
├── models/
│   └── route.model.ts              # Modelos de dados
├── services/
│   └── google-routes.service.ts    # Serviço da API
└── components/
    └── rotas/
        ├── rotas.component.ts      # Lógica do componente
        ├── rotas.html              # Template
        └── rotas.css               # Estilos
```

### Modelos de Dados

#### RouteRequest
```typescript
interface RouteRequest {
  origin: RouteWaypoint;
  destination: RouteWaypoint;
  intermediates?: RouteWaypoint[];
  travelMode?: 'DRIVE' | 'BICYCLE' | 'WALK' | 'TWO_WHEELER';
  routingPreference?: 'TRAFFIC_AWARE' | 'TRAFFIC_AWARE_OPTIMAL';
  computeAlternativeRoutes?: boolean;
  routeModifiers?: {
    avoidTolls?: boolean;
    avoidHighways?: boolean;
    avoidFerries?: boolean;
  };
}
```

#### Route (Resposta)
```typescript
interface Route {
  distanceMeters: number;
  duration: string;
  polyline: { encodedPolyline: string };
  legs: RouteLeg[];
  viewport: { low: {...}, high: {...} };
  warnings?: string[];
  description?: string;
}
```

### Serviço GoogleRoutesService

#### Métodos Principais

**`computeRoutes(request: RouteRequest)`**
- Método base que faz a requisição à API
- Retorna `Observable<RoutesResponse>`

**`calculateSimpleRoute(origin: string, destination: string)`**
- Calcula rota simples entre dois pontos
- Retorna `Observable<Route>`

**`calculateRouteWithWaypoints(origin, destination, waypoints[])`**
- Calcula rota com pontos intermediários
- Retorna `Observable<Route>`

**`calculateAlternativeRoutes(origin, destination)`**
- Calcula múltiplas rotas alternativas
- Retorna `Observable<Route[]>`

**`formatDuration(duration: string)`**
- Formata duração de "1234s" para "20 min"

**`formatDistance(meters: number)`**
- Formata distância de metros para "12.5 km"

### Exemplo de Uso do Serviço

```typescript
import { GoogleRoutesService } from './services/google-routes.service';

constructor(private routesService: GoogleRoutesService) {}

calcularRota() {
  this.routesService.calculateSimpleRoute(
    'Av. Paulista, 1000 - São Paulo, SP',
    'Rua Augusta, 500 - São Paulo, SP'
  ).subscribe({
    next: (route) => {
      console.log('Distância:', route.distanceMeters);
      console.log('Duração:', route.duration);
    },
    error: (error) => {
      console.error('Erro:', error.message);
    }
  });
}
```

## 🔑 Configuração da API

### 1. Habilitar a Routes API

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Vá em **APIs & Services** > **Library**
3. Procure por **"Routes API"**
4. Clique em **Enable**

### 2. Configurar API Key

A mesma API Key usada para Geocoding funciona para Routes API.

Verifique em `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  googleMapsApiKey: 'SUA_API_KEY_AQUI'
};
```

### 3. Permissões Necessárias

Certifique-se de que sua API Key tem permissão para:
- ✅ Routes API
- ✅ Geocoding API (opcional, mas recomendado)
- ✅ Maps JavaScript API (para visualização)

## 📊 Formato da Requisição

A API espera um corpo JSON no seguinte formato:

```json
{
  "origin": {
    "address": "Av. Paulista, 1000 - São Paulo, SP"
  },
  "destination": {
    "address": "Rua Augusta, 500 - São Paulo, SP"
  },
  "travelMode": "DRIVE",
  "routingPreference": "TRAFFIC_AWARE",
  "computeAlternativeRoutes": false,
  "routeModifiers": {
    "avoidTolls": false,
    "avoidHighways": false,
    "avoidFerries": false
  }
}
```

## 📈 Formato da Resposta

```json
{
  "routes": [
    {
      "distanceMeters": 12500,
      "duration": "1234s",
      "polyline": {
        "encodedPolyline": "encoded_string_here"
      },
      "legs": [
        {
          "distanceMeters": 12500,
          "duration": "1234s",
          "startLocation": {...},
          "endLocation": {...}
        }
      ],
      "viewport": {...},
      "warnings": []
    }
  ]
}
```

## 🎨 Interface do Usuário

### Layout

- **Coluna Esquerda (4 colunas)**: Formulário de configuração
- **Coluna Direita (8 colunas)**: Resultados e detalhes

### Cards de Rota

- Clique em um card para selecioná-lo
- Card selecionado fica destacado em azul
- Mostra duração, distância e avisos

### Tabela de Detalhes

- Exibe cada trecho da rota (legs)
- Mostra distância e duração por trecho
- Totaliza no rodapé

## 💡 Funcionalidades Extras

### Exportação de Rota

#### 📄 Exportar como JSON

Formato estruturado com todos os dados da rota:

```json
{
  "origin": "Endereço de origem",
  "destination": "Endereço de destino",
  "waypoints": ["Ponto 1", "Ponto 2"],
  "distance": "12.5 km",
  "duration": "20 min",
  "polyline": "encoded_polyline_string",
  "calculatedAt": "2025-10-27T12:00:00.000Z"
}
```

#### 🗺️ Exportar como KML (Google My Maps)

**O que é KML?**
- Formato XML usado pelo Google Earth e Google My Maps
- Permite visualizar e editar rotas no Google My Maps
- Inclui marcadores, linhas e estilos personalizados

**O que está incluído no KML:**

1. **Marcadores de Localização:**
   - 🟢 **Origem** (marcador verde)
   - 🟡 **Waypoints** (marcadores amarelos numerados)
   - 🔴 **Destino** (marcador vermelho)

2. **Linha da Rota:**
   - Traçado completo do percurso
   - Cor vermelha, espessura 4px
   - Segue o terreno (tessellate)

3. **Informações:**
   - Nome da rota
   - Descrição com data, distância e duração
   - Endereços completos em cada marcador

**Como usar o arquivo KML:**

1. Exporte a rota como KML
2. Acesse [Google My Maps](https://www.google.com/maps/d/)
3. Clique em "Criar novo mapa"
4. Clique em "Importar"
5. Selecione o arquivo `.kml` baixado
6. Pronto! A rota aparecerá editável no mapa

**Vantagens do KML:**
- ✅ Visualização profissional no Google My Maps
- ✅ Editável (pode mover marcadores, mudar cores, etc.)
- ✅ Compartilhável (pode enviar o link do mapa)
- ✅ Compatível com Google Earth
- ✅ Pode adicionar fotos, vídeos e descrições extras

### Integração com Google Maps

O botão "Abrir no Google Maps" constrói uma URL com:
- Origem e destino
- Waypoints (se houver)
- Abre em nova aba do navegador

## ⚠️ Tratamento de Erros

### Erros Comuns

**REQUEST_DENIED (403)**
- API Key inválida
- Routes API não habilitada
- Faturamento não configurado

**INVALID_REQUEST (400)**
- Endereços inválidos
- Formato de requisição incorreto

**ZERO_RESULTS**
- Nenhuma rota encontrada entre os pontos
- Endereços muito distantes ou inacessíveis

### Mensagens de Erro

O componente exibe mensagens amigáveis:
- ❌ "API Key inválida ou Routes API não habilitada"
- ❌ "Requisição inválida. Verifique os endereços"
- ❌ "Nenhuma rota encontrada"

## 💰 Custos

### Preços da Routes API (2025)

- **Compute Routes**: $5.00 por 1.000 requisições
- **Compute Route Matrix**: $10.00 por 1.000 elementos

### Crédito Gratuito

- Google oferece **$200 de crédito gratuito por mês**
- Com $200, você tem ~40.000 cálculos de rota gratuitos/mês

## 🔒 Segurança

### Boas Práticas

1. **Nunca** exponha a API Key no código cliente em produção
2. Configure **restrições de domínio** para a API Key
3. Configure **quotas** para evitar uso excessivo
4. Use **variáveis de ambiente** para armazenar a chave

### Restrições Recomendadas

No Google Cloud Console:
- **Application restrictions**: HTTP referrers (websites)
- **Allowed referrers**: `localhost:4200/*`, `seu-dominio.com/*`
- **API restrictions**: Routes API, Geocoding API

## 🚀 Melhorias Futuras

### Possíveis Extensões

1. **Visualização no Mapa**
   - Renderizar polyline no Google Maps
   - Mostrar marcadores de origem/destino/waypoints

2. **Salvar Rotas**
   - Persistir rotas calculadas no Firestore
   - Histórico de rotas

3. **Comparação de Rotas**
   - Comparar lado a lado rotas alternativas
   - Destacar diferenças de tempo/distância

4. **Otimização de Waypoints**
   - Reordenar waypoints para rota mais eficiente
   - Usar Optimization API

5. **Modos de Viagem**
   - Adicionar seletor para DRIVE, WALK, BICYCLE
   - Mostrar ícones diferentes por modo

## 📚 Referências

- [Google Routes API Documentation](https://developers.google.com/maps/documentation/routes)
- [Compute Routes Reference](https://developers.google.com/maps/documentation/routes/compute_route_directions)
- [API Pricing](https://developers.google.com/maps/billing-and-pricing/pricing)

## 🎉 Conclusão

O componente de rotas está totalmente funcional e pronto para uso! Ele oferece uma interface intuitiva para calcular rotas com a poderosa Google Routes API, incluindo suporte a waypoints, rotas alternativas e diversas opções de personalização.
