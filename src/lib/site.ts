// Datos de contacto centralizados. Cambialos acá y se actualizan en todo el sitio.
export const site = {
  name: 'Estudio Verde',
  url: 'https://estudioverde.com.ar',
  city: 'Rosario',
  zone: 'Rosario, con cita previa',
  // TODO: reemplazar por el número real (formato internacional, sin + ni espacios)
  whatsapp: '5493410000000',
  // TODO: reemplazar por el número real tal como se muestra
  whatsappLabel: '+54 9 341 000-0000',
  // TODO: reemplazar por el mail real
  email: 'hola@estudioverde.com.ar',
  // TODO: reemplazar por el usuario real de Instagram
  instagram: 'estudioverde.ros',
  description:
    'Estudio de arquitectura y paisajismo en Rosario. Casas, remodelaciones, locales, jardines, terrazas y patios, con diseño sustentable y obra completa.',
};

export const waMessage = 'Hola, Estudio Verde. Quiero contarles sobre un proyecto.';
export const waLink = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(waMessage)}`;
export const mailLink = `mailto:${site.email}?subject=${encodeURIComponent('Consulta por un proyecto')}`;
export const igLink = `https://instagram.com/${site.instagram}`;
