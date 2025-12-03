import { PrismaClient, promociones_TipoPromo, promociones_Estatus, inscripciones_PagoEstado, inscripciones_TallaPlayera, subscriptions_PlanCode, subscriptions_BillingCycle, subscriptions_Status, organizadores_Estatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de eventos...');

  // Verificar si ya existen eventos
  const eventosExistentes = await prisma.eventos.count();
  if (eventosExistentes > 0) {
    console.log(`⚠️  Ya existen ${eventosExistentes} eventos en la base de datos.`);
    console.log('💡 Actualizando eventos existentes con campos faltantes...');
    
    // Obtener todos los eventos existentes
    const eventosParaActualizar = await prisma.eventos.findMany({
      where: {
        OR: [
          { UrlRegistro: null },
          { UrlPagoDirecto: null },
          { MaxPuntosZ2: null },
          { MaxDescuentoZ2: null },
          { PuntosEquivalencia: null },
          { DescuentoImporte: null },
          { editCartaExoneracion: null },
          { UrlCartaExoneracion: null },
          { editGuiaExpectador: null },
          { GuiaExpectador: null },
          { imagen: null },
          { UrlCalendario: null },
        ],
      },
    });

    if (eventosParaActualizar.length > 0) {
      console.log(`📝 Actualizando ${eventosParaActualizar.length} eventos con campos faltantes...`);
      
      // Obtener un RunnerUID de ejemplo si existe
      const usuarioEjemplo = await prisma.sec_users.findFirst();
      const runnerUIDEjemplo = usuarioEjemplo?.RunnerUID || null;

      for (const evento of eventosParaActualizar) {
        const datosActualizacion: any = {};
        
        // Agregar campos faltantes con valores por defecto
        const precioEvento = evento.PrecioEvento ? Number(evento.PrecioEvento) : 500;
        
        if (!evento.UrlRegistro) {
          datosActualizacion.UrlRegistro = `https://zona2.mx/eventos/${evento.EventoID}/registro`;
        }
        if (!evento.UrlPagoDirecto) {
          datosActualizacion.UrlPagoDirecto = `https://zona2.mx/pago/${evento.EventoID}`;
        }
        if (!evento.MaxPuntosZ2) {
          datosActualizacion.MaxPuntosZ2 = Math.floor(precioEvento * 10);
        }
        if (!evento.MaxDescuentoZ2) {
          datosActualizacion.MaxDescuentoZ2 = Math.floor(precioEvento / 10);
        }
        if (!evento.PuntosEquivalencia) {
          datosActualizacion.PuntosEquivalencia = 100;
        }
        if (!evento.DescuentoImporte) {
          datosActualizacion.DescuentoImporte = Math.floor(precioEvento / 10);
        }
        if (!evento.editCartaExoneracion) {
          datosActualizacion.editCartaExoneracion = `Carta de exoneración de responsabilidad para ${evento.Titulo}. Los participantes asumen todos los riesgos asociados con la participación en este evento.`;
        }
        if (!evento.UrlCartaExoneracion) {
          datosActualizacion.UrlCartaExoneracion = `https://zona2.mx/documentos/carta-exoneracion-${evento.EventoID}.pdf`;
        }
        if (!evento.editGuiaExpectador) {
          datosActualizacion.editGuiaExpectador = `Guía completa para espectadores de ${evento.Titulo}. Puntos de observación, horarios, estacionamiento y recomendaciones.`;
        }
        if (!evento.GuiaExpectador) {
          datosActualizacion.GuiaExpectador = `https://zona2.mx/documentos/guia-expectador-${evento.EventoID}.pdf`;
        }
        if (!evento.imagen) {
          datosActualizacion.imagen = evento.UrlImagen || `https://ejemplo.com/imagenes/evento-${evento.EventoID}.jpg`;
        }
        if (!evento.UrlCalendario) {
          datosActualizacion.UrlCalendario = `https://calendar.google.com/event?action=TEMPLATE&tmeid=evento${evento.EventoID}`;
        }
        if (!evento.RunnerUID && runnerUIDEjemplo) {
          datosActualizacion.RunnerUID = runnerUIDEjemplo;
        }
        if (!evento.Internacional) {
          datosActualizacion.Internacional = 'N';
        }

        if (Object.keys(datosActualizacion).length > 0) {
          await prisma.eventos.update({
            where: { EventoID: evento.EventoID },
            data: datosActualizacion,
          });
        }
      }
      
      console.log(`✅ ${eventosParaActualizar.length} eventos actualizados exitosamente.`);
    } else {
      console.log('✅ Todos los eventos ya tienen todos los campos completos.');
    }
    
    console.log('💡 Si deseas crear nuevos eventos, elimina los eventos existentes primero.');
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

  // Obtener un RunnerUID de ejemplo si existe
  const usuarioEjemplo = await prisma.sec_users.findFirst();
  const runnerUIDEjemplo = usuarioEjemplo?.RunnerUID || null;

  // Crear eventos de ejemplo con acentos (UTF-8) - COMPLETOS con todos los campos
  const eventos = [
    {
      OrgID: organizador.OrgID,
      RunnerUID: runnerUIDEjemplo,
      Titulo: 'Maratón de Mérida 2024',
      Subtitulo: 'Carrera por las calles históricas de Mérida. Únete a la carrera más importante de la Península de Yucatán.',
      TipoEvento: 'Carrera',
      Internacional: 'N',
      Distancias: '5K, 10K, 21K, 42K',
      Categorias: 'Libre, Veteranos, Juvenil',
      FechaEvento: new Date('2024-12-15'),
      HoraEvento: new Date('1970-01-01T06:00:00Z'),
      Ciudad: 'Mérida',
      Estado: 'Yucatán',
      Pais: 'México',
      Lugar: 'Centro Histórico de Mérida',
      UrlMapa: 'https://maps.google.com/merida',
      UrlCalendario: 'https://calendar.google.com/event?action=TEMPLATE&tmeid=abc123',
      imagen: 'https://ejemplo.com/imagenes/maraton-merida-2024.jpg',
      UrlImagen: 'https://ejemplo.com/imagenes/maraton-merida-2024.jpg',
      UrlRegistro: 'https://zona2.mx/eventos/maraton-merida-2024/registro',
      UrlPagoDirecto: 'https://zona2.mx/pago/maraton-merida-2024',
      MaxPuntosZ2: 5000,
      MaxDescuentoZ2: 50,
      PuntosEquivalencia: 100,
      DescuentoImporte: 50.00,
      editCartaExoneracion: 'Carta de exoneración de responsabilidad para el Maratón de Mérida 2024. Los participantes asumen todos los riesgos...',
      UrlCartaExoneracion: 'https://zona2.mx/documentos/carta-exoneracion-maraton-merida.pdf',
      editGuiaExpectador: 'Guía completa para espectadores del Maratón de Mérida 2024. Puntos de observación, horarios, estacionamiento...',
      GuiaExpectador: 'https://zona2.mx/documentos/guia-expectador-maraton-merida.pdf',
      PrecioEvento: 500.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
    {
      OrgID: organizador.OrgID,
      RunnerUID: runnerUIDEjemplo,
      Titulo: 'Carrera del Día de la Independencia',
      Subtitulo: 'Celebra la independencia corriendo por las hermosas playas de Cancún',
      TipoEvento: 'Carrera',
      Internacional: 'N',
      Distancias: '5K, 10K',
      Categorias: 'Libre',
      FechaEvento: new Date('2024-09-16'),
      HoraEvento: new Date('1970-01-01T07:00:00Z'),
      Ciudad: 'Cancún',
      Estado: 'Quintana Roo',
      Pais: 'México',
      Lugar: 'Playa Delfines',
      UrlMapa: 'https://maps.google.com/cancun',
      UrlCalendario: 'https://calendar.google.com/event?action=TEMPLATE&tmeid=def456',
      imagen: 'https://ejemplo.com/imagenes/carrera-independencia-cancun.jpg',
      UrlImagen: 'https://ejemplo.com/imagenes/carrera-independencia-cancun.jpg',
      UrlRegistro: 'https://zona2.mx/eventos/carrera-independencia/registro',
      UrlPagoDirecto: 'https://zona2.mx/pago/carrera-independencia',
      MaxPuntosZ2: 3000,
      MaxDescuentoZ2: 30,
      PuntosEquivalencia: 100,
      DescuentoImporte: 30.00,
      editCartaExoneracion: 'Carta de exoneración de responsabilidad para la Carrera del Día de la Independencia.',
      UrlCartaExoneracion: 'https://zona2.mx/documentos/carta-exoneracion-independencia.pdf',
      editGuiaExpectador: 'Guía para espectadores de la Carrera del Día de la Independencia en Cancún.',
      GuiaExpectador: 'https://zona2.mx/documentos/guia-expectador-independencia.pdf',
      PrecioEvento: 400.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
    {
      OrgID: organizador.OrgID,
      RunnerUID: runnerUIDEjemplo,
      Titulo: 'Maratón Internacional de la Ciudad de México',
      Subtitulo: 'La carrera más importante de la capital. Evento internacional con corredores de todo el mundo.',
      TipoEvento: 'Carrera',
      Internacional: 'S',
      Distancias: '10K, 21K, 42K',
      Categorias: 'Libre, Élite, Veteranos',
      FechaEvento: new Date('2024-11-10'),
      HoraEvento: new Date('1970-01-01T05:30:00Z'),
      Ciudad: 'Ciudad de México',
      Estado: 'Ciudad de México',
      Pais: 'México',
      Lugar: 'Bosque de Chapultepec',
      UrlMapa: 'https://maps.google.com/cdmx',
      UrlCalendario: 'https://calendar.google.com/event?action=TEMPLATE&tmeid=ghi789',
      imagen: 'https://ejemplo.com/imagenes/maraton-cdmx-2024.jpg',
      UrlImagen: 'https://ejemplo.com/imagenes/maraton-cdmx-2024.jpg',
      UrlRegistro: 'https://zona2.mx/eventos/maraton-cdmx-2024/registro',
      UrlPagoDirecto: 'https://zona2.mx/pago/maraton-cdmx-2024',
      MaxPuntosZ2: 10000,
      MaxDescuentoZ2: 100,
      PuntosEquivalencia: 100,
      DescuentoImporte: 100.00,
      editCartaExoneracion: 'Carta de exoneración de responsabilidad para el Maratón Internacional de la Ciudad de México 2024.',
      UrlCartaExoneracion: 'https://zona2.mx/documentos/carta-exoneracion-maraton-cdmx.pdf',
      editGuiaExpectador: 'Guía completa para espectadores del Maratón Internacional de la Ciudad de México.',
      GuiaExpectador: 'https://zona2.mx/documentos/guia-expectador-maraton-cdmx.pdf',
      PrecioEvento: 800.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
    {
      OrgID: organizador.OrgID,
      RunnerUID: runnerUIDEjemplo,
      Titulo: 'Carrera Nocturna de Guadalajara',
      Subtitulo: 'Corre bajo las estrellas en Guadalajara. Una experiencia única en la Perla Tapatía.',
      TipoEvento: 'Carrera',
      Internacional: 'N',
      Distancias: '5K, 10K',
      Categorias: 'Libre',
      FechaEvento: new Date('2024-10-20'),
      HoraEvento: new Date('1970-01-01T20:00:00Z'),
      Ciudad: 'Guadalajara',
      Estado: 'Jalisco',
      Pais: 'México',
      Lugar: 'Centro de Guadalajara',
      UrlMapa: 'https://maps.google.com/guadalajara',
      UrlCalendario: 'https://calendar.google.com/event?action=TEMPLATE&tmeid=jkl012',
      imagen: 'https://ejemplo.com/imagenes/carrera-nocturna-guadalajara.jpg',
      UrlImagen: 'https://ejemplo.com/imagenes/carrera-nocturna-guadalajara.jpg',
      UrlRegistro: 'https://zona2.mx/eventos/carrera-nocturna-guadalajara/registro',
      UrlPagoDirecto: 'https://zona2.mx/pago/carrera-nocturna-guadalajara',
      MaxPuntosZ2: 2500,
      MaxDescuentoZ2: 25,
      PuntosEquivalencia: 100,
      DescuentoImporte: 25.00,
      editCartaExoneracion: 'Carta de exoneración de responsabilidad para la Carrera Nocturna de Guadalajara.',
      UrlCartaExoneracion: 'https://zona2.mx/documentos/carta-exoneracion-nocturna-gdl.pdf',
      editGuiaExpectador: 'Guía para espectadores de la Carrera Nocturna de Guadalajara.',
      GuiaExpectador: 'https://zona2.mx/documentos/guia-expectador-nocturna-gdl.pdf',
      PrecioEvento: 350.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
    {
      OrgID: organizador.OrgID,
      RunnerUID: runnerUIDEjemplo,
      Titulo: 'Maratón de Monterrey',
      Subtitulo: 'Desafía las montañas de Monterrey. La carrera más desafiante del norte de México.',
      TipoEvento: 'Carrera',
      Internacional: 'N',
      Distancias: '10K, 21K, 42K',
      Categorias: 'Libre, Veteranos',
      FechaEvento: new Date('2024-12-01'),
      HoraEvento: new Date('1970-01-01T06:30:00Z'),
      Ciudad: 'Monterrey',
      Estado: 'Nuevo León',
      Pais: 'México',
      Lugar: 'Parque Fundidora',
      UrlMapa: 'https://maps.google.com/monterrey',
      UrlCalendario: 'https://calendar.google.com/event?action=TEMPLATE&tmeid=mno345',
      imagen: 'https://ejemplo.com/imagenes/maraton-monterrey-2024.jpg',
      UrlImagen: 'https://ejemplo.com/imagenes/maraton-monterrey-2024.jpg',
      UrlRegistro: 'https://zona2.mx/eventos/maraton-monterrey-2024/registro',
      UrlPagoDirecto: 'https://zona2.mx/pago/maraton-monterrey-2024',
      MaxPuntosZ2: 6000,
      MaxDescuentoZ2: 60,
      PuntosEquivalencia: 100,
      DescuentoImporte: 60.00,
      editCartaExoneracion: 'Carta de exoneración de responsabilidad para el Maratón de Monterrey 2024.',
      UrlCartaExoneracion: 'https://zona2.mx/documentos/carta-exoneracion-maraton-mty.pdf',
      editGuiaExpectador: 'Guía completa para espectadores del Maratón de Monterrey.',
      GuiaExpectador: 'https://zona2.mx/documentos/guia-expectador-maraton-mty.pdf',
      PrecioEvento: 600.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
    {
      OrgID: organizador.OrgID,
      RunnerUID: runnerUIDEjemplo,
      Titulo: 'Carrera de la Revolución en Puebla',
      Subtitulo: 'Conmemora la revolución mexicana corriendo por las calles históricas de Puebla',
      TipoEvento: 'Carrera',
      Internacional: 'N',
      Distancias: '5K, 10K, 21K',
      Categorias: 'Libre',
      FechaEvento: new Date('2024-11-20'),
      HoraEvento: new Date('1970-01-01T07:00:00Z'),
      Ciudad: 'Puebla',
      Estado: 'Puebla',
      Pais: 'México',
      Lugar: 'Zócalo de Puebla',
      UrlMapa: 'https://maps.google.com/puebla',
      UrlCalendario: 'https://calendar.google.com/event?action=TEMPLATE&tmeid=pqr678',
      imagen: 'https://ejemplo.com/imagenes/carrera-revolucion-puebla.jpg',
      UrlImagen: 'https://ejemplo.com/imagenes/carrera-revolucion-puebla.jpg',
      UrlRegistro: 'https://zona2.mx/eventos/carrera-revolucion-puebla/registro',
      UrlPagoDirecto: 'https://zona2.mx/pago/carrera-revolucion-puebla',
      MaxPuntosZ2: 4000,
      MaxDescuentoZ2: 40,
      PuntosEquivalencia: 100,
      DescuentoImporte: 40.00,
      editCartaExoneracion: 'Carta de exoneración de responsabilidad para la Carrera de la Revolución en Puebla.',
      UrlCartaExoneracion: 'https://zona2.mx/documentos/carta-exoneracion-revolucion-puebla.pdf',
      editGuiaExpectador: 'Guía para espectadores de la Carrera de la Revolución en Puebla.',
      GuiaExpectador: 'https://zona2.mx/documentos/guia-expectador-revolucion-puebla.pdf',
      PrecioEvento: 450.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
    {
      OrgID: organizador.OrgID,
      RunnerUID: runnerUIDEjemplo,
      Titulo: 'Maratón de Oaxaca',
      Subtitulo: 'Corre por las calles coloniales de Oaxaca. Disfruta de la cultura y tradición oaxaqueña.',
      TipoEvento: 'Carrera',
      Internacional: 'N',
      Distancias: '10K, 21K',
      Categorias: 'Libre, Juvenil',
      FechaEvento: new Date('2024-10-15'),
      HoraEvento: new Date('1970-01-01T06:00:00Z'),
      Ciudad: 'Oaxaca',
      Estado: 'Oaxaca',
      Pais: 'México',
      Lugar: 'Centro Histórico de Oaxaca',
      UrlMapa: 'https://maps.google.com/oaxaca',
      UrlCalendario: 'https://calendar.google.com/event?action=TEMPLATE&tmeid=stu901',
      imagen: 'https://ejemplo.com/imagenes/maraton-oaxaca-2024.jpg',
      UrlImagen: 'https://ejemplo.com/imagenes/maraton-oaxaca-2024.jpg',
      UrlRegistro: 'https://zona2.mx/eventos/maraton-oaxaca-2024/registro',
      UrlPagoDirecto: 'https://zona2.mx/pago/maraton-oaxaca-2024',
      MaxPuntosZ2: 3500,
      MaxDescuentoZ2: 35,
      PuntosEquivalencia: 100,
      DescuentoImporte: 35.00,
      editCartaExoneracion: 'Carta de exoneración de responsabilidad para el Maratón de Oaxaca 2024.',
      UrlCartaExoneracion: 'https://zona2.mx/documentos/carta-exoneracion-maraton-oaxaca.pdf',
      editGuiaExpectador: 'Guía completa para espectadores del Maratón de Oaxaca.',
      GuiaExpectador: 'https://zona2.mx/documentos/guia-expectador-maraton-oaxaca.pdf',
      PrecioEvento: 400.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
    {
      OrgID: organizador.OrgID,
      RunnerUID: runnerUIDEjemplo,
      Titulo: 'Carrera del Día de Muertos en Morelia',
      Subtitulo: 'Celebra el día de muertos corriendo por las calles de Morelia. Una experiencia única llena de tradición.',
      TipoEvento: 'Carrera',
      Internacional: 'N',
      Distancias: '5K, 10K',
      Categorias: 'Libre',
      FechaEvento: new Date('2024-11-02'),
      HoraEvento: new Date('1970-01-01T18:00:00Z'),
      Ciudad: 'Morelia',
      Estado: 'Michoacán',
      Pais: 'México',
      Lugar: 'Centro Histórico de Morelia',
      UrlMapa: 'https://maps.google.com/morelia',
      UrlCalendario: 'https://calendar.google.com/event?action=TEMPLATE&tmeid=vwx234',
      imagen: 'https://ejemplo.com/imagenes/carrera-dia-muertos-morelia.jpg',
      UrlImagen: 'https://ejemplo.com/imagenes/carrera-dia-muertos-morelia.jpg',
      UrlRegistro: 'https://zona2.mx/eventos/carrera-dia-muertos-morelia/registro',
      UrlPagoDirecto: 'https://zona2.mx/pago/carrera-dia-muertos-morelia',
      MaxPuntosZ2: 2500,
      MaxDescuentoZ2: 25,
      PuntosEquivalencia: 100,
      DescuentoImporte: 25.00,
      editCartaExoneracion: 'Carta de exoneración de responsabilidad para la Carrera del Día de Muertos en Morelia.',
      UrlCartaExoneracion: 'https://zona2.mx/documentos/carta-exoneracion-dia-muertos-morelia.pdf',
      editGuiaExpectador: 'Guía para espectadores de la Carrera del Día de Muertos en Morelia.',
      GuiaExpectador: 'https://zona2.mx/documentos/guia-expectador-dia-muertos-morelia.pdf',
      PrecioEvento: 350.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
    {
      OrgID: organizador.OrgID,
      RunnerUID: runnerUIDEjemplo,
      Titulo: 'Maratón de Tijuana',
      Subtitulo: 'Carrera fronteriza en Tijuana. Conecta dos países corriendo.',
      TipoEvento: 'Carrera',
      Internacional: 'S',
      Distancias: '10K, 21K, 42K',
      Categorias: 'Libre, Veteranos',
      FechaEvento: new Date('2024-12-08'),
      HoraEvento: new Date('1970-01-01T06:00:00Z'),
      Ciudad: 'Tijuana',
      Estado: 'Baja California',
      Pais: 'México',
      Lugar: 'Playa de Tijuana',
      UrlMapa: 'https://maps.google.com/tijuana',
      UrlCalendario: 'https://calendar.google.com/event?action=TEMPLATE&tmeid=yza567',
      imagen: 'https://ejemplo.com/imagenes/maraton-tijuana-2024.jpg',
      UrlImagen: 'https://ejemplo.com/imagenes/maraton-tijuana-2024.jpg',
      UrlRegistro: 'https://zona2.mx/eventos/maraton-tijuana-2024/registro',
      UrlPagoDirecto: 'https://zona2.mx/pago/maraton-tijuana-2024',
      MaxPuntosZ2: 5500,
      MaxDescuentoZ2: 55,
      PuntosEquivalencia: 100,
      DescuentoImporte: 55.00,
      editCartaExoneracion: 'Carta de exoneración de responsabilidad para el Maratón de Tijuana 2024.',
      UrlCartaExoneracion: 'https://zona2.mx/documentos/carta-exoneracion-maraton-tijuana.pdf',
      editGuiaExpectador: 'Guía completa para espectadores del Maratón de Tijuana.',
      GuiaExpectador: 'https://zona2.mx/documentos/guia-expectador-maraton-tijuana.pdf',
      PrecioEvento: 550.00,
      Moneda: 'MXN',
      Estatus: 'publicado',
    },
    {
      OrgID: organizador.OrgID,
      RunnerUID: runnerUIDEjemplo,
      Titulo: 'Carrera de San Miguel de Allende',
      Subtitulo: 'Corre por las calles pintorescas de San Miguel de Allende. Una experiencia única en una de las ciudades más bellas de México.',
      TipoEvento: 'Carrera',
      Internacional: 'N',
      Distancias: '5K, 10K',
      Categorias: 'Libre',
      FechaEvento: new Date('2024-11-30'),
      HoraEvento: new Date('1970-01-01T07:00:00Z'),
      Ciudad: 'San Miguel de Allende',
      Estado: 'Guanajuato',
      Pais: 'México',
      Lugar: 'Centro de San Miguel de Allende',
      UrlMapa: 'https://maps.google.com/sanmiguel',
      UrlCalendario: 'https://calendar.google.com/event?action=TEMPLATE&tmeid=bcd890',
      imagen: 'https://ejemplo.com/imagenes/carrera-san-miguel-allende.jpg',
      UrlImagen: 'https://ejemplo.com/imagenes/carrera-san-miguel-allende.jpg',
      UrlRegistro: 'https://zona2.mx/eventos/carrera-san-miguel-allende/registro',
      UrlPagoDirecto: 'https://zona2.mx/pago/carrera-san-miguel-allende',
      MaxPuntosZ2: 4000,
      MaxDescuentoZ2: 40,
      PuntosEquivalencia: 100,
      DescuentoImporte: 40.00,
      editCartaExoneracion: 'Carta de exoneración de responsabilidad para la Carrera de San Miguel de Allende.',
      UrlCartaExoneracion: 'https://zona2.mx/documentos/carta-exoneracion-san-miguel-allende.pdf',
      editGuiaExpectador: 'Guía para espectadores de la Carrera de San Miguel de Allende.',
      GuiaExpectador: 'https://zona2.mx/documentos/guia-expectador-san-miguel-allende.pdf',
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

  // Crear promociones
  console.log('\n🎁 Creando promociones...');
  
  const promocionesExistentes = await prisma.promociones.count();
  if (promocionesExistentes > 0) {
    console.log(`⚠️  Ya existen ${promocionesExistentes} promociones en la base de datos.`);
    return;
  }

  const promociones = [
    {
      OrgID: organizador.OrgID,
      Titulo: '20% OFF en tu primera compra',
      Subtitulo: 'Usa el código BIENVENIDO20 y obtén un 20% de descuento en tu primera compra. Válido solo para nuevos usuarios.',
      Precio: 0.00,
      Moneda: 'MXN',
      MaxPuntosZ2: 5000,
      DescuentoImporte: 20.00,
      TipoPromo: promociones_TipoPromo.DescuentoZ2,
      FechaInicio: new Date('2024-01-01'),
      FechaFin: new Date('2025-12-31'),
      Estatus: promociones_Estatus.Activa,
    },
    {
      OrgID: organizador.OrgID,
      Titulo: 'Doble puntos este mes',
      Subtitulo: 'Gana el doble de puntos en todas tus actividades durante este mes. ¡Aprovecha y acumula más puntos!',
      Precio: 0.00,
      Moneda: 'MXN',
      MaxPuntosZ2: 10000,
      DescuentoImporte: 0.00,
      TipoPromo: promociones_TipoPromo.DescuentoMixto,
      FechaInicio: new Date('2024-12-01'),
      FechaFin: new Date('2024-12-31'),
      Estatus: promociones_Estatus.Activa,
    },
    {
      OrgID: organizador.OrgID,
      Titulo: 'Regalo por referir amigos',
      Subtitulo: 'Obtén 500 puntos por cada amigo que invites a la plataforma. ¡Comparte y gana!',
      Precio: 0.00,
      Moneda: 'MXN',
      MaxPuntosZ2: 500,
      DescuentoImporte: 0.00,
      TipoPromo: promociones_TipoPromo.ProductoGratis,
      FechaInicio: new Date('2024-01-01'),
      FechaFin: new Date('2025-12-31'),
      Estatus: promociones_Estatus.Activa,
    },
  ];

  // Insertar promociones
  for (const promocion of promociones) {
    await prisma.promociones.create({
      data: promocion,
    });
  }

  console.log(`✅ ${promociones.length} promociones creadas exitosamente.`);
  console.log('🎁 Promociones creadas:');
  promociones.forEach((promocion, index) => {
    console.log(`   ${index + 1}. ${promocion.Titulo}`);
  });

  // Crear datos de ejemplo para el usuario Z2R738268MVJ
  console.log('\n👤 Creando datos de ejemplo para usuario Z2R738268MVJ...');
  
  const runnerUID = 'Z2R738268MVJ';
  
  // Verificar si el usuario existe
  const usuario = await prisma.sec_users.findFirst({
    where: { RunnerUID: runnerUID },
  });

  if (!usuario) {
    console.log('⚠️  El usuario no existe. Creando usuario de ejemplo...');
    // Crear usuario de ejemplo
    await prisma.sec_users.create({
      data: {
        RunnerUID: runnerUID,
        AliasRunner: 'R867883KCV',
        name: 'Luis López',
        login: '9982355989',
        phone: '9982355989',
        email: 'Luislopez@gmail.com',
        pswd: 'hashed_password_example',
        TipoMembresia: 'R',
        WalletPuntosI: 10000,
        WalletPuntos: 1500,
        WalletSaldoMXN: 250.50,
        Ciudad: 'Mérida',
        Estado: 'Yucatán',
        Pais: 'México',
        FechaRegistro: new Date(),
        active: 'Y',
      },
    });
    console.log('✅ Usuario creado exitosamente.');
  } else {
    console.log('✅ Usuario ya existe.');
  }

  // Crear actividades
  console.log('\n🏃 Creando actividades...');
  const actividadesExistentes = await prisma.actividades.count({
    where: { RunnerUID: runnerUID },
  });

  if (actividadesExistentes === 0) {
    const actividades = [
      {
        RunnerUID: runnerUID,
        plataforma: 'S',
        titulo: 'Carrera matutina en Mérida',
        fechaActividad: new Date('2024-12-01T06:00:00Z'),
        DistanciaKM: 5.5,
        RitmoMinKm: '5:30',
        Duracion: '30:15',
        Origen: 'Strava',
        Ciudad: 'Mérida',
        Pais: 'México',
        enlace: 'https://www.strava.com/activities/123456789',
      },
      {
        RunnerUID: runnerUID,
        plataforma: 'S',
        titulo: 'Entrenamiento de velocidad',
        fechaActividad: new Date('2024-12-03T18:00:00Z'),
        DistanciaKM: 3.2,
        RitmoMinKm: '4:45',
        Duracion: '15:12',
        Origen: 'Strava',
        Ciudad: 'Mérida',
        Pais: 'México',
        enlace: 'https://www.strava.com/activities/123456790',
      },
      {
        RunnerUID: runnerUID,
        plataforma: 'G',
        titulo: 'Larga distancia dominical',
        fechaActividad: new Date('2024-12-08T07:00:00Z'),
        DistanciaKM: 15.8,
        RitmoMinKm: '6:00',
        Duracion: '1:34:48',
        Origen: 'Garmin',
        Ciudad: 'Mérida',
        Pais: 'México',
        enlace: 'https://connect.garmin.com/modern/activity/123456791',
      },
      {
        RunnerUID: runnerUID,
        plataforma: 'S',
        titulo: 'Recuperación activa',
        fechaActividad: new Date('2024-12-10T06:30:00Z'),
        DistanciaKM: 4.0,
        RitmoMinKm: '6:30',
        Duracion: '26:00',
        Origen: 'Strava',
        Ciudad: 'Mérida',
        Pais: 'México',
        enlace: 'https://www.strava.com/activities/123456792',
      },
      {
        RunnerUID: runnerUID,
        plataforma: 'S',
        titulo: 'Intervalos en pista',
        fechaActividad: new Date('2024-12-12T19:00:00Z'),
        DistanciaKM: 8.5,
        RitmoMinKm: '5:00',
        Duracion: '42:30',
        Origen: 'Strava',
        Ciudad: 'Mérida',
        Pais: 'México',
        enlace: 'https://www.strava.com/activities/123456793',
      },
    ];

    for (const actividad of actividades) {
      await prisma.actividades.create({
        data: actividad,
      });
    }
    console.log(`✅ ${actividades.length} actividades creadas exitosamente.`);
  } else {
    console.log(`⚠️  Ya existen ${actividadesExistentes} actividades para este usuario.`);
  }

  // Crear zonas (puntos)
  console.log('\n💰 Creando zonas (puntos)...');
  const zonasExistentes = await prisma.zonas.count({
    where: { RunnerUID: runnerUID },
  });

  if (zonasExistentes === 0) {
    const zonas = [
      {
        RunnerUID: runnerUID,
        RunnerUIDRef: 'RR317DAO', // Si hay referidor, usar su RunnerUID, si no, usar cadena vacía ''
        puntos: 500,
        motivo: 'R', // Motivo 'R' para referidos
        origen: '3', // Origen '3' para referidos
        fecha: new Date('2024-11-27T10:00:00Z'),
      },
      {
        RunnerUID: runnerUID,
        RunnerUIDRef: 'RR317DAO',
        puntos: 300,
        motivo: 'R',
        origen: '3',
        fecha: new Date('2024-12-01T10:00:00Z'),
      },
      {
        RunnerUID: runnerUID,
        RunnerUIDRef: 'RR317DAO',
        puntos: 200,
        motivo: 'R',
        origen: '3',
        fecha: new Date('2024-12-05T10:00:00Z'),
      },
    ];

    for (const zona of zonas) {
      await prisma.zonas.create({
        data: zona,
      });
    }
    console.log(`✅ ${zonas.length} zonas creadas exitosamente.`);
  } else {
    console.log(`⚠️  Ya existen ${zonasExistentes} zonas para este usuario.`);
  }

  // Crear suscripción
  console.log('\n📋 Creando suscripción...');
  // Generar SubscriptionUID en formato #NNNNNNLLL
  const generateSubscriptionUID = (): string => {
    const nums = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
    const char1 = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    const char2 = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    const char3 = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    return `#${nums}${char1}${char2}${char3}`;
  };
  
  const subscriptionUID = generateSubscriptionUID();
  const suscripcionExistente = await prisma.subscriptions.findUnique({
    where: { SubscriptionUID: subscriptionUID },
  });

  if (!suscripcionExistente) {
    await prisma.subscriptions.create({
      data: {
        SubscriptionUID: subscriptionUID,
        RunnerUID: runnerUID,
        PlanCode: subscriptions_PlanCode.Runner,
        PlanVersion: 1,
        BillingCycle: subscriptions_BillingCycle.Yearly,
        Status: subscriptions_Status.Active,
        StartAt: new Date('2024-11-27'),
        EndAt: new Date('2025-11-27'),
        NextChargeAt: new Date('2025-11-27'),
        Currency: 'MXN',
        PriceMXN: 399.00,
        AutoRenew: true,
      },
    });
    console.log(`✅ Suscripción creada exitosamente con ID: ${subscriptionUID}`);
  } else {
    console.log('✅ Suscripción ya existe.');
  }

  // Crear inscripciones a eventos
  console.log('\n🎫 Creando inscripciones a eventos...');
  const eventosDisponibles = await prisma.eventos.findMany({
    take: 3,
    orderBy: { FechaEvento: 'asc' },
  });

  if (eventosDisponibles.length > 0) {
    const inscripcionesExistentes = await prisma.inscripciones.count({
      where: { RunnerUID: runnerUID },
    });

    if (inscripcionesExistentes === 0) {
      for (const evento of eventosDisponibles) {
        const precioEvento = evento.PrecioEvento || 500.00;
        await prisma.inscripciones.create({
          data: {
            EventoID: evento.EventoID,
            OrgID: evento.OrgID,
            FechaEvento: evento.FechaEvento,
            RunnerUID: runnerUID,
            RunnerNombre: 'Luis López',
            RunnerEmail: 'Luislopez@gmail.com',
            RunnerTelefono: '9982355989',
            Genero: 'M',
            FechaNacimiento: new Date('1990-05-15'),
            TallaPlayera: inscripciones_TallaPlayera.Mediana,
            DistanciaElegida: '10K',
            CategoriaElegida: 'Libre',
            Disciplina: 'Carrera',
            PrecioOriginal: precioEvento,
            PuntosUsados: 0,
            DescuentoAplicadoMXN: 0.00,
            PrecioFinal: precioEvento,
            Moneda: evento.Moneda || 'MXN',
            MetodoPago: 'Tarjeta',
            PagoTransaccionID: `txn_${Date.now()}_${evento.EventoID}`,
            PagoEstado: inscripciones_PagoEstado.Pagado,
            FechaInscripcion: new Date(),
          },
        });
      }
      console.log(`✅ ${eventosDisponibles.length} inscripciones creadas exitosamente.`);
    } else {
      console.log(`⚠️  Ya existen ${inscripcionesExistentes} inscripciones para este usuario.`);
    }
  } else {
    console.log('⚠️  No hay eventos disponibles para crear inscripciones.');
  }

  // Unir usuario a un equipo si existe
  console.log('\n⚽ Verificando equipos...');
  const equipo = await prisma.equipos.findFirst({
    where: { Activo: true },
  });

  if (equipo && !usuario?.equipoID) {
    await prisma.sec_users.updateMany({
      where: { RunnerUID: runnerUID },
      data: {
        equipoID: equipo.OrgID.toString(),
      },
    });
    console.log(`✅ Usuario unido al equipo: ${equipo.NombreEquipo || 'Equipo ID ' + equipo.OrgID}`);
  } else if (usuario?.equipoID) {
    console.log('✅ Usuario ya está en un equipo.');
  } else {
    console.log('⚠️  No hay equipos activos disponibles.');
  }

  console.log('\n✅ Datos de ejemplo para usuario Z2R738268MVJ completados exitosamente.');

  // Crear datos de ejemplo para el usuario Z2R776985QXZ
  console.log('\n👤 Creando datos de ejemplo para usuario Z2R776985QXZ...');
  
  const runnerUID2 = 'Z2R776985QXZ';
  
  // Verificar si el usuario existe
  const usuario2 = await prisma.sec_users.findFirst({
    where: { RunnerUID: runnerUID2 },
  });

  if (!usuario2) {
    console.log('⚠️  El usuario no existe. Creando usuario de ejemplo...');
    // Crear usuario de ejemplo
    await prisma.sec_users.create({
      data: {
        RunnerUID: runnerUID2,
        AliasRunner: 'R776985QXZ',
        name: 'María García',
        login: '9991234567',
        phone: '9991234567',
        email: 'mariagarcia@gmail.com',
        pswd: 'hashed_password_example',
        TipoMembresia: 'R',
        WalletPuntosI: 10000,
        WalletPuntos: 2000,
        WalletSaldoMXN: 150.75,
        Ciudad: 'Cancún',
        Estado: 'Quintana Roo',
        Pais: 'México',
        FechaRegistro: new Date(),
        active: 'Y',
      },
    });
    console.log('✅ Usuario creado exitosamente.');
  } else {
    console.log('✅ Usuario ya existe.');
  }

  // Crear actividades
  console.log('\n🏃 Creando actividades...');
  const actividadesExistentes2 = await prisma.actividades.count({
    where: { RunnerUID: runnerUID2 },
  });

  if (actividadesExistentes2 === 0) {
    const actividades2 = [
      {
        RunnerUID: runnerUID2,
        plataforma: 'S',
        titulo: 'Carrera en la playa de Cancún',
        fechaActividad: new Date('2024-12-02T07:00:00Z'),
        DistanciaKM: 6.2,
        RitmoMinKm: '5:45',
        Duracion: '35:39',
        Origen: 'Strava',
        Ciudad: 'Cancún',
        Pais: 'México',
        enlace: 'https://www.strava.com/activities/123456794',
      },
      {
        RunnerUID: runnerUID2,
        plataforma: 'G',
        titulo: 'Entrenamiento de resistencia',
        fechaActividad: new Date('2024-12-05T06:30:00Z'),
        DistanciaKM: 12.5,
        RitmoMinKm: '6:15',
        Duracion: '1:18:07',
        Origen: 'Garmin',
        Ciudad: 'Cancún',
        Pais: 'México',
        enlace: 'https://connect.garmin.com/modern/activity/123456795',
      },
      {
        RunnerUID: runnerUID2,
        plataforma: 'S',
        titulo: 'Sesión de intervalos',
        fechaActividad: new Date('2024-12-07T18:00:00Z'),
        DistanciaKM: 4.8,
        RitmoMinKm: '5:00',
        Duracion: '24:00',
        Origen: 'Strava',
        Ciudad: 'Cancún',
        Pais: 'México',
        enlace: 'https://www.strava.com/activities/123456796',
      },
      {
        RunnerUID: runnerUID2,
        plataforma: 'S',
        titulo: 'Carrera larga dominical',
        fechaActividad: new Date('2024-12-09T08:00:00Z'),
        DistanciaKM: 18.5,
        RitmoMinKm: '6:00',
        Duracion: '1:51:00',
        Origen: 'Strava',
        Ciudad: 'Cancún',
        Pais: 'México',
        enlace: 'https://www.strava.com/activities/123456797',
      },
      {
        RunnerUID: runnerUID2,
        plataforma: 'G',
        titulo: 'Recuperación activa',
        fechaActividad: new Date('2024-12-11T19:00:00Z'),
        DistanciaKM: 3.5,
        RitmoMinKm: '7:00',
        Duracion: '24:30',
        Origen: 'Garmin',
        Ciudad: 'Cancún',
        Pais: 'México',
        enlace: 'https://connect.garmin.com/modern/activity/123456798',
      },
    ];

    for (const actividad of actividades2) {
      await prisma.actividades.create({
        data: actividad,
      });
    }
    console.log(`✅ ${actividades2.length} actividades creadas exitosamente.`);
  } else {
    console.log(`⚠️  Ya existen ${actividadesExistentes2} actividades para este usuario.`);
  }

  // Crear zonas (puntos)
  console.log('\n💰 Creando zonas (puntos)...');
  const zonasExistentes2 = await prisma.zonas.count({
    where: { RunnerUID: runnerUID2 },
  });

  if (zonasExistentes2 === 0) {
    const zonas2 = [
      {
        RunnerUID: runnerUID2,
        RunnerUIDRef: 'RR317DAO', // Si hay referidor, usar su RunnerUID, si no, usar cadena vacía ''
        puntos: 600,
        motivo: 'R', // Motivo 'R' para referidos
        origen: '3', // Origen '3' para referidos
        fecha: new Date('2024-11-28T10:00:00Z'),
      },
      {
        RunnerUID: runnerUID2,
        RunnerUIDRef: 'RR317DAO',
        puntos: 400,
        motivo: 'R',
        origen: '3',
        fecha: new Date('2024-12-02T10:00:00Z'),
      },
      {
        RunnerUID: runnerUID2,
        RunnerUIDRef: 'RR317DAO',
        puntos: 300,
        motivo: 'R',
        origen: '3',
        fecha: new Date('2024-12-06T10:00:00Z'),
      },
    ];

    for (const zona of zonas2) {
      await prisma.zonas.create({
        data: zona,
      });
    }
    console.log(`✅ ${zonas2.length} zonas creadas exitosamente.`);
  } else {
    console.log(`⚠️  Ya existen ${zonasExistentes2} zonas para este usuario.`);
  }

  // Crear suscripción
  console.log('\n📋 Creando suscripción...');
  // Generar SubscriptionUID en formato #NNNNNNLLL
  const generateSubscriptionUID2 = (): string => {
    const nums = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
    const char1 = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    const char2 = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    const char3 = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    return `#${nums}${char1}${char2}${char3}`;
  };
  
  const subscriptionUID2 = generateSubscriptionUID2();
  const suscripcionExistente2 = await prisma.subscriptions.findUnique({
    where: { SubscriptionUID: subscriptionUID2 },
  });

  if (!suscripcionExistente2) {
    await prisma.subscriptions.create({
      data: {
        SubscriptionUID: subscriptionUID2,
        RunnerUID: runnerUID2,
        PlanCode: subscriptions_PlanCode.Runner,
        PlanVersion: 1,
        BillingCycle: subscriptions_BillingCycle.Yearly,
        Status: subscriptions_Status.Active,
        StartAt: new Date('2024-11-28'),
        EndAt: new Date('2025-11-28'),
        NextChargeAt: new Date('2025-11-28'),
        Currency: 'MXN',
        PriceMXN: 399.00,
        AutoRenew: true,
      },
    });
    console.log(`✅ Suscripción creada exitosamente con ID: ${subscriptionUID2}`);
  } else {
    console.log('✅ Suscripción ya existe.');
  }

  // Crear inscripciones a eventos
  console.log('\n🎫 Creando inscripciones a eventos...');
  const eventosDisponibles2 = await prisma.eventos.findMany({
    skip: 3,
    take: 2,
    orderBy: { FechaEvento: 'asc' },
  });

  if (eventosDisponibles2.length > 0) {
    const inscripcionesExistentes2 = await prisma.inscripciones.count({
      where: { RunnerUID: runnerUID2 },
    });

    if (inscripcionesExistentes2 === 0) {
      for (const evento of eventosDisponibles2) {
        const precioEvento = evento.PrecioEvento || 500.00;
        await prisma.inscripciones.create({
          data: {
            EventoID: evento.EventoID,
            OrgID: evento.OrgID,
            FechaEvento: evento.FechaEvento,
            RunnerUID: runnerUID2,
            RunnerNombre: 'María García',
            RunnerEmail: 'mariagarcia@gmail.com',
            RunnerTelefono: '9991234567',
            Genero: 'F',
            FechaNacimiento: new Date('1992-08-20'),
            TallaPlayera: inscripciones_TallaPlayera.Chica,
            DistanciaElegida: '5K',
            CategoriaElegida: 'Libre',
            Disciplina: 'Carrera',
            PrecioOriginal: precioEvento,
            PuntosUsados: 0,
            DescuentoAplicadoMXN: 0.00,
            PrecioFinal: precioEvento,
            Moneda: evento.Moneda || 'MXN',
            MetodoPago: 'Tarjeta',
            PagoTransaccionID: `txn_${Date.now()}_${evento.EventoID}_2`,
            PagoEstado: inscripciones_PagoEstado.Pagado,
            FechaInscripcion: new Date(),
          },
        });
      }
      console.log(`✅ ${eventosDisponibles2.length} inscripciones creadas exitosamente.`);
    } else {
      console.log(`⚠️  Ya existen ${inscripcionesExistentes2} inscripciones para este usuario.`);
    }
  } else {
    console.log('⚠️  No hay eventos disponibles para crear inscripciones.');
  }

  // Unir usuario a un equipo si existe
  console.log('\n⚽ Verificando equipos...');
  const equipo2 = await prisma.equipos.findFirst({
    where: { Activo: true },
  });

  if (equipo2 && !usuario2?.equipoID) {
    await prisma.sec_users.updateMany({
      where: { RunnerUID: runnerUID2 },
      data: {
        equipoID: equipo2.OrgID.toString(),
      },
    });
    console.log(`✅ Usuario unido al equipo: ${equipo2.NombreEquipo || 'Equipo ID ' + equipo2.OrgID}`);
  } else if (usuario2?.equipoID) {
    console.log('✅ Usuario ya está en un equipo.');
  } else {
    console.log('⚠️  No hay equipos activos disponibles.');
  }

  console.log('\n✅ Datos de ejemplo para usuario Z2R776985QXZ completados exitosamente.');

  // Crear datos para el organizador Z2R698973TQU
  console.log('\n🏢 Creando datos para organizador Z2R698973TQU...');
  
  const organizadorUID = 'Z2R698973TQU';
  
  // Verificar si el usuario organizador existe
  const usuarioOrganizador = await prisma.sec_users.findFirst({
    where: { RunnerUID: organizadorUID },
  });

  let organizadorRegistro;

  if (!usuarioOrganizador) {
    console.log('⚠️  El usuario organizador no existe. Creando usuario y organizador...');
    
    // Crear usuario organizador
    const nuevoUsuario = await prisma.sec_users.create({
      data: {
        RunnerUID: organizadorUID,
        AliasRunner: 'R698973TQU',
        name: 'Carlos Méndez',
        login: '9987654321',
        phone: '9987654321',
        email: 'carlos.mendez@eventos.com',
        pswd: 'hashed_password_example',
        TipoMembresia: 'O',
        WalletPuntosI: 10000,
        WalletPuntos: null,
        WalletSaldoMXN: 500.00,
        Ciudad: 'Mérida',
        Estado: 'Yucatán',
        Pais: 'México',
        FechaRegistro: new Date(),
        active: 'Y',
      },
    });
    console.log('✅ Usuario organizador creado exitosamente.');

    // Crear registro en organizadores
    organizadorRegistro = await prisma.organizadores.create({
      data: {
        RunnerUID: organizadorUID,
        NombreComercial: 'Eventos Deportivos Mérida',
        RazonSocial: 'Eventos Deportivos Mérida SA de CV',
        ContactoNombre: 'Carlos Méndez',
        ContactoEmail: 'carlos.mendez@eventos.com',
        ContactoTelefono: '9987654321',
        RFC: 'MEMC850101ABC',
        Ciudad: 'Mérida',
        Estado: 'Yucatán',
        Pais: 'México',
        Estatus: 'activo',
      },
    });
    console.log(`✅ Organizador creado con ID: ${organizadorRegistro.OrgID}`);
  } else {
    console.log('✅ Usuario organizador ya existe.');
    
    // Buscar el registro de organizador
    organizadorRegistro = await prisma.organizadores.findFirst({
      where: { RunnerUID: organizadorUID },
    });

    if (!organizadorRegistro) {
      // Si el usuario existe pero no tiene registro de organizador, crearlo
      organizadorRegistro = await prisma.organizadores.create({
        data: {
          RunnerUID: organizadorUID,
          NombreComercial: 'Eventos Deportivos Mérida',
          RazonSocial: 'Eventos Deportivos Mérida SA de CV',
          ContactoNombre: 'Carlos Méndez',
          ContactoEmail: 'carlos.mendez@eventos.com',
          ContactoTelefono: '9987654321',
          RFC: 'MEMC850101ABC',
          Ciudad: 'Mérida',
          Estado: 'Yucatán',
          Pais: 'México',
          Estatus: organizadores_Estatus.activo,
        },
      });
      console.log(`✅ Organizador creado con ID: ${organizadorRegistro.OrgID}`);
    } else {
      console.log(`✅ Organizador ya existe con ID: ${organizadorRegistro.OrgID}`);
    }
  }

  // Crear eventos para este organizador
  console.log('\n🎉 Creando eventos para el organizador...');
  const eventosOrganizadorExistentes = await prisma.eventos.count({
    where: { OrgID: organizadorRegistro.OrgID },
  });

  if (eventosOrganizadorExistentes === 0) {
    const eventosOrganizador = [
      {
        OrgID: organizadorRegistro.OrgID,
        RunnerUID: organizadorUID,
        Titulo: 'Maratón de la Riviera Maya 2025',
        Subtitulo: 'Carrera por las playas más hermosas de la Riviera Maya. Una experiencia única en el Caribe mexicano.',
        TipoEvento: 'Carrera',
        Internacional: 'S',
        Distancias: '5K, 10K, 21K, 42K',
        Categorias: 'Libre, Élite, Veteranos',
        FechaEvento: new Date('2025-03-15'),
        HoraEvento: new Date('1970-01-01T06:00:00Z'),
        Ciudad: 'Playa del Carmen',
        Estado: 'Quintana Roo',
        Pais: 'México',
        Lugar: 'Playa Mamitas',
        UrlMapa: 'https://maps.google.com/playadelcarmen',
        UrlCalendario: 'https://calendar.google.com/event?action=TEMPLATE&tmeid=riviera001',
        imagen: 'https://ejemplo.com/riviera-maya.jpg',
        UrlImagen: 'https://ejemplo.com/riviera-maya.jpg',
        UrlRegistro: 'https://zona2.mx/eventos/maraton-riviera-maya-2025/registro',
        UrlPagoDirecto: 'https://zona2.mx/pago/maraton-riviera-maya-2025',
        MaxPuntosZ2: 7500,
        MaxDescuentoZ2: 75,
        PuntosEquivalencia: 100,
        DescuentoImporte: 75.00,
        editCartaExoneracion: 'Carta de exoneración de responsabilidad para el Maratón de la Riviera Maya 2025.',
        UrlCartaExoneracion: 'https://zona2.mx/documentos/carta-exoneracion-riviera-maya.pdf',
        editGuiaExpectador: 'Guía completa para espectadores del Maratón de la Riviera Maya.',
        GuiaExpectador: 'https://zona2.mx/documentos/guia-expectador-riviera-maya.pdf',
        PrecioEvento: 750.00,
        Moneda: 'MXN',
        Estatus: 'publicado',
      },
      {
        OrgID: organizadorRegistro.OrgID,
        RunnerUID: organizadorUID,
        Titulo: 'Carrera Nocturna de Mérida',
        Subtitulo: 'Corre bajo las estrellas en el centro histórico de Mérida. Una experiencia mágica en la ciudad blanca.',
        TipoEvento: 'Carrera',
        Internacional: 'N',
        Distancias: '5K, 10K',
        Categorias: 'Libre',
        FechaEvento: new Date('2025-04-20'),
        HoraEvento: new Date('1970-01-01T20:00:00Z'),
        Ciudad: 'Mérida',
        Estado: 'Yucatán',
        Pais: 'México',
        Lugar: 'Centro Histórico de Mérida',
        UrlMapa: 'https://maps.google.com/merida',
        UrlCalendario: 'https://calendar.google.com/event?action=TEMPLATE&tmeid=merida002',
        imagen: 'https://ejemplo.com/merida-nocturna.jpg',
        UrlImagen: 'https://ejemplo.com/merida-nocturna.jpg',
        UrlRegistro: 'https://zona2.mx/eventos/carrera-nocturna-merida-2025/registro',
        UrlPagoDirecto: 'https://zona2.mx/pago/carrera-nocturna-merida-2025',
        MaxPuntosZ2: 4000,
        MaxDescuentoZ2: 40,
        PuntosEquivalencia: 100,
        DescuentoImporte: 40.00,
        editCartaExoneracion: 'Carta de exoneración de responsabilidad para la Carrera Nocturna de Mérida.',
        UrlCartaExoneracion: 'https://zona2.mx/documentos/carta-exoneracion-nocturna-merida.pdf',
        editGuiaExpectador: 'Guía para espectadores de la Carrera Nocturna de Mérida.',
        GuiaExpectador: 'https://zona2.mx/documentos/guia-expectador-nocturna-merida.pdf',
        PrecioEvento: 450.00,
        Moneda: 'MXN',
        Estatus: 'publicado',
      },
      {
        OrgID: organizadorRegistro.OrgID,
        RunnerUID: organizadorUID,
        Titulo: 'Trail Running en Cenotes',
        Subtitulo: 'Carrera de trail running por los cenotes de Yucatán. Desafía la naturaleza en una experiencia única.',
        TipoEvento: 'Trail',
        Internacional: 'N',
        Distancias: '10K, 21K',
        Categorias: 'Libre, Veteranos',
        FechaEvento: new Date('2025-05-10'),
        HoraEvento: new Date('1970-01-01T07:00:00Z'),
        Ciudad: 'Valladolid',
        Estado: 'Yucatán',
        Pais: 'México',
        Lugar: 'Cenote Xkeken',
        UrlMapa: 'https://maps.google.com/valladolid',
        UrlCalendario: 'https://calendar.google.com/event?action=TEMPLATE&tmeid=cenotes003',
        imagen: 'https://ejemplo.com/cenotes.jpg',
        UrlImagen: 'https://ejemplo.com/cenotes.jpg',
        UrlRegistro: 'https://zona2.mx/eventos/trail-cenotes-2025/registro',
        UrlPagoDirecto: 'https://zona2.mx/pago/trail-cenotes-2025',
        MaxPuntosZ2: 5500,
        MaxDescuentoZ2: 55,
        PuntosEquivalencia: 100,
        DescuentoImporte: 55.00,
        editCartaExoneracion: 'Carta de exoneración de responsabilidad para el Trail Running en Cenotes. Esta carrera incluye terreno desafiante y requiere experiencia en trail running.',
        UrlCartaExoneracion: 'https://zona2.mx/documentos/carta-exoneracion-trail-cenotes.pdf',
        editGuiaExpectador: 'Guía completa para espectadores del Trail Running en Cenotes. Puntos de observación y recomendaciones.',
        GuiaExpectador: 'https://zona2.mx/documentos/guia-expectador-trail-cenotes.pdf',
        PrecioEvento: 600.00,
        Moneda: 'MXN',
        Estatus: 'publicado',
      },
    ];

    for (const evento of eventosOrganizador) {
      await prisma.eventos.create({
        data: evento,
      });
    }
    console.log(`✅ ${eventosOrganizador.length} eventos creados para el organizador.`);
  } else {
    console.log(`⚠️  Ya existen ${eventosOrganizadorExistentes} eventos para este organizador.`);
  }

  // Crear promociones para este organizador
  console.log('\n🎁 Creando promociones para el organizador...');
  const promocionesOrganizadorExistentes = await prisma.promociones.count({
    where: { OrgID: organizadorRegistro.OrgID },
  });

  if (promocionesOrganizadorExistentes === 0) {
    const promocionesOrganizador = [
      {
        OrgID: organizadorRegistro.OrgID,
        Titulo: 'Descuento Early Bird - 30% OFF',
        Subtitulo: 'Inscríbete antes del 1 de marzo y obtén un 30% de descuento en todos nuestros eventos. ¡No te lo pierdas!',
        Precio: 0.00,
        Moneda: 'MXN',
        MaxPuntosZ2: 8000,
        DescuentoImporte: 30.00,
        TipoPromo: promociones_TipoPromo.DescuentoZ2,
        FechaInicio: new Date('2025-01-01'),
        FechaFin: new Date('2025-03-01'),
        Estatus: promociones_Estatus.Activa,
      },
      {
        OrgID: organizadorRegistro.OrgID,
        Titulo: 'Pack de 3 eventos',
        Subtitulo: 'Inscríbete a 3 eventos y obtén el cuarto gratis. Válido para eventos de 2025.',
        Precio: 0.00,
        Moneda: 'MXN',
        MaxPuntosZ2: 10000,
        DescuentoImporte: 0.00,
        TipoPromo: promociones_TipoPromo.ProductoGratis,
        FechaInicio: new Date('2025-01-01'),
        FechaFin: new Date('2025-12-31'),
        Estatus: promociones_Estatus.Activa,
      },
    ];

    for (const promocion of promocionesOrganizador) {
      await prisma.promociones.create({
        data: promocion,
      });
    }
    console.log(`✅ ${promocionesOrganizador.length} promociones creadas para el organizador.`);
  } else {
    console.log(`⚠️  Ya existen ${promocionesOrganizadorExistentes} promociones para este organizador.`);
  }

  // Crear suscripción para el organizador
  console.log('\n📋 Creando suscripción para el organizador...');
  // Generar SubscriptionUID en formato #NNNNNNLLL
  const generateSubscriptionUIDOrg = (): string => {
    const nums = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
    const char1 = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    const char2 = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    const char3 = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    return `#${nums}${char1}${char2}${char3}`;
  };
  
  const subscriptionUIDOrg = generateSubscriptionUIDOrg();
  const suscripcionOrgExistente = await prisma.subscriptions.findUnique({
    where: { SubscriptionUID: subscriptionUIDOrg },
  });

  if (!suscripcionOrgExistente) {
    await prisma.subscriptions.create({
      data: {
        SubscriptionUID: subscriptionUIDOrg,
        RunnerUID: organizadorUID,
        PlanCode: subscriptions_PlanCode.Organizador,
        PlanVersion: 1,
        BillingCycle: subscriptions_BillingCycle.Yearly,
        Status: subscriptions_Status.Active,
        StartAt: new Date('2024-11-01'),
        EndAt: new Date('2025-11-01'),
        NextChargeAt: new Date('2025-11-01'),
        Currency: 'MXN',
        PriceMXN: 399.00,
        AutoRenew: true,
      },
    });
    console.log(`✅ Suscripción creada exitosamente para el organizador con ID: ${subscriptionUIDOrg}`);
  } else {
    console.log('✅ Suscripción ya existe para el organizador.');
  }

  console.log('\n✅ Datos para organizador Z2R698973TQU completados exitosamente.');

  // Crear equipos y asegurar inscripciones
  console.log('\n⚽ Creando equipos y asegurando inscripciones...');
  
  // 1. Crear equipo para Luis López (Z2R738268MVJ)
  const runnerUID1 = 'Z2R738268MVJ';
  const usuario1 = await prisma.sec_users.findFirst({
    where: { RunnerUID: runnerUID1 },
  });

  if (usuario1) {
    // Buscar o crear equipo para Luis
    let equipoLuis = await prisma.equipos.findFirst({
      where: { RunnerUID: runnerUID1 },
    });

    if (!equipoLuis) {
      equipoLuis = await prisma.equipos.create({
        data: {
          RunnerUID: runnerUID1,
          NombreEquipo: 'Corredores de Mérida',
          AliasEquipo: 'MERIDA_RUN',
          Contacto: 'Luis López',
          Celular: '9982355989',
          Correo: 'Luislopez@gmail.com',
          Ciudad: 'Mérida',
          Estado: 'Yucatán',
          Pais: 'México',
          Descripcion: 'Equipo de corredores de Mérida',
          Disciplinas: 'Carrera, Trail Running',
          AtletasActivos: 1,
          Activo: true,
        },
      });
      console.log(`✅ Equipo creado para Luis López: ${equipoLuis.NombreEquipo}`);
    }

    // Unir a Luis a su equipo
    if (!usuario1.equipoID || usuario1.equipoID !== equipoLuis.OrgID.toString()) {
      await prisma.sec_users.updateMany({
        where: { RunnerUID: runnerUID1 },
        data: {
          equipoID: equipoLuis.OrgID.toString(),
        },
      });
      await prisma.equipos.update({
        where: { OrgID: equipoLuis.OrgID },
        data: {
          AtletasActivos: {
            increment: 1,
          },
        },
      });
      console.log(`✅ Luis López unido a su equipo: ${equipoLuis.NombreEquipo}`);
    }

    // Asegurar inscripciones para Luis
    const inscripcionesLuis = await prisma.inscripciones.count({
      where: { RunnerUID: runnerUID1 },
    });

    if (inscripcionesLuis < 5) {
      const eventosParaLuis = await prisma.eventos.findMany({
        where: {
          Estatus: 'publicado',
          FechaEvento: {
            gte: new Date(),
          },
        },
        take: 5 - inscripcionesLuis,
        orderBy: { FechaEvento: 'asc' },
      });

      for (const evento of eventosParaLuis) {
        const yaInscrito = await prisma.inscripciones.findFirst({
          where: {
            RunnerUID: runnerUID1,
            EventoID: evento.EventoID,
          },
        });

        if (!yaInscrito) {
          const precioEvento = evento.PrecioEvento || 500.00;
          await prisma.inscripciones.create({
            data: {
              EventoID: evento.EventoID,
              OrgID: evento.OrgID,
              FechaEvento: evento.FechaEvento,
              RunnerUID: runnerUID1,
              RunnerNombre: 'Luis López',
              RunnerEmail: 'Luislopez@gmail.com',
              RunnerTelefono: '9982355989',
              Genero: 'M',
              FechaNacimiento: new Date('1990-05-15'),
              TallaPlayera: inscripciones_TallaPlayera.Mediana,
              DistanciaElegida: '10K',
              CategoriaElegida: 'Libre',
              Disciplina: 'Carrera',
              PrecioOriginal: precioEvento,
              PuntosUsados: 0,
              DescuentoAplicadoMXN: 0.00,
              PrecioFinal: precioEvento,
              Moneda: evento.Moneda || 'MXN',
              MetodoPago: 'Tarjeta',
              PagoTransaccionID: `txn_luis_${Date.now()}_${evento.EventoID}`,
              PagoEstado: inscripciones_PagoEstado.Pagado,
              FechaInscripcion: new Date(),
            },
          });
        }
      }
      console.log(`✅ Inscripciones verificadas/creadas para Luis López`);
    }
  }

  // 2. Crear equipo para María García (Z2R776985QXZ)
  const runnerUIDMaria = 'Z2R776985QXZ';
  const usuarioMaria = await prisma.sec_users.findFirst({
    where: { RunnerUID: runnerUIDMaria },
  });

  if (usuarioMaria) {
    // Buscar o crear equipo para María
    let equipoMaria = await prisma.equipos.findFirst({
      where: { RunnerUID: runnerUIDMaria },
    });

    if (!equipoMaria) {
      equipoMaria = await prisma.equipos.create({
        data: {
          RunnerUID: runnerUIDMaria,
          NombreEquipo: 'Corredoras de Cancún',
          AliasEquipo: 'CANCUN_RUN',
          Contacto: 'María García',
          Celular: '9991234567',
          Correo: 'mariagarcia@gmail.com',
          Ciudad: 'Cancún',
          Estado: 'Quintana Roo',
          Pais: 'México',
          Descripcion: 'Equipo de corredoras de Cancún',
          Disciplinas: 'Carrera, Playa',
          AtletasActivos: 1,
          Activo: true,
        },
      });
      console.log(`✅ Equipo creado para María García: ${equipoMaria.NombreEquipo}`);
    }

    // Unir a María a su equipo
    if (!usuarioMaria.equipoID || usuarioMaria.equipoID !== equipoMaria.OrgID.toString()) {
      await prisma.sec_users.updateMany({
        where: { RunnerUID: runnerUIDMaria },
        data: {
          equipoID: equipoMaria.OrgID.toString(),
        },
      });
      await prisma.equipos.update({
        where: { OrgID: equipoMaria.OrgID },
        data: {
          AtletasActivos: {
            increment: 1,
          },
        },
      });
      console.log(`✅ María García unida a su equipo: ${equipoMaria.NombreEquipo}`);
    }

    // Asegurar inscripciones para María
    const inscripcionesMaria = await prisma.inscripciones.count({
      where: { RunnerUID: runnerUIDMaria },
    });

    if (inscripcionesMaria < 4) {
      const eventosParaMaria = await prisma.eventos.findMany({
        where: {
          Estatus: 'publicado',
          FechaEvento: {
            gte: new Date(),
          },
        },
        skip: inscripcionesMaria,
        take: 4 - inscripcionesMaria,
        orderBy: { FechaEvento: 'asc' },
      });

      for (const evento of eventosParaMaria) {
        const yaInscrita = await prisma.inscripciones.findFirst({
          where: {
            RunnerUID: runnerUIDMaria,
            EventoID: evento.EventoID,
          },
        });

        if (!yaInscrita) {
          const precioEvento = evento.PrecioEvento || 500.00;
          await prisma.inscripciones.create({
            data: {
              EventoID: evento.EventoID,
              OrgID: evento.OrgID,
              FechaEvento: evento.FechaEvento,
              RunnerUID: runnerUIDMaria,
              RunnerNombre: 'María García',
              RunnerEmail: 'mariagarcia@gmail.com',
              RunnerTelefono: '9991234567',
              Genero: 'F',
              FechaNacimiento: new Date('1992-08-20'),
              TallaPlayera: inscripciones_TallaPlayera.Chica,
              DistanciaElegida: '5K',
              CategoriaElegida: 'Libre',
              Disciplina: 'Carrera',
              PrecioOriginal: precioEvento,
              PuntosUsados: 0,
              DescuentoAplicadoMXN: 0.00,
              PrecioFinal: precioEvento,
              Moneda: evento.Moneda || 'MXN',
              MetodoPago: 'Tarjeta',
              PagoTransaccionID: `txn_maria_${Date.now()}_${evento.EventoID}`,
              PagoEstado: inscripciones_PagoEstado.Pagado,
              FechaInscripcion: new Date(),
            },
          });
        }
      }
      console.log(`✅ Inscripciones verificadas/creadas para María García`);
    }
  }

  // 3. Crear equipo para el organizador Carlos Méndez (Z2R698973TQU)
  const organizadorUIDFinal = 'Z2R698973TQU';
  const usuarioOrgFinal = await prisma.sec_users.findFirst({
    where: { RunnerUID: organizadorUIDFinal },
  });

  if (usuarioOrgFinal) {
    const organizadorRegistroFinal = await prisma.organizadores.findFirst({
      where: { RunnerUID: organizadorUIDFinal },
    });

    if (organizadorRegistroFinal) {
      // Buscar o crear equipo para el organizador
      let equipoOrgFinal = await prisma.equipos.findFirst({
        where: { RunnerUID: organizadorUIDFinal },
      });

      if (!equipoOrgFinal) {
        equipoOrgFinal = await prisma.equipos.create({
          data: {
            RunnerUID: organizadorUIDFinal,
            NombreEquipo: 'Equipo Eventos Deportivos Mérida',
            AliasEquipo: 'EDM_TEAM',
            Contacto: 'Carlos Méndez',
            Celular: '9987654321',
            Correo: 'carlos.mendez@eventos.com',
            Ciudad: 'Mérida',
            Estado: 'Yucatán',
            Pais: 'México',
            Descripcion: 'Equipo oficial de Eventos Deportivos Mérida',
            Disciplinas: 'Carrera, Trail Running, Maratón',
            AtletasActivos: 0,
            EntrenadoresTotales: 2,
            Activo: true,
          },
        });
        console.log(`✅ Equipo creado para el organizador: ${equipoOrgFinal.NombreEquipo}`);
      }
    }
  }

  console.log('\n✅ Equipos e inscripciones completados exitosamente.');

  // Crear rutas de ejemplo
  console.log('\n🗺️  Creando rutas de ejemplo...');
  
  const rutasExistentes = await prisma.rutas.count();
  if (rutasExistentes > 0) {
    console.log(`⚠️  Ya existen ${rutasExistentes} rutas en la base de datos.`);
  } else {
    const runnerUID1 = 'Z2R738268MVJ'; // Luis López
    const runnerUID2 = 'Z2R776985QXZ'; // María García
    const runnerUID3 = 'Z2R698973TQU'; // Carlos Méndez

    const rutas = [
      // Rutas para Luis López (Mérida)
      {
        RunnerUID: runnerUID1,
        NombreRuta: 'Ruta del Centro Histórico',
        Descripcion: 'Hermosa ruta que recorre el centro histórico de Mérida, pasando por los principales monumentos y plazas.',
        Disciplina: 'Carrera',
        DistanciaKM: '5.5',
        ElevacionM: 10,
        Dificultad: 'F_cil' as const,
        DuracionEstimadoMin: 30,
        Ciudad: 'Mérida',
        Estado: 'Yucatán',
        Pais: 'México',
        GoogleMaps: 'https://www.google.com/maps/dir/Plaza+Grande,+Mérida,+Yuc./Paseo+de+Montejo,+Mérida,+Yuc./@20.9686,-89.6233,14z',
        Estatus: 'Publica' as const,
      },
      {
        RunnerUID: runnerUID1,
        NombreRuta: 'Circuito del Paseo de Montejo',
        Descripcion: 'Ruta por el emblemático Paseo de Montejo, con sus hermosas mansiones y avenidas arboladas.',
        Disciplina: 'Carrera',
        DistanciaKM: '8.2',
        ElevacionM: 15,
        Dificultad: 'Moderada' as const,
        DuracionEstimadoMin: 45,
        Ciudad: 'Mérida',
        Estado: 'Yucatán',
        Pais: 'México',
        GoogleMaps: 'https://www.google.com/maps/dir/Paseo+de+Montejo,+Mérida,+Yuc./@20.9686,-89.6233,14z',
        Estatus: 'Publica' as const,
      },
      {
        RunnerUID: runnerUID1,
        NombreRuta: 'Ruta Parque de las Américas',
        Descripcion: 'Ruta tranquila por el Parque de las Américas, ideal para principiantes.',
        Disciplina: 'Carrera',
        DistanciaKM: '3.0',
        ElevacionM: 5,
        Dificultad: 'F_cil' as const,
        DuracionEstimadoMin: 20,
        Ciudad: 'Mérida',
        Estado: 'Yucatán',
        Pais: 'México',
        Estatus: 'Publica' as const,
      },
      // Rutas para María García (Cancún)
      {
        RunnerUID: runnerUID2,
        NombreRuta: 'Ruta de la Playa Delfines',
        Descripcion: 'Hermosa ruta costera por la playa Delfines en Cancún, con vistas espectaculares al mar Caribe.',
        Disciplina: 'Carrera',
        DistanciaKM: '6.0',
        ElevacionM: 8,
        Dificultad: 'F_cil' as const,
        DuracionEstimadoMin: 35,
        Ciudad: 'Cancún',
        Estado: 'Quintana Roo',
        Pais: 'México',
        GoogleMaps: 'https://www.google.com/maps/dir/Playa+Delfines,+Cancún,+Q.Roo/@21.0875,-86.7708,14z',
        Estatus: 'Publica' as const,
      },
      {
        RunnerUID: runnerUID2,
        NombreRuta: 'Circuito Hotel Zone',
        Descripcion: 'Ruta por la zona hotelera de Cancún, con vistas al mar y a los hoteles más emblemáticos.',
        Disciplina: 'Carrera',
        DistanciaKM: '10.5',
        ElevacionM: 12,
        Dificultad: 'Moderada' as const,
        DuracionEstimadoMin: 60,
        Ciudad: 'Cancún',
        Estado: 'Quintana Roo',
        Pais: 'México',
        Estatus: 'Publica' as const,
      },
      {
        RunnerUID: runnerUID2,
        NombreRuta: 'Ruta Parque Kabah',
        Descripcion: 'Ruta por el Parque Kabah, un oasis verde en medio de Cancún, ideal para entrenamientos.',
        Disciplina: 'Carrera',
        DistanciaKM: '4.5',
        ElevacionM: 6,
        Dificultad: 'F_cil' as const,
        DuracionEstimadoMin: 25,
        Ciudad: 'Cancún',
        Estado: 'Quintana Roo',
        Pais: 'México',
        Estatus: 'Publica' as const,
      },
      // Rutas para Carlos Méndez (Mérida - Organizador)
      {
        RunnerUID: runnerUID3,
        NombreRuta: 'Ruta Trail Cenotes',
        Descripcion: 'Ruta de trail running que pasa por varios cenotes cerca de Mérida, con terreno variado y desafiante.',
        Disciplina: 'Trail Running',
        DistanciaKM: '15.0',
        ElevacionM: 150,
        Dificultad: 'Dif_cil' as const,
        DuracionEstimadoMin: 90,
        Ciudad: 'Mérida',
        Estado: 'Yucatán',
        Pais: 'México',
        GoogleMaps: 'https://www.google.com/maps/dir/Mérida,+Yuc./Cenotes/@20.9686,-89.6233,12z',
        Estatus: 'Publica' as const,
      },
      {
        RunnerUID: runnerUID3,
        NombreRuta: 'Maratón de Mérida - Ruta Completa',
        Descripcion: 'Ruta oficial del Maratón de Mérida, recorre los principales puntos de la ciudad.',
        Disciplina: 'Carrera',
        DistanciaKM: '42.2',
        ElevacionM: 50,
        Dificultad: 'Experto' as const,
        DuracionEstimadoMin: 240,
        Ciudad: 'Mérida',
        Estado: 'Yucatán',
        Pais: 'México',
        Estatus: 'Publica' as const,
      },
      {
        RunnerUID: runnerUID3,
        NombreRuta: 'Ruta Media Maratón Centro',
        Descripcion: 'Ruta de media maratón por el centro de Mérida, ideal para entrenamientos de distancia.',
        Disciplina: 'Carrera',
        DistanciaKM: '21.1',
        ElevacionM: 30,
        Dificultad: 'Moderada' as const,
        DuracionEstimadoMin: 120,
        Ciudad: 'Mérida',
        Estado: 'Yucatán',
        Pais: 'México',
        Estatus: 'Publica' as const,
      },
    ];

    for (const ruta of rutas) {
      await prisma.rutas.create({
        data: ruta,
      });
    }

    console.log(`✅ ${rutas.length} rutas creadas exitosamente.`);
    console.log('🗺️  Rutas creadas:');
    rutas.forEach((ruta, index) => {
      console.log(`   ${index + 1}. ${ruta.NombreRuta} - ${ruta.Ciudad} (${ruta.DistanciaKM} km)`);
    });
  }
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

