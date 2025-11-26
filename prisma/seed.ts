import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de eventos...');

  // Verificar si ya existen eventos
  const eventosExistentes = await prisma.eventos.count();
  if (eventosExistentes > 0) {
    console.log(`⚠️  Ya existen ${eventosExistentes} eventos en la base de datos.`);
    console.log('💡 Si deseas reemplazarlos, elimina los eventos existentes primero.');
    return;
  }

  // Obtener el primer organizador o crear uno de ejemplo si no existe
  let organizador = await prisma.organizadores.findFirst();
  
  if (!organizador) {
    console.log('⚠️  No se encontró ningún organizador. Creando uno de ejemplo...');
    // Crear un organizador de ejemplo
    organizador = await prisma.organizadores.create({
      data: {
        NombreComercial: 'Organizador de Ejemplo',
        RazonSocial: 'Organizador de Ejemplo SA de CV',
        ContactoNombre: 'Juan Pérez',
        ContactoEmail: 'contacto@ejemplo.com',
        ContactoTelefono: '9991234567',
        Ciudad: 'Mérida',
        Estado: 'Yucatán',
        Pais: 'México',
        Estatus: 'activo',
      },
    });
    console.log(`✅ Organizador creado con ID: ${organizador.OrgID}`);
  }

  // Crear eventos de ejemplo con acentos (UTF-8)
  const eventos = [
    {
      OrgID: organizador.OrgID,
      Titulo: 'Maratón de Mérida 2024',
      Subtitulo: 'Carrera por las calles históricas de Mérida',
      TipoEvento: 'Carrera',
      Distancias: '5K, 10K, 21K, 42K',
      Categorias: 'Libre, Veteranos, Juvenil',
      FechaEvento: new Date('2024-12-15'),
      HoraEvento: new Date('1970-01-01T06:00:00Z'),
      Ciudad: 'Mérida',
      Estado: 'Yucatán',
      Pais: 'México',
      Lugar: 'Centro Histórico de Mérida',
      UrlMapa: 'https://maps.google.com/merida',
      UrlImagen: 'https://ejemplo.com/imagen1.jpg',
      PrecioEvento: 500.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
    {
      OrgID: organizador.OrgID,
      Titulo: 'Carrera del Día de la Independencia',
      Subtitulo: 'Celebra la independencia corriendo',
      TipoEvento: 'Carrera',
      Distancias: '5K, 10K',
      Categorias: 'Libre',
      FechaEvento: new Date('2024-09-16'),
      HoraEvento: new Date('1970-01-01T07:00:00Z'),
      Ciudad: 'Cancún',
      Estado: 'Quintana Roo',
      Pais: 'México',
      Lugar: 'Playa Delfines',
      UrlMapa: 'https://maps.google.com/cancun',
      UrlImagen: 'https://ejemplo.com/imagen2.jpg',
      PrecioEvento: 400.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
    {
      OrgID: organizador.OrgID,
      Titulo: 'Maratón Internacional de la Ciudad de México',
      Subtitulo: 'La carrera más importante de la capital',
      TipoEvento: 'Carrera',
      Distancias: '10K, 21K, 42K',
      Categorias: 'Libre, Élite, Veteranos',
      FechaEvento: new Date('2024-11-10'),
      HoraEvento: new Date('1970-01-01T05:30:00Z'),
      Ciudad: 'Ciudad de México',
      Estado: 'Ciudad de México',
      Pais: 'México',
      Lugar: 'Bosque de Chapultepec',
      UrlMapa: 'https://maps.google.com/cdmx',
      UrlImagen: 'https://ejemplo.com/imagen3.jpg',
      PrecioEvento: 800.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
    {
      OrgID: organizador.OrgID,
      Titulo: 'Carrera Nocturna de Guadalajara',
      Subtitulo: 'Corre bajo las estrellas en Guadalajara',
      TipoEvento: 'Carrera',
      Distancias: '5K, 10K',
      Categorias: 'Libre',
      FechaEvento: new Date('2024-10-20'),
      HoraEvento: new Date('1970-01-01T20:00:00Z'),
      Ciudad: 'Guadalajara',
      Estado: 'Jalisco',
      Pais: 'México',
      Lugar: 'Centro de Guadalajara',
      UrlMapa: 'https://maps.google.com/guadalajara',
      UrlImagen: 'https://ejemplo.com/imagen4.jpg',
      PrecioEvento: 350.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
    {
      OrgID: organizador.OrgID,
      Titulo: 'Maratón de Monterrey',
      Subtitulo: 'Desafía las montañas de Monterrey',
      TipoEvento: 'Carrera',
      Distancias: '10K, 21K, 42K',
      Categorias: 'Libre, Veteranos',
      FechaEvento: new Date('2024-12-01'),
      HoraEvento: new Date('1970-01-01T06:30:00Z'),
      Ciudad: 'Monterrey',
      Estado: 'Nuevo León',
      Pais: 'México',
      Lugar: 'Parque Fundidora',
      UrlMapa: 'https://maps.google.com/monterrey',
      UrlImagen: 'https://ejemplo.com/imagen5.jpg',
      PrecioEvento: 600.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
    {
      OrgID: organizador.OrgID,
      Titulo: 'Carrera de la Revolución en Puebla',
      Subtitulo: 'Conmemora la revolución mexicana',
      TipoEvento: 'Carrera',
      Distancias: '5K, 10K, 21K',
      Categorias: 'Libre',
      FechaEvento: new Date('2024-11-20'),
      HoraEvento: new Date('1970-01-01T07:00:00Z'),
      Ciudad: 'Puebla',
      Estado: 'Puebla',
      Pais: 'México',
      Lugar: 'Zócalo de Puebla',
      UrlMapa: 'https://maps.google.com/puebla',
      UrlImagen: 'https://ejemplo.com/imagen6.jpg',
      PrecioEvento: 450.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
    {
      OrgID: organizador.OrgID,
      Titulo: 'Maratón de Oaxaca',
      Subtitulo: 'Corre por las calles coloniales de Oaxaca',
      TipoEvento: 'Carrera',
      Distancias: '10K, 21K',
      Categorias: 'Libre, Juvenil',
      FechaEvento: new Date('2024-10-15'),
      HoraEvento: new Date('1970-01-01T06:00:00Z'),
      Ciudad: 'Oaxaca',
      Estado: 'Oaxaca',
      Pais: 'México',
      Lugar: 'Centro Histórico de Oaxaca',
      UrlMapa: 'https://maps.google.com/oaxaca',
      UrlImagen: 'https://ejemplo.com/imagen7.jpg',
      PrecioEvento: 400.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
    {
      OrgID: organizador.OrgID,
      Titulo: 'Carrera del Día de Muertos en Morelia',
      Subtitulo: 'Celebra el día de muertos corriendo',
      TipoEvento: 'Carrera',
      Distancias: '5K, 10K',
      Categorias: 'Libre',
      FechaEvento: new Date('2024-11-02'),
      HoraEvento: new Date('1970-01-01T18:00:00Z'),
      Ciudad: 'Morelia',
      Estado: 'Michoacán',
      Pais: 'México',
      Lugar: 'Centro Histórico de Morelia',
      UrlMapa: 'https://maps.google.com/morelia',
      UrlImagen: 'https://ejemplo.com/imagen8.jpg',
      PrecioEvento: 350.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
    {
      OrgID: organizador.OrgID,
      Titulo: 'Maratón de Tijuana',
      Subtitulo: 'Carrera fronteriza en Tijuana',
      TipoEvento: 'Carrera',
      Distancias: '10K, 21K, 42K',
      Categorias: 'Libre, Veteranos',
      FechaEvento: new Date('2024-12-08'),
      HoraEvento: new Date('1970-01-01T06:00:00Z'),
      Ciudad: 'Tijuana',
      Estado: 'Baja California',
      Pais: 'México',
      Lugar: 'Playa de Tijuana',
      UrlMapa: 'https://maps.google.com/tijuana',
      UrlImagen: 'https://ejemplo.com/imagen9.jpg',
      PrecioEvento: 550.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
    {
      OrgID: organizador.OrgID,
      Titulo: 'Carrera de San Miguel de Allende',
      Subtitulo: 'Corre por las calles pintorescas de San Miguel',
      TipoEvento: 'Carrera',
      Distancias: '5K, 10K',
      Categorias: 'Libre',
      FechaEvento: new Date('2024-11-30'),
      HoraEvento: new Date('1970-01-01T07:00:00Z'),
      Ciudad: 'San Miguel de Allende',
      Estado: 'Guanajuato',
      Pais: 'México',
      Lugar: 'Centro de San Miguel de Allende',
      UrlMapa: 'https://maps.google.com/sanmiguel',
      UrlImagen: 'https://ejemplo.com/imagen10.jpg',
      PrecioEvento: 450.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
  ];

  // Insertar eventos
  for (const evento of eventos) {
    await prisma.eventos.create({
      data: evento,
    });
  }

  console.log(`✅ ${eventos.length} eventos creados exitosamente con caracteres UTF-8 (acentos).`);
  console.log('📋 Eventos creados en:');
  eventos.forEach((evento, index) => {
    console.log(`   ${index + 1}. ${evento.Titulo} - ${evento.Ciudad}, ${evento.Estado}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

