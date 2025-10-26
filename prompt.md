Este app será hospedado no Firebase Hosting e terá as seguintes funcionalidades:

1. O app deve permitir que o usuário faça upload de um arquivo Excel (.xlsx) pelo navegador, usando um input do tipo "file".

2. Após o upload, o app deve ler o conteúdo do Excel usando a biblioteca "xlsx" e converter a primeira planilha em JSON. 
   Cada linha do Excel terá os campos nome, endereço, turno,  e a coluna chamada "endereco" será uma string com o endereço completo.

3. Para cada endereço lido, o app deve usar a API do Google Maps Geocoding para obter as coordenadas (latitude e longitude).
   - A função de busca deve ser assíncrona e tratar erros caso o endereço não seja encontrado.
   - A chave da API (apiKey) deve ficar em um arquivo de configuração (ex: environments.ts).
   - Use fetch() ou HttpClient para chamar a API: 
     https://maps.googleapis.com/maps/api/geocode/json?address=ENDERECO&key=SUA_API_KEY

4. O app deve exibir uma tabela com os endereços e suas respectivas coordenadas (lat/lng) após o processamento.

5. O app deve permitir que o usuário exporte o resultado (endereços + coordenadas) em formato CSV.
   - Use a biblioteca "xlsx" para gerar o CSV.
   - Use a biblioteca "file-saver" para permitir o download no navegador.

6. Estruture o código com boas práticas Angular:
   - Um service para a geocodificação (GoogleGeocodeService).
   - Um componente principal (AppComponent) com HTML simples.
   - Tipagem correta dos objetos.
   - Tratamento visual básico (mensagem de carregando, erro, sucesso etc).

7. Após o app estar pronto, inclua um README explicando como:
   - Instalar dependências (xlsx, file-saver, firebase-tools).
   - Colocar a API key no environment.
   - Fazer build e deploy no Firebase Hosting.

Dependências necessárias:
npm install xlsx file-saver

Ao final, o projeto deve permitir:
- Upload de Excel;
- Conversão para JSON;
- Geocodificação de cada endereço via Google Maps API;
- Exportação de CSV com latitude/longitude;
- Deploy simples no Firebase Hosting.
- O app deve permitir que o usuário exporte o resultado (endereços + coordenadas) em formato CSV.
- a API key deverá ficar em um arquivo de configuração (ex: environments.ts). e ignorada no git.
- use a font montserrat em todo o app.
- use o bootstrap para criar a interface.
- use o firebase para hospedar o app.


Crie o código completo e funcional.
