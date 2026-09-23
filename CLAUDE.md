# CLAUDE.md — Estudio Verde (landing de referencia)

Este repo es la **landing de referencia** de una serie de 3 landings para negocios locales de distintos rubros
(Estudio Verde → Estudio Ferreyra → Fogón Don Nino). Las próximas **copian este patrón**: mismo stack, misma
estructura, mismo hero, mismos componentes y animaciones. Lo que cambia por rubro es **paleta, tipografía display,
copy, fotos y alguna sección puntual**. No rediseñar desde cero.

- Parte 1 de este archivo: **el patrón** (lo que se repite en todos los proyectos).
- Parte 2: **datos de Estudio Verde** (lo que es propio de este cliente).
- Parte 3: **checklist para arrancar un proyecto nuevo** a partir de este.

Idioma de todo (copy, commits, comentarios, respuestas): **español rioplatense**, tono directo y cálido.

---

## Parte 1 — El patrón

### Stack

- **Astro 7 (SSG)** + **Tailwind CSS v4** vía `@tailwindcss/vite` (sin `tailwind.config`, todo en `@theme` de `src/styles/global.css`).
- **Islas React 19** solo donde hace falta interacción rica (botones WebGL, galería con parallax, antes/después). El resto es HTML estático + `<script is:inline>` mínimo, sin frameworks.
- **motion** (`motion/react`) para springs y scroll-linked; **ogl** para el WebGL del SpecularButton.
- **Íconos:** `@phosphor-icons/react`. En `.astro` importar desde `@phosphor-icons/react/dist/ssr` (sin JS al cliente); en islas, desde `@phosphor-icons/react`. Usar la variante `*Icon` (`WhatsappLogoIcon`, `CaretLeftIcon`…).
- **Fuentes:** self-hosted con `@fontsource` (nada de Google Fonts por `<link>`).
- **Imágenes:** `astro:assets` → `<Image>` con `widths` + `sizes` (WebP con srcset). Para pasar imágenes a islas React, usar `getImage()` en el `.astro` y mandar `src`/`srcset`/`width`/`height` como props (ver `Projects.astro`, `Transformation.astro`).
- **SEO:** `@astrojs/sitemap`, `public/robots.txt`, metas OG/Twitter con `public/og.png` (1200×630), JSON-LD en `Layout.astro`.
- **Node 22**. **Deploy:** Vercel, output estático (`dist/`).

### Comandos

> **GOTCHA de esta máquina (Windows):** `npm` está bloqueado por la política de ejecución (npm.ps1). Usar **`npm.cmd` / `npx.cmd`**.

```bash
npm.cmd install
npm.cmd run dev       # http://localhost:4321
npm.cmd run build     # dist/
npm.cmd run preview
npm.cmd run check     # astro check (tipos)
```

> **GOTCHA de caché de Vite:** si instalás paquetes con el dev server corriendo, las islas React fallan en el navegador
> con `_jsxDEV is not a function` (el HTML de SSR se ve bien, así que parece que "no aparece la imagen/componente").
> Solución: cortar el server y `rm -rf node_modules/.vite && npx.cmd astro dev --force`.

Para dejar el dev server en segundo plano: `astro dev --background` (y `astro dev stop | status | logs`).

### Estructura

```
src/
  styles/global.css          # tokens (@theme), reveals, clases de animación, reduced-motion
  layouts/Layout.astro       # <head> SEO + OG + JSON-LD, clase .js, IntersectionObserver de reveals
  pages/index.astro          # arma la landing: orden de secciones
  lib/
    site.ts                  # ÚNICA fuente de datos de contacto (TODO: reemplazar) + waLink/mailLink/igLink
    images.ts                # ÚNICO lugar donde se importan fotos
    projects.ts              # datos del portfolio (título, tipo, foto, alt)
  components/
    sections/*.astro         # una sección = un archivo
    react/*.tsx              # islas: SpecularButton, CircularCTA, ProjectsGallery, BeforeAfter
  assets/images/*.jpg        # fotos (se optimizan en build)
public/                      # og.png, favicon.png, robots.txt
```

