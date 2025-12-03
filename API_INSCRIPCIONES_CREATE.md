# Documentación de API - Crear Inscripción

## POST `/api/inscripciones/create`

Crea una nueva inscripción a un evento. Este endpoint utiliza la información del evento (EventoID, OrgID, FechaEvento, PrecioEvento, etc.) y los datos del usuario para crear la inscripción.

**Endpoint:** `POST /api/inscripciones/create`

**Body (JSON):**
```json
{
  "EventoID": 1,
  "RunnerUID": "Z2R807989IZU",
  "RunnerNombre": "Juan Pérez",
  "RunnerEmail": "juan@example.com",
  "RunnerTelefono": "9991234567",
  "Genero": "M",
  "FechaNacimiento": "1990-05-15",
  "TallaPlayera": "Mediana",
  "EquipoID": "Z2R999888777",
  "DistanciaElegida": "10K",
  "CategoriaElegida": "Libre",
  "Disciplina": "Running",
  "PuntosUsados": 100,
  "DescuentoAplicadoMXN": 50.00,
  "MetodoPago": "Tarjeta",
  "PagoTransaccionID": "TXN123456789",
  "ContactoEmergencia": "María González",
  "TelefonoEmergencia": "9999876543",
  "Ciudad": "Mérida",
  "Estado": "Yucatán",
  "Pais": "México"
}
```

**Parámetros Requeridos:**
- `EventoID` (number): ID del evento al que se quiere inscribir
- `RunnerUID` (string): ID único del usuario que se inscribe
- `DistanciaElegida` (string): Distancia elegida para la inscripción (ej: "5K", "10K", "21K", "42K")

**Parámetros Opcionales:**
- `RunnerNombre` (string): Nombre del corredor (si no se proporciona, se obtiene del usuario)
- `RunnerEmail` (string): Email del corredor (si no se proporciona, se obtiene del usuario)
- `RunnerTelefono` (string): Teléfono del corredor (si no se proporciona, se obtiene del usuario)
- `Genero` (string): Género del corredor (1 carácter, ej: "M", "F")
- `FechaNacimiento` (string): Fecha de nacimiento en formato "YYYY-MM-DD"
- `TallaPlayera` (enum): Talla de playera
  - Valores: `"ExtraChica"`, `"Chica"`, `"Mediana"`, `"Grande"`, `"ExtraGrande"`
- `EquipoID` (string): ID del equipo al que pertenece el corredor
- `CategoriaElegida` (string): Categoría elegida (ej: "Libre", "Veteranos", "Juvenil")
- `Disciplina` (string): Disciplina (default: se obtiene del evento o "Carrera")
- `PuntosUsados` (number): Puntos Z2 utilizados para descuento (default: 0)
- `DescuentoAplicadoMXN` (number): Descuento aplicado en MXN (default: 0.00)
- `MetodoPago` (string): Método de pago utilizado
- `PagoTransaccionID` (string): ID de la transacción de pago
- `ContactoEmergencia` (string): Nombre del contacto de emergencia
- `TelefonoEmergencia` (string): Teléfono del contacto de emergencia
- `Ciudad` (string): Ciudad del corredor (si no se proporciona, se obtiene del evento)
- `Estado` (string): Estado del corredor (si no se proporciona, se obtiene del evento)
- `Pais` (string): País del corredor (si no se proporciona, se obtiene del evento)

**Información Automática del Evento:**
El endpoint obtiene automáticamente del evento:
- `OrgID`: ID del organizador del evento
- `FechaEvento`: Fecha del evento
- `PrecioOriginal`: Precio del evento
- `Moneda`: Moneda del evento (default: "MXN")
- `TipoEvento`: Tipo de evento (se usa como disciplina si no se proporciona)

**Cálculo de Precios:**
- `PrecioOriginal`: Se obtiene del evento (`PrecioEvento`)
- `PrecioFinal`: Se calcula como `PrecioOriginal - DescuentoAplicadoMXN` (mínimo 0)

**Respuesta Exitosa (200):**
```json
{
  "message": "Inscripción creada exitosamente",
  "status": "success",
  "inscripcion": {
    "InscripcionID": 1,
    "EventoID": 1,
    "OrgID": 1,
    "FechaEvento": "2024-12-15T00:00:00.000Z",
    "RunnerUID": "Z2R807989IZU",
    "RunnerNombre": "Juan Pérez",
    "RunnerEmail": "juan@example.com",
    "RunnerTelefono": "9991234567",
    "Genero": "M",
    "FechaNacimiento": "1990-05-15T00:00:00.000Z",
    "TallaPlayera": "Mediana",
    "EquipoID": "Z2R999888777",
    "DistanciaElegida": "10K",
    "CategoriaElegida": "Libre",
    "Disciplina": "Running",
    "PrecioOriginal": 500.00,
    "PuntosUsados": 100,
    "DescuentoAplicadoMXN": 50.00,
    "PrecioFinal": 450.00,
    "Moneda": "MXN",
    "MetodoPago": "Tarjeta",
    "PagoTransaccionID": "TXN123456789",
    "PagoEstado": "Pendiente",
    "ContactoEmergencia": "María González",
    "TelefonoEmergencia": "9999876543",
    "Ciudad": "Mérida",
    "Estado": "Yucatán",
    "Pais": "México",
    "EstatusInscripcion": "Inscrito",
    "FechaInscripcion": "2024-12-01T10:30:00.000Z",
    "FechaActualizacion": "2024-12-01T10:30:00.000Z"
  }
}
```

