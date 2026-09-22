import type { ImageMetadata } from 'astro';
import { images } from './images';

// TODO: reemplazar por proyectos reales del estudio
export type Project = { title: string; kind: string; image: ImageMetadata; alt: string };

export const projects: Project[] = [
  { title: 'Casa Funes', kind: 'Vivienda y jardín', image: images.fachada, alt: 'Fachada de casa con revestimiento de madera y jardín al frente' },
  { title: 'Patio Fisherton', kind: 'Paisajismo', image: images.sendero, alt: 'Sendero de piedra entre plantas en un patio' },
  { title: 'Living Alberdi', kind: 'Remodelación', image: images.living, alt: 'Living luminoso con plantas y muebles de madera' },
  { title: 'Estudio Pichincha', kind: 'Local comercial', image: images.interiorVerde, alt: 'Interior con muchas plantas y luz natural' },
  { title: 'Galería Arroyito', kind: 'Terraza y galería', image: images.galeria, alt: 'Galería exterior con plantas' },
  { title: 'Casa del Bosque', kind: 'Vivienda', image: images.madera, alt: 'Interior con estructura de madera' },
];
