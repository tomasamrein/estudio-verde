# Estudio Verde · sitio web

Landing en Astro + Tailwind v4, con islas React solo para el comparador antes/después y el parallax de proyectos.

## Comandos (en esta máquina usar `npm.cmd`)

```bash
npm.cmd install
npm.cmd run dev      # http://localhost:4321
npm.cmd run build    # genera dist/
npm.cmd run preview
npm.cmd run check
```

## Cambiar datos de contacto

Todo está en `src/lib/site.ts` (WhatsApp, mail, Instagram). Buscá los `TODO: reemplazar`.

## Cambiar fotos

- Las fotos viven en `src/assets/images/` y se importan desde `src/lib/images.ts`.
- Para usar una foto real, reemplazá el archivo con el mismo nombre o cambiá el import.
- `jardin-antes.jpg` es un placeholder generado a partir de `jardin-despues.jpg`. Reemplazalo por el par real.
- Los proyectos (nombre, tipo, foto, texto alternativo) están en `src/lib/projects.ts`.
- Retratos y logo: `src/assets/paula.jpg`, `martin.jpg`, `logo.png`, `logo-blanco.png`.
- Imagen para redes: `public/og.png` (1200x630).
