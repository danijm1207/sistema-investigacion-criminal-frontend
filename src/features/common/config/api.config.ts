import Cookies from 'js-cookie';

export type BackendTarget = 'java' | 'scala' | 'kotlin';

export interface BackendOption {
  key: BackendTarget;
  name: string;
  defaultHost: string;
  envHost?: string;
  port: number;
}

export const BACKEND_TARGETS: Record<BackendTarget, BackendOption> = {
  java: {
    key: 'java',
    name: 'Java (Javalin 6)',
    defaultHost: 'http://localhost:8081',
    envHost: process.env.NEXT_PUBLIC_API_HOST_JAVA,
    port: 8081,
  },
  scala: {
    key: 'scala',
    name: 'Scala 3 (Javalin 6)',
    defaultHost: 'http://localhost:8082',
    envHost: process.env.NEXT_PUBLIC_API_HOST_SCALA,
    port: 8082,
  },
  kotlin: {
    key: 'kotlin',
    name: 'Kotlin (Javalin 6)',
    defaultHost: 'http://localhost:8083',
    envHost: process.env.NEXT_PUBLIC_API_HOST_KOTLIN,
    port: 8083,
  },
};

export const BACKEND_STORAGE_KEY = 'cr_selected_backend';
export const TOKEN_COOKIE_NAME = 'cr_token';

/**
 * Determina si el selector interactivo de backends está activado mediante variable de entorno.
 */
export const isBackendSwitcherEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_ENABLE_BACKEND_SWITCHER === 'true';
};

/**
 * Obtiene el backend seleccionado actualmente (por defecto 'java').
 */
export const getSelectedBackend = (): BackendTarget => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(BACKEND_STORAGE_KEY) as BackendTarget;
    if (saved && BACKEND_TARGETS[saved]) {
      return saved;
    }
  }
  return 'java';
};

/**
 * Retorna la URL del host correspondiente al backend especificado.
 */
export const getBackendHost = (target: BackendTarget): string => {
  const config = BACKEND_TARGETS[target];
  return (config?.envHost || config?.defaultHost || 'http://localhost:8081').replace(/\/+$/, '');
};

/**
 * Retorna la URL activa del backend. Si el switcher está habilitado, respeta la selección
 * guardada en el cliente; de lo contrario usa NEXT_PUBLIC_API_HOST o el puerto por defecto de Java (8081).
 */
export const getApiHost = (): string => {
  if (isBackendSwitcherEnabled()) {
    const selected = getSelectedBackend();
    return getBackendHost(selected);
  }
  return (process.env.NEXT_PUBLIC_API_HOST || BACKEND_TARGETS.java.defaultHost).replace(/\/+$/, '');
};

/**
 * Constante para compatibilidad hacia atrás
 */
export const API_HOST = process.env.NEXT_PUBLIC_API_HOST || BACKEND_TARGETS.java.defaultHost;

/**
 * Cambia el backend activo: guarda la selección, revoca la sesión activa (borra token y cache)
 * y recarga la aplicación.
 */
export const switchBackend = (target: BackendTarget): void => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(BACKEND_STORAGE_KEY, target);
  Cookies.remove(TOKEN_COOKIE_NAME, { path: '/' });
  localStorage.removeItem('crime_report_user_override');

  window.location.reload();
};
