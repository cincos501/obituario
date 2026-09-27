import { isSupabaseConfigured, supabase } from './supabase';

export type UserRole = 'super_admin' | 'family_owner' | 'guest';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  memorialSlug?: string;
  createdAt: string;
}

const STORAGE_KEY = 'hobituario_auth_session_v1';
const USERS_STORAGE_KEY = 'hobituario_users_db_v1';

// Cuentas predefinidas del sistema (Super Admin)
const DEFAULT_USERS: { email: string; password: string; user: AuthUser }[] = [
  {
    email: 'admin@hobituario.com',
    password: 'admin123',
    user: {
      id: 'usr-admin-1',
      email: 'admin@hobituario.com',
      role: 'super_admin',
      name: 'Super Admin (Dueño de la Plataforma)',
      createdAt: '2026-01-01T00:00:00Z',
    },
  },
];

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initFromStorage();
    }
  }

  private initFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading auth session from storage', e);
    }
  }

  private getUsersDb(): { email: string; password: string; user: AuthUser }[] {
    if (typeof window === 'undefined') return DEFAULT_USERS;
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
      }
      const existing: { email: string; password: string; user: AuthUser }[] = JSON.parse(raw);
      // Asegurar que las cuentas por defecto siempre existan
      let updated = false;
      const combined = [...existing];
      DEFAULT_USERS.forEach((def) => {
        const found = combined.find((u) => u.email.toLowerCase() === def.email.toLowerCase());
        if (!found) {
          combined.push(def);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(combined));
      }
      return combined;
    } catch {
      return DEFAULT_USERS;
    }
  }

  private saveUsersDb(users: { email: string; password: string; user: AuthUser }[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }

  getCurrentUser(): AuthUser | null {
    if (!this.currentUser && typeof window !== 'undefined') {
      this.initFromStorage();
    }
    return this.currentUser;
  }

  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'super_admin';
  }

  canManageMemorial(slug: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return user.role === 'family_owner' && user.memorialSlug === slug;
  }

  async login(identifier: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Integración con Supabase Auth si está configurado
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanId,
          password: cleanPass,
        });

        if (!error && data?.user) {
          const role = (data.user.user_metadata?.role as UserRole) || 'family_owner';
          const memorialSlug = data.user.user_metadata?.memorialSlug;
          const user: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanId,
            role,
            name: data.user.user_metadata?.name || 'Usuario',
            memorialSlug,
            createdAt: data.user.created_at,
          };
          this.setCurrentSession(user);
          return { success: true, user };
        }
      } catch (err) {
        console.warn('Supabase auth attempt failed, checking local credentials:', err);
      }
    }

    // 2. Autenticación Local Instantánea (Sin fricción ni esperas de correo)
    const db = this.getUsersDb();
    const found = db.find(
      (u) =>
        (u.email.toLowerCase() === cleanId ||
          (u.user.memorialSlug && u.user.memorialSlug.toLowerCase() === cleanId)) &&
        u.password === cleanPass
    );

    if (found) {
      this.setCurrentSession(found.user);
      return { success: true, user: found.user };
    }

    return {
      success: false,
      error: 'Credenciales inválidas. Revisa el correo/código y contraseña ingresados.',
    };
  }

  registerFamilyUser(params: {
    email: string;
    name: string;
    memorialSlug: string;
    password?: string;
  }): { user: AuthUser; generatedPassword: string } {
    const db = this.getUsersDb();
    const generatedPassword = params.password || 'hob-' + Math.floor(1000 + Math.random() * 9000);

    const newUser: AuthUser = {
      id: 'usr-' + Date.now(),
      email: params.email.trim().toLowerCase(),
      name: params.name.trim(),
      role: 'family_owner',
      memorialSlug: params.memorialSlug,
      createdAt: new Date().toISOString(),
    };

    // Actualizar base de usuarios locales
    const filtered = db.filter((u) => u.email.toLowerCase() !== newUser.email);
    filtered.push({
      email: newUser.email,
      password: generatedPassword,
      user: newUser,
    });
    this.saveUsersDb(filtered);

    return { user: newUser, generatedPassword };
  }

  logout(): void {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    this.notifyListeners(null);
  }

  private setCurrentSession(user: AuthUser): void {
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
    this.notifyListeners(user);
  }

  subscribe(listener: (user: AuthUser | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.getCurrentUser());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(user: AuthUser | null): void {
    this.listeners.forEach((listener) => {
      try {
        listener(user);
      } catch (err) {
        console.error('Error notifying auth listener', err);
      }
    });
  }
}

export const authService = new AuthService();
