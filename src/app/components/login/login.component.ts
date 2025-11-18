import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>🔐 Login</h2>
        
        @if (errorMessage()) {
          <div class="alert alert-danger">
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="loginWithEmail()">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              class="form-control"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="seu@email.com"
            >
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <input 
              type="password" 
              id="password" 
              class="form-control"
              [(ngModel)]="password"
              name="password"
              required
              placeholder="••••••••"
            >
          </div>

          <button 
            type="submit" 
            class="btn btn-primary w-100"
            [disabled]="loading()"
          >
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2"></span>
            }
            Entrar
          </button>
        </form>

        <div class="divider">ou</div>

        <button 
          class="btn btn-outline-secondary w-100"
          (click)="loginWithGoogle()"
          [disabled]="loading()"
        >
          <i class="bi bi-google me-2"></i>
          Entrar com Google
        </button>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      max-width: 400px;
      width: 100%;
    }

    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #555;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
      border: none;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-outline-secondary {
      background: white;
      border: 1px solid #ddd;
      color: #555;
    }

    .btn-outline-secondary:hover:not(:disabled) {
      background: #f8f9fa;
      border-color: #999;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .w-100 {
      width: 100%;
    }

    .divider {
      text-align: center;
      margin: 20px 0;
      color: #999;
      position: relative;
    }

    .divider::before,
    .divider::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 40%;
      height: 1px;
      background: #ddd;
    }

    .divider::before {
      left: 0;
    }

    .divider::after {
      right: 0;
    }

    .alert {
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 20px;
    }

    .alert-danger {
      background: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  errorMessage = signal('');

  constructor(private authService: AuthService) {}

  async loginWithEmail(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMessage.set('Preencha todos os campos');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.loginWithEmail(this.email, this.password);
    } catch (error: any) {
      this.errorMessage.set(error.message);
    } finally {
      this.loading.set(false);
    }
  }

  async loginWithGoogle(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.loginWithGoogle();
    } catch (error: any) {
      this.errorMessage.set(error.message);
    } finally {
      this.loading.set(false);
    }
  }
}
