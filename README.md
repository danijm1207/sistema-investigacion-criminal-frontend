# Sistema de Investigación Criminal &mdash; Frontend Noir &amp; Benchmark

> Proyecto de Aula: Lenguajes y Paradigmas de Programación &amp; Desarrollo Web Full-Stack  
> Implementación del Frontend: **Next.js 14 (App Router), React 18, TypeScript estricto y Tailwind CSS (Estilo Expediente Forense Noir)**

---

## 1. Adaptación para la Comparativa de Lenguajes (Java, Scala, Kotlin)

En el marco del examen final de **Lenguajes y Paradigmas de Programación**, este frontend se adaptó para operar de forma transparente con cualquiera de las tres implementaciones funcionales del backend (Java 21, Scala 3 y Kotlin 2 sobre Javalin 6 y Jetty), respetando estrictamente el mismo contrato REST y esquema PostgreSQL.

### 1.1. Novedades y Capacidades Incorporadas

1. **Conexión Dinámica de Backend**:
   - `NEXT_PUBLIC_API_HOST`: URL base del backend por defecto (por defecto `http://localhost:8081` para Java).
   - Soporta alternancia entre los puertos de los tres contenedores Docker:
     * **Java**: `http://localhost:8081`
     * **Scala**: `http://localhost:8082`
     * **Kotlin**: `http://localhost:8083`

2. **Selector Interactivo de Backend en la Interfaz (Demostración y Sustentación)**:
   - Componente `BackendSwitcher` integrado en la barra de navegación (desktop y móvil).
   - Activado mediante `NEXT_PUBLIC_ENABLE_BACKEND_SWITCHER=true`.
   - Permite al evaluador alternar en caliente entre Java, Scala y Kotlin sin reiniciar el frontend. Al seleccionar otro backend, el sistema persiste la elección, revoca la sesión actual (`cr_token`) y recarga la interfaz para garantizar la integridad de las pruebas.

3. **Visualización de Imágenes desde `/uploads`**:
   - `next.config.js` autoriza los orígenes locales `http://localhost:8081`, `http://localhost:8082`, `http://localhost:8083` y `127.0.0.1` bajo `/uploads/**`.
   - Las imágenes adjuntas a casos, sospechosos y evidencias servidas desde los contenedores de los backends se visualizan de manera fluida y sin bloqueos de origen.

4. **Módulo Privado de Resultados de Benchmark (`/benchmark`)**:
   - Ruta protegida exclusivamente para usuarios con rol `ADMIN` (gestionada en `middleware.ts` y en el cliente).
   - Lee la consolidación de métricas y clasificación desde `public/benchmark/ranking.json` (estructura canónica generada por el harness de medición en Python).
   - Muestra el lenguaje ganador, desglose por los 6 criterios de la rúbrica oficial (Tiempo de ejecución 25%, Consumo de memoria 20%, Rendimiento 20%, Calidad de código 15%, Confiabilidad 10%, Uso funcional 10%), gráficos de barras comparativos construidos con CSS/SVG nativo (sin librerías pesadas externas) y análisis de sensibilidad de pesos.

---

## 2. Variables de Entorno (`.env.local` / `.env.example`)

Configurar un archivo `.env.local` en la raíz del proyecto:

```env
# URL base del backend activo por defecto (sin barra final ni prefijo /api)
# Puertos estándar de los backends:
# - Java:   http://localhost:8081
# - Scala:  http://localhost:8082
# - Kotlin: http://localhost:8083
NEXT_PUBLIC_API_HOST=http://localhost:8081

# Habilitar selector dinámico de backend en la interfaz para sustentación y pruebas
NEXT_PUBLIC_ENABLE_BACKEND_SWITCHER=true

# URLs individuales de cada backend para el selector de demostración
NEXT_PUBLIC_API_HOST_JAVA=http://localhost:8081
NEXT_PUBLIC_API_HOST_SCALA=http://localhost:8082
NEXT_PUBLIC_API_HOST_KOTLIN=http://localhost:8083
```

---

## 3. Credenciales de Acceso Oficiales (Seed PostgreSQL)

Para la sustentación y verificación de los tres backends con base de datos PostgreSQL:

