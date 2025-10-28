// Copie este arquivo para environment.ts e environment.prod.ts
// e substitua os valores de exemplo pelas suas credenciais reais
export const environment = {
  production: false,
  googleMapsApiKey: 'SUA_API_KEY_AQUI',
  googleDrive: {
    clientId: 'SEU_CLIENT_ID_AQUI.apps.googleusercontent.com',
    apiKey: 'SUA_API_KEY_AQUI', // Pode ser a mesma do Google Maps
    scopes: 'https://www.googleapis.com/auth/drive.file',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
  },
  firebase: {
    apiKey: 'SUA_FIREBASE_API_KEY',
    authDomain: 'seu-projeto.firebaseapp.com',
    projectId: 'seu-projeto-id',
    storageBucket: 'seu-projeto.appspot.com',
    messagingSenderId: '123456789',
    appId: 'seu-app-id'
  }
};
