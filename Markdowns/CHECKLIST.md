# ✅ Checklist de Configuração e Deploy

Use este checklist para garantir que tudo está configurado corretamente.

## 📋 Antes de Começar

- [ ] Node.js instalado (versão 18 ou superior)
- [ ] npm instalado
- [ ] Angular CLI instalado globalmente (`npm install -g @angular/cli`)
- [ ] Conta no Google Cloud Platform
- [ ] Conta no Firebase (opcional, para deploy)

## 🔧 Configuração Inicial

- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `src/environments/environment.ts` criado
- [ ] Arquivo `src/environments/environment.prod.ts` criado
- [ ] API Key do Google Maps obtida
- [ ] API Key configurada em ambos os arquivos de environment
- [ ] Geocoding API ativada no Google Cloud Console

## 🧪 Teste Local

- [ ] Build de desenvolvimento funciona (`ng build --configuration development`)
- [ ] Servidor de desenvolvimento inicia (`npm start`)
- [ ] App abre no navegador (http://localhost:4200/)
- [ ] Upload de arquivo Excel funciona
- [ ] Geocodificação retorna coordenadas
- [ ] Exportação de CSV funciona
- [ ] Não há erros no console do navegador

## 🏗️ Build de Produção

- [ ] Build de produção funciona (`ng build --configuration production`)
- [ ] Pasta `dist/roteamento/browser/` foi criada
- [ ] Arquivos estão na pasta dist
- [ ] Não há erros de build

## 🔥 Deploy no Firebase (Opcional)

- [ ] Firebase CLI instalado (`npm install -g firebase-tools`)
- [ ] Login no Firebase realizado (`firebase login`)
- [ ] Projeto Firebase criado no console
- [ ] Arquivo `.firebaserc` configurado com o Project ID correto
- [ ] Arquivo `firebase.json` está correto
- [ ] Deploy realizado com sucesso (`firebase deploy`)
- [ ] URL do Firebase Hosting funciona
- [ ] App funciona corretamente na URL de produção

## 🔒 Segurança

- [ ] Arquivos `environment.ts` e `environment.prod.ts` estão no `.gitignore`
- [ ] API Key não está commitada no repositório
- [ ] Restrições de API Key configuradas no Google Cloud Console
- [ ] Domínios autorizados configurados (se aplicável)

## 📊 Teste de Funcionalidades

- [ ] Upload de arquivo .xlsx funciona
- [ ] Validação de colunas funciona (nome, endereco, turno)
- [ ] Mensagens de erro são exibidas corretamente
- [ ] Barra de progresso funciona
- [ ] Tabela de resultados é exibida
- [ ] Coordenadas são exibidas corretamente
- [ ] Status de sucesso/erro é mostrado
- [ ] Botão de exportar CSV funciona
- [ ] Arquivo CSV baixado contém os dados corretos
- [ ] Botão limpar funciona

## 🎨 Interface

- [ ] Bootstrap está carregando corretamente
- [ ] Fonte Montserrat está aplicada
- [ ] Ícones do Bootstrap Icons aparecem
- [ ] Layout é responsivo
- [ ] Cores e estilos estão corretos

## 📱 Teste em Diferentes Navegadores

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## 🐛 Solução de Problemas

Se algo não funcionar, verifique:

### Build falha
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### API não retorna coordenadas
- Verifique se a API Key está correta
- Verifique se a Geocoding API está ativada
- Verifique o console do navegador para erros
- Teste a API Key manualmente:
  ```
  https://maps.googleapis.com/maps/api/geocode/json?address=Av+Paulista+1578+Sao+Paulo&key=SUA_API_KEY
  ```

### Firebase deploy falha
```bash
# Verificar login
firebase login --reauth

# Verificar projeto
firebase projects:list

# Usar projeto específico
firebase use SEU_PROJECT_ID
```

### Página em branco após deploy
- Verifique o caminho em `firebase.json`: deve ser `dist/roteamento/browser`
- Verifique se o build foi feito antes do deploy
- Verifique o console do navegador para erros

## 📚 Documentação de Referência

- [README.md](README.md) - Documentação completa
- [INICIO_RAPIDO.md](INICIO_RAPIDO.md) - Guia de início rápido
- [FORMATO_EXCEL.md](FORMATO_EXCEL.md) - Formato do arquivo Excel
- [CONFIGURACAO_FIREBASE.md](CONFIGURACAO_FIREBASE.md) - Deploy no Firebase

## ✨ Pronto para Produção

Quando todos os itens estiverem marcados, seu app está pronto para uso em produção! 🎉