**Errores:**

- `404 Not Found`: Si el evento no existe
  ```json
  {
    "statusCode": 404,
    "message": "Evento con ID 1 no encontrado",
    "error": "Not Found"
  }
  ```

- `404 Not Found`: Si el usuario no existe
  ```json
  {
    "statusCode": 404,
    "message": "Usuario con RunnerUID Z2R807989IZU no encontrado",
    "error": "Not Found"
  }
  ```

- `400 Bad Request`: Si el usuario ya está inscrito en el evento
  ```json
  {
    "statusCode": 400,
    "message": "El usuario ya está inscrito en este evento",
    "error": "Bad Request"
  }
  ```

**Ejemplo Mínimo (solo campos requeridos):**
```json
{
  "EventoID": 1,
  "RunnerUID": "Z2R807989IZU",
  "DistanciaElegida": "10K"
}
```

En este caso, el sistema:
- Obtendrá `RunnerNombre`, `RunnerEmail` y `RunnerTelefono` del usuario
- Usará el precio del evento como `PrecioOriginal`
- Calculará `PrecioFinal` igual a `PrecioOriginal` (sin descuentos)
- Usará la ubicación del evento si no se proporciona

**Ejemplos de Uso:**

1. **Inscripción básica:**
   ```bash
   curl -X POST https://zona2.mx/api/inscripciones/create \
     -H "Content-Type: application/json" \
     -d '{
       "EventoID": 1,
       "RunnerUID": "Z2R807989IZU",
       "DistanciaElegida": "10K"
     }'
   ```

2. **Inscripción completa:**
   ```bash
   curl -X POST https://zona2.mx/api/inscripciones/create \
     -H "Content-Type: application/json" \
     -d '{
       "EventoID": 1,
       "RunnerUID": "Z2R807989IZU",
       "RunnerNombre": "Juan Pérez",
       "RunnerEmail": "juan@example.com",
       "RunnerTelefono": "9991234567",
       "Genero": "M",
       "FechaNacimiento": "1990-05-15",
       "TallaPlayera": "Mediana",
       "DistanciaElegida": "10K",
       "CategoriaElegida": "Libre",
       "PuntosUsados": 100,
       "DescuentoAplicadoMXN": 50.00,
       "ContactoEmergencia": "María González",
       "TelefonoEmergencia": "9999876543"
     }'
   ```

3. **Ejemplo con JavaScript/Fetch:**
   ```javascript
   const crearInscripcion = async (inscripcionData) => {
     const response = await fetch('https://zona2.mx/api/inscripciones/create', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(inscripcionData)
     });
     
     const data = await response.json();
     return data;
   };

   // Uso
   const nuevaInscripcion = await crearInscripcion({
     EventoID: 1,
     RunnerUID: "Z2R807989IZU",
     DistanciaElegida: "10K",
     TallaPlayera: "Mediana",
     CategoriaElegida: "Libre"
   });
   ```

**Notas Importantes:**

1. **Información del Evento:** El endpoint obtiene automáticamente información del evento (OrgID, FechaEvento, PrecioEvento, Moneda, etc.) basándose en el `EventoID` proporcionado.

2. **Información del Usuario:** Si no se proporcionan `RunnerNombre`, `RunnerEmail` o `RunnerTelefono`, el sistema los obtendrá automáticamente del usuario basándose en el `RunnerUID`.

3. **Ubicación:** Si no se proporcionan `Ciudad`, `Estado` o `Pais`, el sistema los obtendrá del evento.

4. **Prevención de Duplicados:** El sistema verifica que el usuario no esté ya inscrito en el evento antes de crear la inscripción.

5. **Estados por Defecto:**
   - `PagoEstado`: "Pendiente"
   - `EstatusInscripcion`: "Inscrito"
   - `Disciplina`: Se obtiene del evento o "Carrera" por defecto
   - `Moneda`: Se obtiene del evento o "MXN" por defecto

6. **Cálculo de Precio Final:** El precio final se calcula como `PrecioOriginal - DescuentoAplicadoMXN`. Si el resultado es negativo, se establece en 0.

7. **Campos Automáticos:**
   - `InscripcionID`: Se genera automáticamente
   - `FechaInscripcion`: Se establece automáticamente al momento de crear
   - `FechaActualizacion`: Se establece automáticamente al momento de crear

**Base URL:**
- **Desarrollo:** `http://localhost:4000/api`
- **Producción:** `https://zona2.mx/api`

---

**Última actualización:** Diciembre 2024

