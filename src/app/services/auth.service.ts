import { Injectable, signal } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(private auth: Auth) {
    // Monitora mudanças no estado de autenticação
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      this.isAuthenticated.set(!!user);
    });
  }

  /**
   * Login com email e senha
   */
  async loginWithEmail(email: string, password: string): Promise<void> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      this.currentUser.set(credential.user);
      this.isAuthenticated.set(true);
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Login com Google
   */
  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      this.currentUser.set(credential.user);
      this.isAuthenticated.set(true);
    } catch (error: any) {
      console.error('Erro ao fazer login com Google:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  /**
   * Traduz códigos de erro do Firebase
   */
  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Email já está em uso',
      'auth/weak-password': 'Senha muito fraca',
      'auth/invalid-email': 'Email inválido',
      'auth/popup-closed-by-user': 'Login cancelado pelo usuário',
      'auth/cancelled-popup-request': 'Solicitação de login cancelada'
    };

    return errorMessages[errorCode] || 'Erro ao autenticar';
  }
}
