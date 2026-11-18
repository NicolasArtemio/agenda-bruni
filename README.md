# Agenda Bruni

Una agenda de contactos multiusuario: regístrese, inicie sesión y administre sus propios contactos con búsqueda, filtros, favoritos y categorías de especialidades. Las especialidades se crean y administran por usuario: no se precargan ni se comparten globalmente. Está construida con Next.js 15 (App Router), React 19, Prisma 6, PostgreSQL en Neon, Zod, Tailwind CSS 4 y autenticación JWT.

## Requisitos

- Node.js 20 o superior
- npm
- Una cuenta de PostgreSQL en Neon (el plan gratuito alcanza)
- Una cuenta de Vercel (para el despliegue)

## Configuración local

1. Obtenga este proyecto en una carpeta local e ingrese a ella.
2. Instale las dependencias: `npm install`
3. Cree su archivo de entorno: `cp .env.example .env`
4. Complete las tres variables de `.env` con los valores de su proyecto de Neon (ver más abajo).
5. Cree el esquema de la base de datos: `npx prisma generate`, y luego `npx prisma migrate deploy`. No hay paso de precarga; cada usuario crea sus propias especialidades en tiempo de ejecución.
6. Inicie la aplicación: `npm run dev`.

## Variables de entorno

| Variable | Se usa para | Valor |
| --- | --- | --- |
| `DATABASE_URL` | Todas las consultas de la aplicación en tiempo de ejecución | Cadena de conexión **pooled** de Neon |
| `DIRECT_URL` | Migraciones de Prisma y Studio | Cadena de conexión **direct** de Neon |
| `JWT_SECRET` | Firma de tokens de sesión | Una cadena larga y aleatoria; genere una con `openssl rand -base64 32` |

Mantenga `.env` fuera del control de versiones. Ambas cadenas de conexión incluyen `?sslmode=require`.

## Creación de la base de datos en Neon

