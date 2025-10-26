# 📖 Sobre o Projeto

## Geocodificador de Endereços

Este é um aplicativo web desenvolvido em Angular que permite geocodificar endereços em massa a partir de arquivos Excel.

## 🎯 Objetivo

Facilitar a obtenção de coordenadas geográficas (latitude e longitude) para múltiplos endereços de forma rápida e eficiente, utilizando a API de Geocodificação do Google Maps.

## 💼 Casos de Uso

- **Logística**: Plotar rotas de entrega em mapas
- **Recursos Humanos**: Mapear localização de funcionários
- **Marketing**: Análise geográfica de clientes
- **Educação**: Localizar endereços de alunos
- **Saúde**: Mapear pacientes ou unidades de atendimento
- **Pesquisa**: Análise espacial de dados

## 🏗️ Arquitetura

### Frontend
- **Framework**: Angular 20.1.0
- **Linguagem**: TypeScript
- **UI Framework**: Bootstrap 5
- **Ícones**: Bootstrap Icons
- **Fonte**: Montserrat (Google Fonts)

### Bibliotecas Principais
- **xlsx**: Leitura e escrita de arquivos Excel
- **file-saver**: Download de arquivos no navegador
- **RxJS**: Programação reativa

### API Externa
- **Google Maps Geocoding API**: Conversão de endereços em coordenadas

### Hospedagem
- **Firebase Hosting**: Deploy e hospedagem do app

## 📁 Estrutura de Arquivos

```
roteamento/
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   └── address.model.ts       # Interfaces TypeScript
│   │   ├── services/
│   │   │   └── google-geocode.service.ts  # Service de geocodificação
│   │   ├── app.ts                     # Componente principal (lógica)
│   │   ├── app.html                   # Template HTML
│   │   ├── app.css                    # Estilos do componente
│   │   ├── app.config.ts              # Configuração do app
│   │   └── app.routes.ts              # Rotas
│   ├── environments/
│   │   ├── environment.example.ts     # Template de configuração
│   │   ├── environment.ts             # Config dev (gitignored)
│   │   └── environment.prod.ts        # Config prod (gitignored)
│   ├── styles.css                     # Estilos globais
│   └── index.html                     # HTML principal
├── firebase.json                      # Config Firebase Hosting
├── .firebaserc                        # Projeto Firebase
├── angular.json                       # Config Angular CLI
├── package.json                       # Dependências npm
├── README.md                          # Documentação principal
├── INICIO_RAPIDO.md                   # Guia rápido
├── FORMATO_EXCEL.md                   # Formato de dados
├── CONFIGURACAO_FIREBASE.md           # Deploy Firebase
├── CHECKLIST.md                       # Checklist de verificação
└── exemplo.csv                        # Arquivo de exemplo
```

## 🔄 Fluxo de Funcionamento

1. **Upload**: Usuário seleciona arquivo Excel (.xlsx)
2. **Leitura**: App lê o arquivo usando a biblioteca xlsx
3. **Validação**: Verifica se as colunas necessárias existem
4. **Conversão**: Converte Excel para JSON
5. **Geocodificação**: Para cada endereço:
   - Faz requisição à API do Google Maps
   - Aguarda resposta (com delay para não sobrecarregar)
   - Armazena coordenadas ou erro
   - Atualiza interface em tempo real
6. **Visualização**: Exibe resultados em tabela
7. **Exportação**: Permite download em CSV com coordenadas

## 🔐 Segurança Implementada

- ✅ API Keys em arquivos de environment (não versionados)
- ✅ Arquivos sensíveis no .gitignore
- ✅ Validação de entrada de dados
- ✅ Tratamento de erros
- ✅ Uso de HTTPS (Firebase Hosting)

## 🚀 Performance

- **Delay entre requisições**: 200ms (evita rate limiting)
- **Processamento assíncrono**: Não trava a interface
- **Feedback em tempo real**: Barra de progresso
- **Build otimizado**: ~227KB (gzipped)

## 🎨 Design

- **Responsivo**: Funciona em desktop, tablet e mobile
- **Moderno**: Interface limpa com Bootstrap 5
- **Acessível**: Uso de semântica HTML adequada
- **Intuitivo**: Fluxo claro e instruções visíveis

## 📊 Dados Processados

### Entrada (Excel)
```
nome, endereco, turno
```

### Saída (CSV)
```
nome, endereco, turno, latitude, longitude, status, erro
```

## 🔧 Tecnologias e Padrões

- **Signals**: Gerenciamento de estado reativo (Angular 20)
- **Standalone Components**: Arquitetura moderna do Angular
- **Dependency Injection**: Injeção de dependências
- **Observables**: Programação reativa com RxJS
- **Async/Await**: Código assíncrono limpo
- **TypeScript**: Tipagem forte e segurança

## 📈 Possíveis Melhorias Futuras

- [ ] Cache de coordenadas já geocodificadas
- [ ] Suporte a múltiplos idiomas (i18n)
- [ ] Visualização em mapa interativo
- [ ] Exportação em outros formatos (JSON, XML)
- [ ] Processamento em lote com workers
- [ ] Histórico de geocodificações
- [ ] Autenticação de usuários
- [ ] Banco de dados para persistência
- [ ] API própria para geocodificação
- [ ] Testes unitários e E2E

## 🤝 Contribuindo

Este projeto está aberto para contribuições. Algumas áreas onde você pode ajudar:

- Melhorias na interface
- Otimizações de performance
- Novos recursos
- Correção de bugs
- Documentação
- Testes

## 📝 Licença

MIT License - Sinta-se livre para usar, modificar e distribuir.

## 👨‍💻 Desenvolvimento

Desenvolvido seguindo as melhores práticas do Angular:
- Clean Code
- SOLID Principles
- Separation of Concerns
- DRY (Don't Repeat Yourself)
- Component-based Architecture

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação nos arquivos .md
2. Verifique o CHECKLIST.md
3. Revise os logs do console do navegador
4. Verifique a configuração da API Key

## 🎓 Aprendizado

Este projeto é uma excelente oportunidade para aprender:
- Angular moderno (v20+)
- Integração com APIs externas
- Manipulação de arquivos no navegador
- TypeScript avançado
- Deploy em Firebase
- Bootstrap e design responsivo

---

**Versão**: 1.0.0  
**Data**: Outubro 2025  
**Framework**: Angular 20.1.0