Reglas:
- **Contactos solo en `lib/site.ts`**, marcados `// TODO: reemplazar`. Ninguna sección hardcodea un teléfono o mail.
- **Fotos solo por `lib/images.ts`**. Para cambiar una foto: reemplazar el archivo con el mismo nombre o cambiar el import.
- Datos repetidos (pasos, servicios, proyectos, slides) como **arrays al tope del frontmatter** y `.map()` en el markup.

### Sistema de diseño

**Tokens** (en `@theme` de `global.css`). Estructura fija, valores por rubro:

| Rol | Token en Estudio Verde | Uso |
|---|---|---|
| Fondo claro | `paper` `#f3f1e8` | fondo general |
| Fondo alterno | `bone` `#e6e2d3` | secciones alternas, placeholders de imagen |
| Oscuro principal | `forest` `#1f2a1c` | texto, panel oscuro, footer, hero |
| Acento secundario | `olive` / `sage` / `wood` | eyebrows, roles, detalles |
| Acento CTA | `terra` `#b4583a` + `terra-dark` + `terra-light` | botones, sección contacto, 2ª línea del hero |

- Nunca colores estridentes. Paletas apagadas, naturales, con **un solo acento cálido** para CTAs.
- Contraste: texto claro sobre el acento necesita la variante `-dark` para pasar AA (por eso `primary` del botón usa `terra-dark`).
- `--radius-xs: 2px`: esquinas casi rectas en fotos (look editorial). Botones: pill (`999px`).
- `--ease-out-soft: cubic-bezier(0.23, 1, 0.32, 1)`: **la única curva** de todo el sitio.

**Tipografía** (4 roles):
- `font-display` (Newsreader, serif) → títulos `h2`, nombres, marca. `tracking-[-0.03em]`, `leading-[1.05]`.
- `display-condensed` (Archivo condensada, `font-stretch: 68%`, 850, mayúsculas) → **solo el titular del hero**.
- `font-sans` (Figtree) → cuerpo.
- `font-mono` (JetBrains Mono) → **eyebrows** y etiquetas de esquina.

Clase eyebrow estándar (va arriba de cada `h2`):
```html
<p class="reveal font-mono text-[11px] font-medium tracking-[0.22em] text-wood uppercase">Servicios</p>
```

**Layout:** contenedor `mx-auto max-w-7xl px-4 sm:px-6 lg:px-10`; secciones `py-20 md:py-32`; grillas de 12 columnas
con composición **asimétrica** (texto `col-span-5/7`, imagen corrida con `col-start-*`, tarjetas con `mt-24`/`mt-32`
desfasado). Alternar fondos `paper` → `bone` → `forest` para dar ritmo. Móvil primero.

La marca va tipográfica: `font-display text-2xl tracking-[-0.03em]` + logo chico (si el cliente no tiene logo, solo texto).

### Hero (se repite en todos)

`sections/Hero.astro`. Receta:
1. `<section data-hero>` a pantalla completa: `h-[100dvh] min-h-[560px]`, fondo oscuro.
2. **Slideshow full-bleed de 3 fotos** con crossfade (`.slide` / `.is-active`, 1200 ms) y **Ken Burns** (`scale 1.02 → 1.14` en 9 s).
3. **Velo de contraste**: gradiente lineal hacia abajo + radial abajo a la izquierda (donde va el texto).
4. **Titular gigante en 2 líneas** con `display-condensed`, `text-[clamp(3.6rem,15vw,11rem)] leading-[0.82]`:
   línea 1 en color papel, línea 2 en el acento claro, **punto final en el acento fuerte**. Formato imperativo corto
   (“Habitá / el paisaje.”). Cada slide trae su propio titular + bajada.
