import axios from 'axios';

interface LoginResponse {
  access_token: string;
}

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {
    // Initialize token from localStorage if it exists
    this.token = localStorage.getItem('jwt_token');
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await axios.post<LoginResponse>(`http://localhost:3000/auth/login`, {
        username,
        password,
      });

      const { access_token } = response.data;
      this.setToken(access_token);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('jwt_token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  private setToken(token: string): void {
    this.token = token;
    localStorage.setItem('jwt_token', token);
  }
}

export const authService = AuthService.getInstance(); 