1. Inicie sesión en [neon.tech](https://neon.tech) y cree un proyecto.
2. Elija una región cercana a sus usuarios y una versión de PostgreSQL, y luego cree el proyecto.
3. En el panel del proyecto, abra **Connection Details** de la base de datos `neondb` (o cree su propia base de datos).
4. Copie la cadena de conexión **pooled** en `DATABASE_URL` y la cadena **direct** en `DIRECT_URL`. Reemplace el usuario y la contraseña de ejemplo por las credenciales reales. Confirme que ambas terminan con `?sslmode=require`.
5. Use la cadena agrupada para la aplicación y la directa para las migraciones. No son intercambiables: el agrupador está pensado para muchas conexiones breves de la aplicación, mientras que las migraciones necesitan una sesión directa.

## Configuración de la base de datos

```bash
npx prisma generate        # generar el Prisma Client
npx prisma migrate deploy  # crear las tablas a partir de las migraciones incluidas en el repositorio
```

No se usa ningún script de precarga: las cuentas y las especialidades se crean desde la aplicación. Para cambiar el esquema localmente, edite `prisma/schema.prisma` y ejecute `npm run db:migrate` para crear una nueva migración. Use `npm run db:studio` para explorar los datos en una interfaz local.

## Ejecutar localmente

```bash
npm run dev
```

Abra http://localhost:3000, registre un usuario y luego cree contactos desde la página Contactos. Fíltrelos por nombre, empresa, ciudad o especialidad; márquelos como favoritos y búsquelos en la página Favoritos. Use el enlace **Especialidades** de la navegación principal (`/specialties`) para agregar, renombrar y eliminar sus propias categorías.

## Especialidades

- Cada usuario autenticado administra sus propias especialidades; no hay una lista global precargada ni compartida.
- Hay exactamente un nivel: especialidades principales y sus subcategorías. El `parentId` de una subcategoría debe apuntar a una especialidad principal, no a otra subcategoría.
- Cree especialidades y subcategorías directamente desde el formulario de contacto o los filtros de contactos, o adminístrelas en la página `/specialties`. Ambos flujos llaman a `POST /api/specialties`; una solicitud de subcategoría incluye un `parentId`.
- Al eliminar una especialidad principal también se eliminan sus subcategorías y se limpia el `specialtyId` de los contactos que las usaban (`onDelete: Cascade` para las subcategorías, `SetNull` para los contactos).
- Los nombres duplicados de especialidades principales se rechazan sin distinguir mayúsculas en el código de la aplicación (`src/lib/specialties.ts`). La migración inicial también contiene un índice único parcial mantenido manualmente sobre `(userId, name) WHERE parentId IS NULL`, porque PostgreSQL considera distintos los valores NULL en un índice único compuesto.
- Si `prisma/migrations/20260101000000_init/migration.sql` llega a regenerarse desde el esquema, vuelva a agregar manualmente esa sentencia de índice parcial: Prisma no puede expresar índices parciales en `prisma/schema.prisma`.

## Scripts

| Script | Comando | Propósito |
| --- | --- | --- |
| `dev` | `next dev` | Iniciar el servidor de desarrollo |
| `build` | `prisma generate && next build` | Generar el Prisma Client y compilar para producción |
| `start` | `next start` | Servir la compilación de producción |
| `lint` | `eslint .` | Ejecutar ESLint |
| `typecheck` | `tsc --noEmit` | Verificar los tipos de TypeScript |
| `db:generate` | `prisma generate` | Regenerar el Prisma Client |
| `db:migrate` | `prisma migrate dev` | Crear y aplicar una migración local |
| `db:deploy` | `prisma migrate deploy` | Aplicar las migraciones incluidas en el repositorio |
| `db:studio` | `prisma studio` | Abrir Prisma Studio |

## Despliegue en Vercel

1. Importe el repositorio en Vercel. El comando de compilación ya está configurado en `package.json`: `prisma generate && next build`.
2. Agregue `DATABASE_URL`, `DIRECT_URL` y `JWT_SECRET` en **Project Settings → Environment variables**. Use valores de producción, no locales.
3. Aplique las migraciones antes de que la aplicación reciba tráfico. Ejecute `npx prisma migrate deploy` como un paso único de publicación/postdespliegue con las mismas variables de entorno, o cambie el comando de compilación a `prisma migrate deploy && next build`. Un paso de migración separado es más seguro porque una migración fallida no se convierte silenciosamente en una compilación fallida.
4. Vuelva a desplegar o ejecute el paso nuevamente cada vez que se agregue una migración.

Por qué importan dos conexiones en serverless: cada invocación de función es breve y puede abrir nuevas conexiones a la base de datos. El endpoint agrupado de Neon las enruta a través de un agrupador de transacciones para que la aplicación nunca agote el límite de conexiones de PostgreSQL. Las migraciones usan `DIRECT_URL` porque los cambios de esquema necesitan una sesión dedicada y funciones que el agrupador no admite.

## Estructura del proyecto

```text
prisma/
  migrations/20260101000000_init/migration.sql   esquema más el índice único parcial manual
  schema.prisma                                  modelos de la base de datos
src/
  app/
    (app)/                        páginas autenticadas: panel, contactos, favoritos, especialidades
      specialties/page.tsx        página de administración de especialidades por usuario
    (auth)/                       páginas de inicio de sesión y registro
    api/auth/                     endpoints de registro, inicio de sesión, cierre de sesión y me
    api/contacts/                 endpoints REST de contactos
    api/specialties/
      route.ts                    listar y crear especialidades
      [id]/route.ts               renombrar y eliminar especialidades
  components/
    auth/                         formularios de inicio de sesión y registro
    contacts/                     lista, tarjetas, formulario, filtros, favoritos, paginación
      specialty-picker.tsx        creación integrada de especialidades y subcategorías
    specialties/
      specialties-manager.tsx     agregar, renombrar y eliminar especialidades
    dashboard/                    estadísticas del panel
    layout/                       control de cierre de sesión
    ui/                           entradas, botones, tarjetas y etiquetas reutilizables
  lib/
    api-response.ts               helpers compartidos de respuestas de API
    auth.ts                       firma y verificación de JWT, opciones de cookie
    contacts.ts                   helpers compartidos de include y filtros
    prisma.ts                     singleton del Prisma Client
    session.ts                    helpers de sesión del lado del servidor
    specialties.ts                árbol de especialidades, controles de principal y unicidad
    validation/
      auth.ts, contact.ts, specialty.ts   esquemas Zod
  middleware.ts                   protección de rutas
```

## Notas sobre autenticación y datos

- Las sesiones son JWT HS256 almacenados en una cookie httpOnly, SameSite=Lax; la cookie es Secure en producción.
- Las contraseñas se hashean con bcryptjs (10 rondas). Nunca almacene contraseñas en texto plano.
- Todas las consultas de contactos se limitan al `userId` del usuario autenticado, tanto en las páginas como en la API. Los favoritos agregan `isFavorite: true` sobre ese alcance.
- Los filtros de texto buscan subcadenas sin distinguir mayúsculas. Al seleccionar una especialidad principal también se incluyen sus hijos directos; el árbol tiene exactamente un nivel de subcategorías.
