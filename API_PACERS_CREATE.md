# API: Crear Pacer (POST /api/pecers/create)

## Descripción
Este endpoint permite convertir un usuario en un pacer. Al crear un pacer:
1. Se actualiza el campo `TipoMembresia` a `'P'` en la tabla `sec_users`
2. Se crea un nuevo registro en la tabla `pacers` con la información proporcionada

## Endpoint
```
POST /api/pecers/create
```

## Autenticación
No requerida (pero se recomienda usar autenticación JWT)

## Body Parameters

### Requerido
- **RunnerUID** (string, requerido): El UID del corredor que se convertirá en pacer

### Opcionales
Todos los demás campos son opcionales. Si no se proporcionan, se usarán los datos del usuario o valores por defecto:

- **AliasPacer** (string, opcional): Alias o apodo del pacer
- **Biografia** (string, opcional): Biografía del pacer
- **Idiomas** (string, opcional): Idiomas que habla el pacer (ej: "Español, Inglés")
- **RitmoMin** (string, opcional): Ritmo mínimo por kilómetro (ej: "5:30")
- **DistanciasDominadas** (string, opcional): Distancias que domina (ej: "5K, 10K, 21K, 42K")
- **Certificaciones** (string, opcional): Certificaciones del pacer
- **CiudadBase** (string, opcional): Ciudad base del pacer (si no se proporciona, se usa la del usuario)
- **EstadoBase** (string, opcional): Estado base del pacer (si no se proporciona, se usa el del usuario)
- **PaisBase** (string, opcional): País base del pacer (si no se proporciona, se usa el del usuario o "México")
- **DisponibilidadHoraria** (string, opcional): Disponibilidad horaria (ej: "Lunes a Viernes 6:00 AM - 8:00 AM")
- **PickUpHotel** (boolean, opcional): Si ofrece servicio de pick up en hotel (default: false)
- **FotoPerfilURL** (string, opcional): URL de la foto de perfil
- **RedesSociales** (string, opcional): Redes sociales del pacer (ej: "https://instagram.com/pacer")
- **Tarifabase** (number, opcional): Tarifa base del pacer en MXN

## Datos Automáticos del Usuario
Si no se proporcionan los siguientes campos, se obtienen automáticamente del usuario:
- **NombreCompleto**: Se usa el campo `name` del usuario
- **CiudadBase**: Se usa el campo `Ciudad` del usuario
- **EstadoBase**: Se usa el campo `Estado` del usuario
- **PaisBase**: Se usa el campo `Pais` del usuario o "México" por defecto

## Valores por Defecto
Los siguientes campos se establecen automáticamente:
- **CalificacionPromedio**: 0.00
- **TotalReviews**: 0
- **TotalExperienciasRealizadas**: 0
- **PacerActivo**: true
- **FechaRegistro**: Fecha actual
- **FechaActualizacion**: Fecha actual

## Ejemplo de Request

### Mínimo (solo RunnerUID)
```json
{
  "RunnerUID": "Z2R807989IZU"
}
```

### Completo
```json
{
  "RunnerUID": "Z2R807989IZU",
  "AliasPacer": "El Corredor",
  "Biografia": "Pacer con más de 10 años de experiencia en carreras de calle y trail running.",
  "Idiomas": "Español, Inglés",
  "RitmoMin": "5:30",
  "DistanciasDominadas": "5K, 10K, 21K, 42K",
  "Certificaciones": "Certificado en Running Coach, Certificado en Trail Running",
  "CiudadBase": "Mérida",
  "EstadoBase": "Yucatán",
  "PaisBase": "México",
  "DisponibilidadHoraria": "Lunes a Viernes 6:00 AM - 8:00 AM, Sábados 7:00 AM - 9:00 AM",
  "PickUpHotel": true,
  "FotoPerfilURL": "https://ejemplo.com/fotos/pacer.jpg",
  "RedesSociales": "https://instagram.com/pacer_merida",
  "Tarifabase": 500.00
}
```

## Respuesta Exitosa

### Status Code: 201 Created

```json
{
  "message": "Pacer creado exitosamente",
  "status": "success",
  "pacer": {
    "PacerID": 1,
    "RunnerUID": "Z2R807989IZU",
    "NombreCompleto": "Juan Pérez",
    "AliasPacer": "El Corredor",
    "Biografia": "Pacer con más de 10 años de experiencia...",
    "Idiomas": "Español, Inglés",
    "RitmoMin": "5:30",
    "DistanciasDominadas": "5K, 10K, 21K, 42K",
    "Certificaciones": "Certificado en Running Coach...",
    "CiudadBase": "Mérida",
    "EstadoBase": "Yucatán",
    "PaisBase": "México",
    "DisponibilidadHoraria": "Lunes a Viernes 6:00 AM - 8:00 AM...",
    "PickUpHotel": true,
    "FotoPerfilURL": "https://ejemplo.com/fotos/pacer.jpg",
    "RedesSociales": "https://instagram.com/pacer_merida",
    "CalificacionPromedio": 0.00,
    "TotalReviews": 0,
    "TotalExperienciasRealizadas": 0,
    "Tarifabase": 500.00,
    "PacerActivo": true,
    "FechaRegistro": "2024-12-03T12:00:00.000Z",
    "FechaActualizacion": "2024-12-03T12:00:00.000Z"
  }
}
```

## Errores

### 404 Not Found - Usuario no encontrado
```json
{
  "statusCode": 404,
  "message": "Usuario con RunnerUID Z2R807989IZU no encontrado",
  "error": "Not Found"
}
```

### 409 Conflict - Usuario ya es pacer
```json
{
  "statusCode": 409,
  "message": "El usuario con RunnerUID Z2R807989IZU ya es un pacer",
  "error": "Conflict"
}
```

## Notas Importantes

1. **Actualización de TipoMembresia**: Al crear un pacer, el campo `TipoMembresia` en `sec_users` se actualiza automáticamente a `'P'`.

2. **Datos del Usuario**: Si no se proporcionan `CiudadBase`, `EstadoBase` o `PaisBase`, se obtienen del perfil del usuario.

3. **Validación de Duplicados**: El sistema verifica que el usuario no sea ya un pacer antes de crear uno nuevo.

4. **Campos Calculados**: Los campos `CalificacionPromedio`, `TotalReviews` y `TotalExperienciasRealizadas` se inicializan en 0.

## Ejemplo de Uso con Axios

```javascript
const crearPacer = async (runnerUID, datosPacer) => {
  try {
    const response = await axios.post('/api/pecers/create', {
      RunnerUID: runnerUID,
      ...datosPacer
    });
    console.log('Pacer creado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al crear pacer:', error.response.data);
    throw error;
  }
};

// Uso
crearPacer('Z2R807989IZU', {
  AliasPacer: 'El Corredor',
  Biografia: 'Pacer experimentado...',
  RitmoMin: '5:30',
  DistanciasDominadas: '5K, 10K, 21K',
  Tarifabase: 500.00
});
```