| Rol | Correo de Acceso | Contraseña | Alcance en la Interfaz |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@investigacion.test` | `Admin12345` | Acceso global a todos los casos, panel administrativo (`/admin`), desactivación de usuarios y acceso exclusivo al panel de resultados (`/benchmark`). |
| **USER** | `user@investigacion.test` | `User12345` | Acceso a expedientes propios, creación de evidencias y personas de interés. |

*(Nota: También se mantiene compatibilidad con las credenciales históricas `admin@forense.test` / `detective@forense.test` en caso de conexión con backends de desarrollo previo).*

---

## 4. Rutas y Vistas de la Aplicación

| Ruta | Acceso | Propósito y Capacidades |
| :--- | :--- | :--- |
| `/` | Público | Landing page institucional forense con presentación del sistema. |
| `/login` | Público (redirecciona a `/cases` si autenticado) | Inicio de sesión con cookie `cr_token` y selector de backend disponible. |
| `/register` | Público (redirecciona a `/cases` si autenticado) | Registro de agentes con rol predeterminado `USER`. |
| `/cases` | Privado (`USER` y `ADMIN`) | Listado de expedientes criminales con filtros combinados (`q`, `status`, `from`, `to`), paginación y tarjetas. |
| `/cases/new` | Privado (`USER` y `ADMIN`) | Formulario de apertura de caso con subida de fotografía adjunta a `/api/uploads`. |
| `/cases/[id]` | Privado (`USER` y `ADMIN`) | Detalle de expediente: ficha técnica, registro fotográfico, personas de interés y módulo de evidencias. |
| `/cases/[id]/edit` | Privado (`USER` y `ADMIN`) | Edición de la información del caso y actualización de estado (`OPEN`, `IN_PROGRESS`, `CLOSED`). |
| `/admin` | Privado (Exclusivo `ADMIN`) | Gestión y desactivación de agentes (`DELETE /api/users/:id`). |
| `/benchmark` | Privado (Exclusivo `ADMIN`) | Informe y visualización técnica del ranking de la comparativa de lenguajes (Java, Scala, Kotlin). |

---

## 5. Estructura del Proyecto

```
├── app/                        # Rutas de Next.js App Router en la raíz del repositorio
│   ├── admin/                  # Panel administrativo (/admin)
│   ├── benchmark/              # Panel privado de resultados de benchmark (/benchmark)
│   ├── cases/                  # Rutas de expedientes criminales (/cases, /cases/new, /cases/[id], etc.)
│   ├── login/                  # Inicio de sesión (/login)
│   ├── register/               # Registro de usuarios (/register)
│   ├── globals.css             # Tokens CSS noir, variables cromáticas y estilos globales
│   ├── layout.tsx              # Layout raíz con AuthProvider, Navbar y Footer
│   ├── not-found.tsx           # Vista 404 personalizada
│   └── page.tsx                # Landing page principal (/)
├── middleware.ts               # Protección perimetral de rutas (requiere JWT y roles ADMIN)
├── public/
│   └── benchmark/
│       └── ranking.json        # Datos consolidados del ranking generados por el harness
└── src/
    └── features/               # Módulos de dominio desacoplados
        ├── admin/              # Panel administrativo: admin.service.ts y hook useAdminUsers
        ├── auth/               # Autenticación: AuthProvider, useAuth, cookies y servicios
        ├── cases/              # Dominio de casos: servicios, hooks, filtros y vistas
        ├── suspects/           # Personas de interés y sospechosos
        ├── evidences/          # Evidencias forenses
        └── common/             # Utilidades transversales:
            ├── components/     # Button, Input, Modal, BackendSwitcher, Navbar, ThemeToggle...
            ├── config/         # api.config.ts (gestión de hosts, switcher y cookies)
            ├── domain/         # Tipos y discriminador de errores (ApiError)
            ├── hooks/          # useImageUpload, useTheme
            └── http/           # http-client.ts desacoplado con inyección dinámica de host y token
```

---

## 6. Instalación y Ejecución Local

1. Instalar dependencias exactas:
   ```bash
   npm ci
   ```
2. Ejecutar linter y formateador:
   ```bash
   npm run lint
   npm run format:check
   ```
3. Construir la versión de producción:
   ```bash
   npm run build
   ```
4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Abrir en el navegador: [http://localhost:3000](http://localhost:3000).