5. **Reveal por líneas**: cada `.ln` entra con `clip-path` de abajo hacia arriba + `translateY`, 2ª línea con 120 ms de delay, bajada a 300 ms.
6. **Etiquetas mono en las esquinas**: arriba al centro (“Arquitectura / Paisajismo”), abajo a la izquierda (“Rosario / Con cita previa”).
7. **CTAs**: `SpecularButton` primario con `autoAnimate` + `CircularCTA` de WhatsApp (oculto en móvil).
8. **Controles**: contador `1 / 3` + dos `SpecularButton circle variant="ghostDark"` (anterior/siguiente).
9. JS inline: autoplay cada 6 s, **pausa con hover, fuera de pantalla (IO) y con reduced motion**.
10. `<h1 class="sr-only">` con nombre + rubro + ciudad (el titular visual es decorativo/rotativo).

El **header** arranca transparente con texto claro sobre el hero y se **compacta** (fondo papel, altura 18→14, borde)
cuando un sentinel de 24 px sale de pantalla (IntersectionObserver, `data-compact`).

### Botones: SpecularButton (React Bits)

`components/react/SpecularButton.tsx` + `.css`. Portado de [reactbits.dev](https://reactbits.dev) (“SpecularButton”, variante JS+CSS con ogl).
Es **el botón de todo el sitio**. Adaptaciones que hay que mantener:
- **Polimórfico**: con `href` renderiza `<a>`, sin `href` un `<button>`.
- **Presupuesto WebGL**: el contexto solo vive cuando el botón está en/cerca del viewport (IO con `rootMargin: 200px`) y se destruye al salir. Los navegadores limitan ~16 contextos: no quitar esto.
- **Fallback**: sin WebGL2, con `prefers-reduced-motion` o en táctil (`hover: none`) no hay loop; el trazo lo dibuja CSS (`--static`).
- **Variantes** en el objeto `variants` con los colores de la paleta: `primary` (acento), `secondary` (oscuro), `ghostDark` (sobre fondo oscuro), `ghostLight` (sobre fondo claro). **En un proyecto nuevo solo se cambian los hex de `variants`** (y los fallbacks del `.css`).
- Props útiles: `size="sm|md|lg"`, `circle`, `autoAnimate` (brillo girando solo; usar solo en el CTA principal del hero), `speed`.
- Hidratación: `client:load` solo en el CTA del hero; el resto `client:visible`.

```astro
<SpecularButton client:visible href={waLink} target="_blank" rel="noopener" variant="secondary" size="lg">
  <WhatsappLogoIcon size={26} weight="fill" className="shrink-0" aria-hidden="true" /> Escribinos por WhatsApp
</SpecularButton>
```

### Otros componentes reutilizables

- **CircularCTA** (`react/CircularCTA.tsx`): círculo con texto girando alrededor de un ícono de WhatsApp + efecto imán
  (combina “CircularText” y “Magnet” de React Bits, reescritos con motion). Props `size`, `tone`, `text`, `ring`.
  Imán solo con `(hover: hover) and (pointer: fine)`. Se usa en hero, contacto y como botón flotante.
- **FloatingWhatsApp**: CircularCTA fijo abajo a la derecha, **oculto sobre el hero y sobre contacto** (IO).
- **ProjectsGallery** (`react/ProjectsGallery.tsx`): en escritorio, sección **pinneada** con pista horizontal movida por
  `useScroll`/`useTransform` y **parallax por tarjeta** (cada una con tamaño, aspecto, desfase y velocidad propios en `shapes`).
  En móvil o reduced motion: carrusel nativo con `scroll-snap` + botones circulares.
- **BeforeAfter** (`react/BeforeAfter.tsx`): comparador arrastrable con `clip-path`, accesible (`role="slider"`, flechas),
  y una **pista animada** la primera vez que entra en pantalla (32 % → 68 % → 50 %).
- **Proceso** (`sections/Process.astro`): lista de pasos a la derecha + **foto sticky** a la izquierda con crossfade y un
  **verbo en itálica gigante** sobre la foto. El paso activo cambia con clic o por scroll (IO con `rootMargin: -45% 0 -45% 0`).
  En móvil cada paso lleva su foto inline.
- **Panel oscuro de valores** (`Philosophy.astro`): `h2` enorme `font-light` con una frase en `<em>` de color acento + 3 principios en lista numerada con bordes.
- **Contacto**: sección con **fondo del acento**, titular gigante, WhatsApp como botón `lg`, mail + “Copiar mail” (clipboard + `aria-live`), CircularCTA grande y mapa de Google embebido **solo con la ciudad** (filtro `grayscale sepia`).
- **Instagram**: handle gigante clickeable + 4 miniaturas cuadradas que linkean al perfil.

### Animaciones y scroll (reglas)

- **Reveals**: agregar `class="reveal"` (fade + subida 16 px) o `reveal-clip` (cortina) y escalonar con `style="--i:N"` (80 ms por paso). Un único IntersectionObserver en `Layout.astro` agrega `.is-in` y deja de observar.
- La clase `.js` se pone en `<html>` inline en el `<head>`: **sin JS todo se ve** (los reveals solo ocultan bajo `.js`).
- **Nunca `scroll` listeners**: todo por IntersectionObserver o `useScroll` de motion.
- `.press` en links/botones: `scale(0.97)` al presionar.
- Hovers solo con `[@media(hover:hover)]:hover:*` para que no queden pegados en táctil.
- `html { scroll-behavior: smooth; scroll-padding-top: 5rem }` para las anclas del header.
- **`prefers-reduced-motion` siempre respetado**: bloque final de `global.css` + chequeos en cada isla (`useReducedMotion`).
- Duraciones: micro 160–300 ms, reveals 600 ms, cortinas/hero 900–1200 ms. Una sola curva (`ease-out-soft`).

### Imágenes sin copyright (proveedores)

1. **Unsplash** (licencia Unsplash: uso comercial libre, sin atribución obligatoria) → **proveedor por defecto** para hero, proyectos, proceso, retratos placeholder.
2. **Pexels** (licencia Pexels, igual de libre) → alternativa si Unsplash no tiene algo.
3. **Wikimedia Commons** → solo cuando hace falta algo muy específico y **real** (p. ej. un antes/después del mismo encuadre). Suelen ser **CC BY / CC BY-SA**: hay que **mostrar el crédito en la página** (autor, link, licencia) y anotarlo en `images.ts`.

Flujo: descargar a `src/assets/images/` con nombre en español y kebab-case (`hero-casa.jpg`, `proceso-obra.jpg`), a ~1600–2400 px de ancho, JPG;
importarlo en `lib/images.ts` con un comentario de fuente/licencia y `TODO: reemplazar por foto real del cliente`. Nunca hotlinkear.
Fotos coherentes entre sí (misma luz y temperatura de color que la paleta). `alt` siempre descriptivo en español.

### Contenido y copy

- Orden de la landing: **Hero → Quiénes somos → Servicios → Panel de valores (oscuro) → Proceso → Antes/después o prueba visual → Proyectos → Instagram → Contacto → Footer** + WhatsApp flotante. Se ajusta al rubro, pero siempre: hero con CTA, humanizar a los dueños, qué hacen, el diferencial, cómo trabajan, prueba visual y un contacto imposible de no encontrar.
- **Conversión**: el CTA a WhatsApp aparece en header, hero, flotante, contacto y footer. El mensaje de WhatsApp viene pre-cargado (`waMessage`).
- Titulares cortos y concretos; nada de relleno corporativo. Si una frase suena a plantilla, reescribirla.
- No usar frases literales del cliente sacadas del brief; reescribirlas.
- **Sin precios** y **sin dirección exacta** salvo que el cliente lo pida (usar “Ciudad, con cita previa”).
- No inventar funcionalidades que el cliente no tiene (turnos online, formularios de reserva, login…).
- Testimonios/proyectos ficticios siempre con `TODO` para reemplazar.

### Accesibilidad y rendimiento (mínimos)

- Link “Saltar al contenido”, un solo `h1`, `h2` por sección, `aria-label` en botones de solo ícono, `aria-hidden` en íconos decorativos.
- `:focus-visible` con outline del acento; contraste AA en texto sobre fotos (velo) y sobre el acento (variante `-dark`).
- Primera imagen del hero `loading="eager" fetchpriority="high"`; el resto lazy. `sizes` realistas en cada `<Image>`.
- JS mínimo: islas solo donde hace falta, `client:visible`/`client:idle` por defecto.

---

## Parte 2 — Estudio Verde

- **Cliente:** estudio de **arquitectura y paisajismo** en Rosario. Dueños: **Paula Sánchez** (arquitecta) y su hermano **Martín Sánchez** (paisajista).
- **Diferencial (mensaje nº1):** diseño con **conciencia ambiental**, materiales nobles y locales, especies nativas. Tiene que quedar claro que hacen **la obra y el paisaje**, no solo jardines.
- **Contacto:** solo **WhatsApp y mail**. Zona: **“Rosario, con cita previa”** (sin dirección). Instagram con ~4.000 seguidores.
- **Sin precios.** No repetir “verde” como sustantivo: variar con paisajismo, exteriores, jardines, paisaje.
- **Paleta:** verdes tierra apagados + madera + terracota (ver tokens arriba).
- **Datos placeholder** en `src/lib/site.ts` (WhatsApp `5493410000000`, `hola@estudioverde.com.ar`, `@estudioverde.ros`): todos `TODO: reemplazar`.
- **Fotos:** Unsplash (placeholders) + antes/después de Wikimedia Commons (Michael E. Arth, CC BY-SA 4.0, crédito visible en la sección). Retratos y logo en `src/assets/`.
- **Repo:** https://github.com/tomasamrein/estudio-verde (rama `main`). Dominio previsto: `estudioverde.com.ar` (configurado en `astro.config.mjs` y `lib/site.ts`).
- Cómo reemplazar contactos y fotos: ver `README.md`.

---

## Parte 3 — Checklist para un proyecto nuevo a partir de este

1. Copiar esta carpeta `web/` sin `node_modules/`, `dist/`, `.astro/` ni `.git/` a `<proyecto>/web`, y `git init`.
2. `package.json`: cambiar `name`. `astro.config.mjs`: `site` con el dominio nuevo. `public/robots.txt`: URL del sitemap.
3. **`lib/site.ts`**: nombre, ciudad, zona, WhatsApp, mail, Instagram, descripción, `waMessage` (todo con `TODO: reemplazar`).
4. **`global.css` → `@theme`**: nuevos hex manteniendo los mismos roles (fondo claro, alterno, oscuro, acentos, CTA + `-dark` + `-light`). Revisar contraste AA.
5. Si cambia la tipografía: instalar el `@fontsource` nuevo y actualizar `--font-*`. El hero siempre usa una **condensada pesada en mayúsculas**.
6. **`SpecularButton.tsx` → `variants`**, `SpecularButton.css` (fallbacks), **`CircularCTA.tsx` → `tones`** y colores hardcodeados en velos/gradientes (`rgba(20,26,18,…)`), `theme-color` y `FloatingWhatsApp` (`ring`).
7. **Fotos**: bajar de Unsplash/Pexels a `src/assets/images/`, actualizar `lib/images.ts`; `public/og.png` (1200×630) y `favicon.png` nuevos.
8. **Copy**: slides del hero (3 titulares de 2 líneas + bajada), secciones, pasos del proceso, proyectos, textos de CTA. Adaptar etiquetas mono de las esquinas.
9. **SEO**: `title`, `description` y JSON-LD en `Layout.astro` con el `@type` que corresponda al rubro (`ProfessionalService`, `Restaurant`, `LegalService`, etc.).
10. Secciones: sumar/quitar solo lo que el brief pida (p. ej. menú en un restaurante); mantener hero, proceso/valores, prueba visual y contacto.
11. `npm.cmd run check && npm.cmd run build`, revisar en móvil (360 px) y escritorio, probar reduced motion.
12. Crear el repo en GitHub, push a `main` y conectar a Vercel (build `astro build`, output `dist/`).
