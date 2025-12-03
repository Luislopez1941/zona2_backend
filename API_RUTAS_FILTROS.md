# Documentación de API - Filtros de Rutas

Esta documentación describe los endpoints para filtrar rutas por país, ciudad y estado.

---

## GET `/api/rutas/get-by-pais/:pais`

Obtiene rutas filtradas por país.

**Endpoint:** `GET /api/rutas/get-by-pais/:pais`

**Parámetros de URL:**
- `pais` (string, requerido): Nombre del país

**Ejemplo de Request:**
```
GET /api/rutas/get-by-pais/México
```

**Descripción:** Retorna una lista de todas las rutas públicas que pertenecen al país especificado, ordenadas por fecha de creación (más recientes primero). El campo `GPXfile` (archivo binario) no se incluye en la respuesta para evitar payloads grandes.

**Respuesta Exitosa (200):**
```json
{
  "message": "Rutas obtenidas exitosamente",
  "status": "success",
  "total": 25,
  "pais": "México",
  "rutas": [
    {
      "RutaID": 1,
      "RunnerUID": "Z2R807989IZU",
      "NombreRuta": "Ruta del Centro",
      "Descripcion": "Ruta por el centro histórico de Mérida",
      "Disciplina": "Running",
      "DistanciaKM": 5.5,
      "ElevacionM": 120,
      "Dificultad": "Media",
      "DuracionEstimadoMin": 30,
      "Ciudad": "Mérida",
      "Estado": "Yucatán",
      "Pais": "México",
      "GoogleMaps": "https://maps.google.com/...",
      "Estatus": "Publica",
      "FechaCreacion": "2024-01-15T10:30:00.000Z",
      "FechaActualizacion": "2024-01-15T10:30:00.000Z",
      "GPXfile_name": "ruta_centro.gpx"
    }
  ]
}
```

**Nota:** La búsqueda es exacta (case-sensitive). Solo retorna rutas con estatus "Publica".

**Ejemplo de Uso:**
```bash
curl -X GET https://zona2.mx/api/rutas/get-by-pais/México
```

---

## GET `/api/rutas/get-by-ciudad/:ciudad`

Obtiene rutas filtradas por ciudad.

**Endpoint:** `GET /api/rutas/get-by-ciudad/:ciudad`

**Parámetros de URL:**
- `ciudad` (string, requerido): Nombre de la ciudad

**Ejemplo de Request:**
```
GET /api/rutas/get-by-ciudad/Mérida
```

**Descripción:** Retorna una lista de todas las rutas públicas que pertenecen a la ciudad especificada, ordenadas por fecha de creación (más recientes primero). El campo `GPXfile` (archivo binario) no se incluye en la respuesta para evitar payloads grandes.

**Respuesta Exitosa (200):**
```json
{
  "message": "Rutas obtenidas exitosamente",
  "status": "success",
  "total": 8,
  "ciudad": "Mérida",
  "rutas": [
    {
      "RutaID": 1,
      "RunnerUID": "Z2R807989IZU",
      "NombreRuta": "Ruta del Centro",
      "Descripcion": "Ruta por el centro histórico de Mérida",
      "Disciplina": "Running",
      "DistanciaKM": 5.5,
      "ElevacionM": 120,
      "Dificultad": "Media",
      "DuracionEstimadoMin": 30,
      "Ciudad": "Mérida",
      "Estado": "Yucatán",
      "Pais": "México",
      "GoogleMaps": "https://maps.google.com/...",
      "Estatus": "Publica",
      "FechaCreacion": "2024-01-15T10:30:00.000Z",
      "FechaActualizacion": "2024-01-15T10:30:00.000Z",
      "GPXfile_name": "ruta_centro.gpx"
    }
  ]
}
```

**Nota:** La búsqueda es exacta (case-sensitive). Solo retorna rutas con estatus "Publica".

**Ejemplo de Uso:**
```bash
curl -X GET https://zona2.mx/api/rutas/get-by-ciudad/Mérida
```

---

## GET `/api/rutas/get-by-estado/:estado`

Obtiene rutas filtradas por estado.

**Endpoint:** `GET /api/rutas/get-by-estado/:estado`

**Parámetros de URL:**
- `estado` (string, requerido): Nombre del estado

**Ejemplo de Request:**
```
GET /api/rutas/get-by-estado/Yucatán
```

**Descripción:** Retorna una lista de todas las rutas públicas que pertenecen al estado especificado, ordenadas por fecha de creación (más recientes primero). El campo `GPXfile` (archivo binario) no se incluye en la respuesta para evitar payloads grandes.

