# 📊 Formato do Arquivo Excel

## Estrutura Necessária

O arquivo Excel (.xlsx) deve conter **exatamente** estas três colunas:

| Coluna | Tipo | Descrição | Exemplo |
|--------|------|-----------|---------|
| `nome` | Texto | Nome da pessoa ou local | João Silva |
| `endereco` | Texto | Endereço completo | Av. Paulista 1578 - São Paulo - SP |
| `turno` | Texto | Turno ou período | Manhã |

## ⚠️ Importante

- **Nomes das colunas**: Devem ser exatamente `nome`, `endereco` e `turno` (minúsculas, sem acentos)
- **Formato**: Arquivo deve ser `.xlsx` (Excel moderno)
- **Primeira linha**: Deve conter os cabeçalhos das colunas
- **Endereço**: Quanto mais completo, melhor a precisão da geocodificação

## ✅ Exemplo Correto

```
nome            | endereco                                  | turno
João Silva      | Av. Paulista 1578 - São Paulo - SP       | Manhã
Maria Santos    | Rua Augusta 2690 - São Paulo - SP        | Tarde
Pedro Oliveira  | Av. Ipiranga 344 - São Paulo - SP        | Noite
Ana Costa       | Rua da Consolação 2000 - São Paulo - SP  | Manhã
```

## ❌ Exemplos Incorretos

### Colunas com nomes diferentes
```
Nome            | Endereço                                  | Período
João Silva      | Av. Paulista 1578 - São Paulo - SP       | Manhã
```
❌ Não vai funcionar! Use `nome`, `endereco` e `turno`

### Endereço incompleto
```
nome            | endereco          | turno
João Silva      | Av. Paulista      | Manhã
```
⚠️ Pode não encontrar coordenadas precisas

### Arquivo .xls (Excel antigo)
❌ Use apenas `.xlsx`

## 💡 Dicas para Melhor Geocodificação

### Formato de Endereço Recomendado
```
[Logradouro] [Número] - [Bairro] - [Cidade] - [Estado]
```

Exemplos:
- ✅ `Av. Paulista 1578 - Bela Vista - São Paulo - SP`
- ✅ `Rua Augusta 2690 - Consolação - São Paulo - SP`
- ✅ `Praça da Sé s/n - Centro - São Paulo - SP`

### Incluir CEP (opcional mas recomendado)
```
Av. Paulista 1578 - São Paulo - SP - CEP 01310-200
```

### Pontos de Referência
Se o endereço for difícil de encontrar, adicione referências:
```
Rua das Flores 123 - próximo ao Shopping Center - São Paulo - SP
```

## 🔄 Convertendo CSV para XLSX

Se você tem um arquivo CSV:

1. Abra o arquivo `exemplo.csv` no Excel
2. Vá em "Arquivo" > "Salvar Como"
3. Escolha o formato "Excel Workbook (.xlsx)"
4. Salve

Ou use ferramentas online:
- https://convertio.co/pt/csv-xlsx/
- https://www.zamzar.com/convert/csv-to-xlsx/

## 📥 Arquivo de Exemplo

O projeto inclui um arquivo `exemplo.csv` que você pode usar como referência.

Para convertê-lo em Excel:
1. Abra `exemplo.csv` no Excel
2. Salve como `.xlsx`
3. Faça upload no app

## 🎯 Resultado Esperado

Após o processamento, você receberá um CSV com estas colunas adicionais:

| nome | endereco | turno | latitude | longitude | status | erro |
|------|----------|-------|----------|-----------|--------|------|
| João Silva | Av. Paulista 1578... | Manhã | -23.5613 | -46.6565 | Sucesso | |
| Maria Santos | Rua Augusta 2690... | Tarde | -23.5558 | -46.6619 | Sucesso | |

## ❓ Problemas Comuns

### "O arquivo deve conter as colunas: nome, endereco e turno"
- Verifique se os nomes das colunas estão corretos (minúsculas, sem acentos)
- Certifique-se de que a primeira linha contém os cabeçalhos

### Alguns endereços retornam erro
- Verifique se o endereço está completo
- Tente adicionar mais informações (cidade, estado, CEP)
- Alguns endereços podem não existir na base do Google Maps

### "O arquivo Excel está vazio"
- Certifique-se de que há dados além do cabeçalho
- Verifique se salvou o arquivo corretamente
