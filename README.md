# Amigos Peluditos

Amigos Peluditos es una aplicación web estática para gestión veterinaria. Permite administrar tutores, mascotas, citas, historial clínico, notificaciones, inventario y reportes desde el navegador, sin necesidad de un proceso de compilación.

## Características

- Acceso por roles: administrador, tutor y veterinario.
- Gestión de pacientes y tutores.
- Agenda y detalle de citas.
- Registro de consultas clínicas.
- Bandeja de notificaciones por perfil.
- Inventario de productos e insumos.
- Reportes con métricas y gráficas simples.

## Estructura del proyecto

- `index.html`: punto de entrada de la aplicación.
- `src/main.js`: arranque de la app.
- `src/app/`: lógica principal, estado, utilidades y componentes.
- `src/styles/`: estilos globales.
- `img/`: imágenes y recursos estáticos.

## Cómo ejecutarlo localmente

Este proyecto no requiere build ni dependencias para funcionar.

1. Abre la carpeta del proyecto en VS Code.
2. Usa Live Server o cualquier servidor estático local para servir `index.html`.
3. Abre la URL local que te muestre el servidor.

Si prefieres una opción rápida desde terminal, puedes usar un servidor simple como `npx serve` o `python3 -m http.server` desde la raíz del proyecto.

## Despliegue en GitHub Pages

Como es una app estática, puedes publicarla directamente desde la rama principal o desde la carpeta raíz del repositorio.

Pasos sugeridos:

1. Sube el proyecto a un repositorio en GitHub.
2. Entra a Settings > Pages.
3. Selecciona la rama y la carpeta raíz donde está `index.html`.
4. Guarda los cambios y espera a que GitHub Pages genere la URL pública.

## Credenciales de demo

- Admin: `admin@clinic.com` / `Veterinaria2026`
- Tutor: `maria@email.com` / `Maria2026`
- Tutor: `carlos@email.com` / `Carlos2026`
- Veterinario: usa las cuentas definidas en el sistema de autenticación de prueba.

## Notas

- Los datos se guardan en `localStorage` y `sessionStorage`.
- La app está pensada para funcionar como sitio estático.
- Si agregas nuevas imágenes o recursos, colócalos en `img/`.