**Respuesta Exitosa (200):**
```json
{
  "message": "Rutas obtenidas exitosamente",
  "status": "success",
  "total": 15,
  "estado": "Yucatán",
  "rutas": [
    {
      "RutaID": 1,
      "RunnerUID": "Z2R807989IZU",
      "NombreRuta": "Ruta del Centro",
      "Descripcion": "Ruta por el centro histórico de Mérida",
      "Disciplina": "Running",
      "DistanciaKM": 5.5,
      "ElevacionM": 120,
      "Dificultad": "Media",
      "DuracionEstimadoMin": 30,
      "Ciudad": "Mérida",
      "Estado": "Yucatán",
      "Pais": "México",
      "GoogleMaps": "https://maps.google.com/...",
      "Estatus": "Publica",
      "FechaCreacion": "2024-01-15T10:30:00.000Z",
      "FechaActualizacion": "2024-01-15T10:30:00.000Z",
      "GPXfile_name": "ruta_centro.gpx"
    },
    {
      "RutaID": 2,
      "RunnerUID": "Z2R999888777",
      "NombreRuta": "Ruta de Progreso",
      "Descripcion": "Ruta costera en Progreso",
      "Disciplina": "Running",
      "DistanciaKM": 8.0,
      "ElevacionM": 50,
      "Dificultad": "Fácil",
      "DuracionEstimadoMin": 45,
      "Ciudad": "Progreso",
      "Estado": "Yucatán",
      "Pais": "México",
      "GoogleMaps": "https://maps.google.com/...",
      "Estatus": "Publica",
      "FechaCreacion": "2024-01-10T08:00:00.000Z",
      "FechaActualizacion": "2024-01-10T08:00:00.000Z",
      "GPXfile_name": "ruta_progreso.gpx"
    }
  ]
}
```

**Nota:** La búsqueda es exacta (case-sensitive). Solo retorna rutas con estatus "Publica".

**Ejemplo de Uso:**
```bash
curl -X GET https://zona2.mx/api/rutas/get-by-estado/Yucatán
```

---

## Características Comunes

### Filtrado
- Todos los endpoints solo retornan rutas con `Estatus: 'Publica'`
- La búsqueda es **exacta** (case-sensitive), por lo que "Mérida" y "mérida" son diferentes
- Los resultados están ordenados por `FechaCreacion` descendente (más recientes primero)

### Respuesta
Todos los endpoints retornan el mismo formato de respuesta:
- `message`: Mensaje descriptivo
- `status`: Estado de la operación (`success`)
- `total`: Número total de rutas encontradas
- `pais`/`ciudad`/`estado`: Parámetro de búsqueda utilizado
- `rutas`: Array con las rutas encontradas

### Campos de la Ruta
Cada ruta incluye los siguientes campos (sin el archivo GPX binario):
- `RutaID`: ID único de la ruta
- `RunnerUID`: ID del usuario que creó la ruta
- `NombreRuta`: Nombre de la ruta
- `Descripcion`: Descripción detallada
- `Disciplina`: Tipo de disciplina (Running, Ciclismo, etc.)
- `DistanciaKM`: Distancia en kilómetros
- `ElevacionM`: Elevación en metros
- `Dificultad`: Nivel de dificultad
- `DuracionEstimadoMin`: Duración estimada en minutos
- `Ciudad`, `Estado`, `Pais`: Ubicación
- `GoogleMaps`: URL del mapa
- `Estatus`: Estado de la ruta (solo se muestran "Publica")
- `FechaCreacion`, `FechaActualizacion`: Fechas de creación y actualización
- `GPXfile_name`: Nombre del archivo GPX (el archivo binario no se incluye)

**Nota:** El campo `GPXfile` (archivo binario) no se incluye en las respuestas para evitar payloads grandes. Si necesitas el archivo GPX, debes usar el endpoint `GET /api/rutas/get-by-id/:id`.

### Ejemplos de Uso con JavaScript/Fetch

**Buscar por país:**
```javascript
const getRutasByPais = async (pais) => {
  const response = await fetch(`https://zona2.mx/api/rutas/get-by-pais/${encodeURIComponent(pais)}`);
  const data = await response.json();
  return data;
};

// Uso
const rutas = await getRutasByPais('México');
```

**Buscar por ciudad:**
```javascript
const getRutasByCiudad = async (ciudad) => {
  const response = await fetch(`https://zona2.mx/api/rutas/get-by-ciudad/${encodeURIComponent(ciudad)}`);
  const data = await response.json();
  return data;
};

// Uso
const rutas = await getRutasByCiudad('Mérida');
```

**Buscar por estado:**
```javascript
const getRutasByEstado = async (estado) => {
  const response = await fetch(`https://zona2.mx/api/rutas/get-by-estado/${encodeURIComponent(estado)}`);
  const data = await response.json();
  return data;
};

// Uso
const rutas = await getRutasByEstado('Yucatán');
```

### Notas Importantes

1. **Case Sensitivity:** Las búsquedas son case-sensitive. "México" y "méxico" son diferentes.

2. **Encoding:** Al usar caracteres especiales o acentos en la URL, asegúrate de usar `encodeURIComponent()` en JavaScript o el encoding apropiado en tu lenguaje.

3. **Rutas Públicas:** Solo se retornan rutas con `Estatus: 'Publica'`. Las rutas privadas o con otro estatus no aparecerán en los resultados.

4. **Archivo GPX:** El archivo binario `GPXfile` no se incluye en las respuestas para optimizar el tamaño. Si necesitas el archivo GPX completo, usa el endpoint `GET /api/rutas/get-by-id/:id`.

5. **Sin Resultados:** Si no hay rutas que coincidan con el filtro, se retornará un array vacío:
   ```json
   {
     "message": "Rutas obtenidas exitosamente",
     "status": "success",
     "total": 0,
     "pais": "España",
     "rutas": []
   }
   ```

**Base URL:**
- **Desarrollo:** `http://localhost:4000/api`
- **Producción:** `https://zona2.mx/api`

---

**Última actualización:** Diciembre 2024

