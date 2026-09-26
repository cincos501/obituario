# 🕊️ Hobituario — Plataforma SaaS de Memoriales Digitales y Recuerdos Eternos

**Hobituario** es una plataforma web SaaS diseñada con sobriedad, respeto y calidez para preservar la memoria, anécdotas y homenajes de seres queridos. Permite a las familias gestionar ceremonias funerarias con mapas GPS, biografías cronológicas ilustradas, libros de recuerdos con velas y flores virtuales solemnes, y generación de códigos QR de alta resolución para lápidas y recordatorios físicos.

---

## 🌟 Características Principales

### 1. 🕯️ Memorial Web Público Solemne
- **Estética Conmovedora y Respetuosa:** Diseñado con tonalidades suaves marfil, olivo, sepia y noche solemne, eliminando cualquier distracción o publicidad.
- **Velas y Flores Virtuales con Cuotas por Plan:** Ofrendas interactivas con mensajes de afecto, relación familiar y fotos de recuerdos compartidos. Cuotas respetuosas:
  - **Plan Esencial:** Hasta 20 ofrendas de velas y flores.
  - **Plan Legado:** Hasta 40 ofrendas con fotografías adjuntas.
  - **Plan Infinito:** Hasta 80 ofrendas perpetuas.
- **Línea de Tiempo Cronológica:** Momentos trascendentes de vida (infancia, graduación, matrimonio, legado comunitario).
- **Música Ambiental de Capilla:** Acompañamiento instrumental sutil opcional con control de volumen y silencio.
- **Lápida Digital con Código QR:** Descarga en PDF e imagen de código QR vectorial para grabar en mármol, granito o tarjetas conmemorativas.
- **PWA (Progressive Web App):** Instalable en teléfonos celulares como app nativa para acceso perenne sin conexión.

### 2. 🏛️ Panel Familiar de Gestión (`/memorial/[slug]/admin`)
- **Modales de Edición Centrados:** Edita ceremonias e hitos de vida en ventanas emergentes modales sin perder la posición de lectura.
- **Encuadre y Recorte Fotográfico:** Guía de recorte circular para retratos de cabecera y recorte panorámico para la foto de portada, con selector de enfoque (Rostro/Arriba, Centro, Abajo).
- **8 Tipografías Solemnes Seleccionables:**
  1. *Cormorant Garamond* (Clásica y espiritual)
  2. *Cinzel Roman* (Inscripción de piedra y lápida)
  3. *Playfair Display* (Cálida y humana)
  4. *Lora Literaria* (Serena e intimista)
  5. *Merriweather Noble* (Sobria y académica)
  6. *Bodoni Moda* (Distinción aristocrática)
  7. *Montserrat* (Geométrica contemporánea)
  8. *Inter Sereno* (Limpia y de máxima legibilidad)
- **Mapa Interactivo con Click-to-Pin:** Haz clic en cualquier punto del mapa o arrastra el marcador para fijar la ubicación exacta de la capilla o el camposanto. Incluye recintos predeterminados de **Tarija** (Parroquia San Roque, Catedral, Santa Teresa, Cementerio General), **Sucre**, **La Paz**, **Cochabamba** y **Santa Cruz**.
- **Bandeja de Moderación Familiar:** Filtro automático de vocabulario inapropiado y aprobación manual de cada condolencia antes de su publicación.

### 3. 👑 Panel Super Admin de Plataforma (`/admin`)
- **Gestión 100% Comercial y SaaS:** Métricas de facturación acumulada en USD y Bs, memoriales totales y planes activos (sin invadir la privacidad de las familias ni moderar velas ajenas).
- **Registrador Rápido de Clientes:** Registra un nuevo comprador en 10 segundos indicando únicamente su nombre, correo, plan y PIN.
- **Generador de Accesos para WhatsApp con 1 Clic:** Copia el mensaje preformateado listo para enviar al cliente por WhatsApp con su enlace directo y credenciales de acceso.
- **Personalización de Cuotas Individuales:** Ajusta el límite de fotos, hitos, videos o almacenamiento por cliente según acuerdos particulares.

---

## 💎 Planes de Preservación Digital

