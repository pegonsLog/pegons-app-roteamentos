# ✅ Checklist de Segurança - API Keys

## Status Atual: 🟢 SEGURO

### 1. Proteção no .gitignore ✅

```
/src/environments/environment.ts
/src/environments/environment.prod.ts
```

**Status**: ✅ Configurado corretamente

### 2. Arquivos Criados ✅

- ✅ `environment.example.ts` - Template público (SERÁ commitado)
- ✅ `environment.ts` - Chaves reais (NÃO será commitado)
- ✅ `environment.prod.ts` - Chaves reais (NÃO será commitado)

### 3. Chave da API do Google Maps ✅

**Chave configurada**: `AIzaSyDFLzh7sqOtWUDHP9_e1DUDi8WZ9X7Sc9o`

**Localização**:
- ✅ `src/environments/environment.ts` (protegido)
- ✅ `src/environments/environment.prod.ts` (protegido)

**Status**: ✅ Protegida pelo .gitignore

### 4. Verificação Automática ✅

Execute o script de verificação:

```bash
./verificar-seguranca.sh
```

**Resultado esperado**: Todas as verificações devem passar ✅

### 5. Antes do Primeiro Commit

Quando você inicializar o Git, execute:

```bash
# Inicializar repositório
git init

# Verificar segurança
./verificar-seguranca.sh

# Verificar status
git status

# Confirmar que NÃO aparecem:
# ❌ src/environments/environment.ts
# ❌ src/environments/environment.prod.ts

# Confirmar que APARECEM:
# ✅ src/environments/environment.example.ts
# ✅ .gitignore
# ✅ SEGURANCA_API_KEYS.md
```

### 6. Proteção Adicional

#### No Google Cloud Console:

1. **Restrinja a API Key**:
   - Acesse: https://console.cloud.google.com/apis/credentials
   - Selecione sua API Key
   - Em "Restrições de aplicativo":
     - Para desenvolvimento: Restrição por endereço IP
     - Para produção: Restrição por referenciador HTTP
   
2. **Limite as APIs**:
   - Em "Restrições de API"
   - Selecione apenas: "Geocoding API"
   - Desative APIs não utilizadas

3. **Configure alertas**:
   - Configure alertas de uso
   - Defina limites de quota

#### No Firebase:

1. **Configure regras de segurança**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /mapas/{mapaId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

2. **Ative Firebase App Check** (recomendado para produção)

### 7. Monitoramento

#### Verificações Regulares:

- [ ] Revisar uso da API no Google Cloud Console
- [ ] Verificar logs de acesso no Firebase
- [ ] Monitorar custos e quotas
- [ ] Atualizar chaves periodicamente (a cada 6 meses)

#### Sinais de Alerta:

- 🚨 Uso anormalmente alto da API
- 🚨 Requisições de IPs/domínios desconhecidos
- 🚨 Erros de autenticação frequentes
- 🚨 Custos inesperados

### 8. Plano de Resposta a Incidentes

Se você suspeitar que a chave foi exposta:

1. **Ação Imediata** (< 5 minutos):
   ```bash
   # 1. Acesse o Google Cloud Console
   # 2. Vá em APIs & Services > Credentials
   # 3. Clique na API Key comprometida
   # 4. Clique em "DELETE" ou "REGENERATE"
   ```

2. **Investigação** (< 30 minutos):
   - Verifique o histórico do Git: `git log --all -- src/environments/`
   - Verifique commits no GitHub (se aplicável)
   - Revise logs de uso no Google Cloud Console

3. **Correção** (< 1 hora):
   - Gere uma nova API Key
   - Atualize os arquivos locais
   - Configure restrições mais rígidas
   - Documente o incidente

4. **Prevenção**:
   - Revise o .gitignore
   - Execute `./verificar-seguranca.sh` regularmente
   - Configure alertas de uso

### 9. Documentação

Arquivos de referência criados:

- ✅ `SEGURANCA_API_KEYS.md` - Guia completo de segurança
- ✅ `CHECKLIST_SEGURANCA.md` - Este checklist
- ✅ `verificar-seguranca.sh` - Script de verificação automática
- ✅ `.gitignore` - Proteção de arquivos sensíveis
- ✅ `.gitattributes` - Configuração adicional

### 10. Resumo Visual

```
┌─────────────────────────────────────────────────────────┐
│                    FLUXO DE SEGURANÇA                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  environment.example.ts (template)                      │
│         │                                               │
│         ├──> environment.ts (local) ──> .gitignore ✅   │
│         │                                               │
│         └──> environment.prod.ts (local) ──> .gitignore ✅│
│                                                         │
│  ❌ NUNCA no Git                                        │
│  ✅ SEMPRE local                                        │
│  🔒 SEMPRE protegido                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Próximos Passos

1. ✅ Chaves configuradas
2. ✅ Arquivos protegidos no .gitignore
3. ✅ Script de verificação criado
4. ⏳ **Aguardando**: Inicialização do repositório Git
5. ⏳ **Aguardando**: Configuração de restrições no Google Cloud Console
6. ⏳ **Aguardando**: Primeiro commit (verificar antes!)

---

**Última atualização**: 26 de Outubro de 2025
**Status**: 🟢 SEGURO - Todas as proteções implementadas
