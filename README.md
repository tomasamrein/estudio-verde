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
- Antes/después: `reforma-antes.jpg` y `reforma-despues.jpg` son un par real de referencia ("Cracktown to Garden District, DeLand, Florida", Michael E. Arth, Wikimedia Commons, CC BY-SA 4.0; el crédito figura en la página). Reemplazalo por una obra propia recortada al mismo encuadre (2:1).
- Proceso: `proceso-charla/diseno/obra/entrega.jpg` (Unsplash, licencia Unsplash).
- Hero: slideshow con `hero-casa.jpg`, `jardin-despues.jpg` e `interior-verde.jpg`; los textos de cada escena están en `src/components/sections/Hero.astro`.
- Los proyectos (nombre, tipo, foto, texto alternativo) están en `src/lib/projects.ts`.
- Retratos y logo: `src/assets/paula.jpg`, `martin.jpg`, `logo.png` (transparente, se usa siempre) y `logo-light.png` (misma silueta en color claro para fondos oscuros).
- Imagen para redes: `public/og.png` (1200x630).