| Beneficio | Plan Esencial (5 Años) | Plan Homenaje Legado (5 Años) | Plan Legado Infinito (Vitalicio) |
|---|:---:|:---:|:---:|
| **Precio** | **$19 USD / 135 Bs** | **$49 USD / 340 Bs** *(Popular)* | **$99 USD / 690 Bs** |
| **Ofrendas (Velas y Flores)** | **Hasta 20** | **Hasta 40** | **Hasta 80** |
| **Fotografías de Galería** | Hasta 5 | Hasta 35 | Ilimitadas |
| **Hitos de Línea de Tiempo** | Hasta 10 (Texto) | Hasta 15 (Con Fotos) | Hasta 25 (Álbum completo) |
| **Ceremonias con Mapa GPS** | Hasta 3 | Hasta 5 (Con Fotos de Capilla) | Hasta 10 |
| **Fotos en Velas Virtuales** | No | Sí (Recuerdos de Amigos) | Sí |
| **Videos y Audios de Voz** | No | No | Sí |
| **Tipografías y Paletas** | Estándar | 8 Tipografías + 4 Tonos | 8 Tipografías + 4 Tonos |
| **Código QR para Lápida** | Sí | Sí | Sí |
| **Panel Privado Familiar** | Sí | Sí | Sí |

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 16.3 (App Router, Turbopack, React 19)
- **Estilos:** Tailwind CSS v4 con variables semánticas HSL y fuentes Google Fonts optimizadas
- **Mapas:** Leaflet / OpenStreetMap (100% gratuito, sin necesidad de API keys de Google Maps)
- **Iconografía:** Lucide React
- **Base de Datos & Backend:** Supabase (PostgreSQL 15+) con fallback automático en LocalStorage
- **Despliegue:** Optimizado para Vercel

---

## 🚀 Puesta en Marcha Local

### 1. Clonar el Repositorio e Instalar Dependencias
```bash
git clone <URL_DE_TU_REPOSITORIO>
cd hobituario
npm install
```

### 2. Configurar Variables de Entorno (Opcional para Supabase)
Copia el archivo de ejemplo o crea un `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```
> *Nota: Si no configuras Supabase, el sistema funcionará automáticamente en modo local (LocalStorage) con datos de demostración precargados.*

### 3. Ejecutar en Servidor de Desarrollo
```bash
npm run dev
```
Abre tu navegador en `http://localhost:3000`.

---

## 🗄️ Configuración de Base de Datos en Supabase

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ve al **SQL Editor** en el panel de tu proyecto Supabase.
3. Copia y pega el contenido completo del archivo `supabase/schema.sql` (o `supabase_setup.sql` en la raíz).
4. Ejecuta el script. Se crearán automáticamente:
   - Tablas `profiles`, `obituaries`, `funeral_services`, `timeline_events`, `condolences_and_tributes`, `memory_media`.
   - Índices optimizados para slugs y búsquedas rápidas.
   - Triggers de recuento de velas y flores al aprobarse tributos.
   - Políticas de seguridad Row Level Security (RLS).
   - Datos semilla de demostración (Dr. Carlos Alberto Mendoza).

---

## ☁️ Despliegue en Vercel

### Paso 1: Subir a GitHub
```bash
git add .
git commit -m "feat: plataforma hobituario saas completa"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/hobituario.git
git push -u origin main
```

### Paso 2: Importar en Vercel
1. Ingresa a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..."** -> **"Project"**.
3. Selecciona tu repositorio `hobituario`.
4. En **Environment Variables**, añade:
   - `NEXT_PUBLIC_SUPABASE_URL`: Tu URL de Supabase (si aplica).
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Tu Anon Key de Supabase (si aplica).
5. Haz clic en **"Deploy"**. Vercel compilará la aplicación y la publicará en pocos segundos.

---

## 👥 Cuentas de Acceso Preconfiguradas para Pruebas

En la pantalla de inicio de sesión (`/login`), dispones de **acceso rápido con 1 solo clic** para probar los diferentes roles:

1. **👑 Administrador de Plataforma (Super Admin):**
   - Acceso: Botón directo "Acceder como Super Admin" o correo `admin@hobituario.com`
   - Función: Gestión de clientes, facturación, planes y generador de mensajes WhatsApp.
2. **🕊️ Familia Mendoza (Cliente Plan Legado):**
   - Acceso: Botón directo "Familia Mendoza" o PIN `1948`
   - Función: Administración del memorial de Dr. Carlos Alberto Mendoza Vega.
3. **⭐ Familia Valdivia (Cliente Plan Infinito):**
   - Acceso: PIN `2025`
4. **🌿 Familia Pérez (Cliente Plan Esencial):**
   - Acceso: PIN `1234`

---

## 📄 Licencia y Derechos

Desarrollado para la preservación digna de la memoria y la condolencia solemne.
© 2026 Hobituario. Todos los derechos reservados.
