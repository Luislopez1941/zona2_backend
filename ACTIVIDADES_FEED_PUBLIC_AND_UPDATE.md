# Documentación: Feed Público y Actualización de Estado Público

## 1. Endpoint: Obtener Feed Público (20 más recientes)

### Descripción
Este endpoint retorna las 20 actividades públicas más recientes de todos los usuarios. Es ideal para mostrar un feed general de publicaciones públicas en la aplicación.

### Detalles del Endpoint

#### Método HTTP
```
GET
```

#### Ruta
```
/api/actividades/feed-public
```

#### Parámetros
No requiere parámetros.

#### Autenticación
No requiere autenticación.

---

### Respuesta Exitosa

#### Código de Estado
```
200 OK
```

#### Estructura de la Respuesta

```json
{
  "message": "Feed público obtenido exitosamente",
  "status": "success",
  "total": 20,
  "actividades": [
    {
      "actID": 1,
      "RunnerUID": "Z2R738268MVJ",
      "plataforma": "S",
      "titulo": "Carrera matutina",
      "fechaActividad": "2025-11-27T10:00:00.000Z",
      "DistanciaKM": "5.50",
      "RitmoMinKm": "5:30",
      "Duracion": "30:00",
      "Publico": true,
      "Origen": "Strava",
      "Ciudad": "Mérida",
      "Pais": "México",
      "enlace": "https://www.strava.com/activities/123456",
      "fecha_inicio": "2025-11-27T10:00:00.000Z",
      "fecha_fin": "2025-11-27T10:30:00.000Z",
      "duracion_segundos": 1800,
      "duracion_formateada": "30:00",
      "distancia": "5.50",
      "ritmo": "5:30",
      "frecuencia_promedio": 165,
      "frecuencia_maxima": 180,
      "cadencia": 180,
      "calorias": 350,
      "zona_activa": 3,
      "tipo_actividad": "Running",
      "fecha_registro": "2025-11-27T10:35:00.000Z",
      "usuario": {
        "RunnerUID": "Z2R738268MVJ",
        "name": "Luis",
        "AliasRunner": "R867883KCV",
        "picture": null,
        "Ciudad": "Mérida",
        "Estado": "Yucatán",
        "Pais": "México",
        "TipoMembresia": "R"
      },
      "actividad_ruta": [
        {
          "ruta_id": 1,
          "actividad_id": 1,
          "punto_numero": 1,
          "latitud": "20.967370",
          "longitud": "-89.592586"
        }
      ],
      "actividad_ubicacion": [
        {
          "ubicacion_id": 1,
          "actividad_id": 1,
          "ciudad": "Mérida",
          "inicio_lat": "20.967370",
          "inicio_lon": "-89.592586",
          "fin_lat": "20.970370",
          "fin_lon": "-89.595586"
        }
      ],
      "actividad_zonas": [
        {
          "zona_id": 1,
          "actividad_id": 1,
          "zona_numero": 1,
          "rango_texto": "Zona 1",
          "fue_activa": false
        }
      ]
    }
  ]
}
```

### Campos de la Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `message` | string | Mensaje descriptivo de la operación |
| `status` | string | Estado de la operación (`success`) |
| `total` | number | Número total de actividades retornadas (máximo 20) |
| `actividades` | array | Array de objetos de actividad con sus relaciones y datos del usuario |

---

## 2. Endpoint: Actualizar Estado Público de Actividades

### Descripción
Este endpoint permite actualizar el estado público (`Publico`) de una o más actividades de un usuario. Puedes hacer actividades públicas o privadas, y actualizar una actividad específica, múltiples actividades, o todas las actividades del usuario.

### Detalles del Endpoint

#### Método HTTP
```
PATCH
```

#### Ruta
```
/api/actividades/update-public/:runneruid
```

#### Parámetros de Ruta

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `runneruid` | string | Sí | El identificador único del usuario (RunnerUID). Ejemplo: `Z2R738268MVJ` |

#### Body (JSON)

El body es opcional y puede contener:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `actID` | number | No | ID de una actividad específica a actualizar |
| `actIDs` | number[] | No | Array de IDs de actividades a actualizar |
| `Publico` | boolean | No | `true` para hacer pública, `false` para hacer privada. Por defecto es `true` |

**Nota:** Si no se proporciona `actID` ni `actIDs`, se actualizarán todas las actividades del usuario.

---

### Opciones de Uso

#### 1. Actualizar una actividad específica

**Request:**
```http
PATCH /api/actividades/update-public/Z2R738268MVJ
Content-Type: application/json

{
  "actID": 123,
  "Publico": true
}
```

**Response:**
```json
{
  "message": "Actividad publicada exitosamente",
  "status": "success",
  "actividad": {
    "actID": 123,
    "RunnerUID": "Z2R738268MVJ",
    "Publico": true,
    "titulo": "Carrera matutina",
    ...
  }
}
```

#### 2. Actualizar múltiples actividades

**Request:**
```http
PATCH /api/actividades/update-public/Z2R738268MVJ
Content-Type: application/json

{
  "actIDs": [123, 456, 789],
  "Publico": true
}
```

**Response:**
```json
{
  "message": "3 actividad(es) publicada(s) exitosamente",
  "status": "success",
  "total": 3
}
```

#### 3. Actualizar todas las actividades del usuario

**Request:**
```http
PATCH /api/actividades/update-public/Z2R738268MVJ
Content-Type: application/json

{
  "Publico": true
}
```

**Response:**
```json
{
  "message": "15 actividad(es) publicada(s) exitosamente",
  "status": "success",
  "total": 15
}
```

#### 4. Hacer actividades privadas

**Request:**
```http
PATCH /api/actividades/update-public/Z2R738268MVJ
Content-Type: application/json

{
  "actID": 123,
  "Publico": false
}
```

**Response:**
```json
{
  "message": "Actividad ocultada exitosamente",
  "status": "success",
  "actividad": {
    "actID": 123,
    "Publico": false,
    ...
  }
}
```

---

### Respuestas de Error

#### Usuario No Encontrado

**Código de Estado:** `404 Not Found`

```json
{
  "statusCode": 404,
  "message": "Usuario con RunnerUID Z2R698973TQU no encontrado",
  "error": "Not Found"
}
```

#### Actividad No Encontrada o No Pertenece al Usuario

**Código de Estado:** `404 Not Found`

```json
{
  "statusCode": 404,
  "message": "Actividad con ID 123 no encontrada o no pertenece al usuario",
  "error": "Not Found"
}
```

#### Algunas Actividades No Existen

**Código de Estado:** `400 Bad Request`

```json
{
  "statusCode": 400,
  "message": "Algunas actividades no existen o no pertenecen al usuario",
  "error": "Bad Request"
}
```

---

## Ejemplos de Uso

### JavaScript (Fetch API)

#### Obtener Feed Público

```javascript
fetch('http://localhost:4000/api/actividades/feed-public')
  .then(response => response.json())
  .then(data => {
    console.log(`Total de actividades: ${data.total}`);
    console.log('Actividades:', data.actividades);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

#### Actualizar Estado Público (Una Actividad)

```javascript
const runneruid = 'Z2R738268MVJ';
const actID = 123;

fetch(`http://localhost:4000/api/actividades/update-public/${runneruid}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    actID: actID,
    Publico: true
  })
})
  .then(response => response.json())
  .then(data => {
    console.log(data.message);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

#### Actualizar Estado Público (Múltiples Actividades)

```javascript
const runneruid = 'Z2R738268MVJ';

fetch(`http://localhost:4000/api/actividades/update-public/${runneruid}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    actIDs: [123, 456, 789],
    Publico: true
  })
})
  .then(response => response.json())
  .then(data => {
    console.log(`${data.total} actividades actualizadas`);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

#### Actualizar Todas las Actividades del Usuario

```javascript
const runneruid = 'Z2R738268MVJ';

fetch(`http://localhost:4000/api/actividades/update-public/${runneruid}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    Publico: true
  })
})
  .then(response => response.json())
  .then(data => {
    console.log(`${data.total} actividades publicadas`);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### Axios

#### Obtener Feed Público

```javascript
import axios from 'axios';

const obtenerFeedPublico = async () => {
  try {
    const response = await axios.get(
      'http://localhost:4000/api/actividades/feed-public'
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener feed público:', error);
    throw error;
  }
};

// Uso
const feed = await obtenerFeedPublico();
console.log(feed.actividades);
```

#### Actualizar Estado Público

```javascript
import axios from 'axios';

const actualizarEstadoPublico = async (runneruid, actID, publico = true) => {
  try {
    const response = await axios.patch(
      `http://localhost:4000/api/actividades/update-public/${runneruid}`,
      {
        actID: actID,
        Publico: publico
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('Usuario o actividad no encontrada');
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};

// Uso
await actualizarEstadoPublico('Z2R738268MVJ', 123, true);
```

### React Hook para Feed Público

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

function useFeedPublico() {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedPublico = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          '/api/actividades/feed-public'
        );
        setActividades(response.data.actividades);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar feed público');
        setActividades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedPublico();
  }, []);

  return { actividades, loading, error };
}

// Uso en componente
function FeedPublico() {
  const { actividades, loading, error } = useFeedPublico();

  if (loading) return <div>Cargando feed público...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Feed Público ({actividades.length})</h2>
      {actividades.map(actividad => (
        <div key={actividad.actID}>
          <h3>{actividad.titulo}</h3>
          <p>Por: {actividad.usuario?.name}</p>
          <p>Fecha: {new Date(actividad.fechaActividad).toLocaleDateString()}</p>
          <p>Distancia: {actividad.DistanciaKM} km</p>
        </div>
      ))}
    </div>
  );
}
```

### React Hook para Actualizar Estado Público

```javascript
import { useState } from 'react';
import axios from 'axios';

function useActualizarPublico() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const actualizarPublico = async (runneruid, options) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.patch(
        `/api/actividades/update-public/${runneruid}`,
        options
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { actualizarPublico, loading, error };
}

// Uso en componente
function ActividadCard({ actividad, runneruid }) {
  const { actualizarPublico, loading } = useActualizarPublico();

  const togglePublico = async () => {
    try {
      await actualizarPublico(runneruid, {
        actID: actividad.actID,
        Publico: !actividad.Publico
      });
      // Actualizar estado local o recargar datos
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  return (
    <div>
      <h3>{actividad.titulo}</h3>
      <button onClick={togglePublico} disabled={loading}>
        {actividad.Publico ? 'Hacer Privada' : 'Hacer Pública'}
      </button>
    </div>
  );
}
```

### cURL

#### Obtener Feed Público

```bash
curl -X GET \
  http://localhost:4000/api/actividades/feed-public \
  -H 'Content-Type: application/json'
```

#### Actualizar Estado Público

```bash
curl -X PATCH \
  http://localhost:4000/api/actividades/update-public/Z2R738268MVJ \
  -H 'Content-Type: application/json' \
  -d '{
    "actID": 123,
    "Publico": true
  }'
```

---

## Notas Importantes

### Feed Público (`GET /feed-public`)

1. **Límite fijo**: Siempre retorna máximo 20 actividades (las más recientes).
2. **Solo públicas**: Solo muestra actividades con `Publico: true`.
3. **Orden**: Las actividades se ordenan por `fechaActividad` en orden descendente (más recientes primero).
4. **Relaciones incluidas**: 
   - `actividad_ruta`: Ordenadas por `punto_numero` ascendente
   - `actividad_ubicacion`: Todas las ubicaciones relacionadas
   - `actividad_zonas`: Ordenadas por `zona_numero` ascendente
5. **Datos del usuario**: Cada actividad incluye información del usuario que la creó.

### Actualizar Estado Público (`PATCH /update-public/:runneruid`)

1. **Validación de propiedad**: Solo puedes actualizar actividades que pertenezcan al usuario especificado en `runneruid`.
2. **Valor por defecto**: Si no se especifica `Publico`, se establece en `true` por defecto.
3. **Opciones de actualización**:
   - Una actividad: Proporciona `actID`
   - Múltiples actividades: Proporciona `actIDs` (array)
   - Todas las actividades: No proporciones `actID` ni `actIDs`
4. **Seguridad**: El sistema verifica que las actividades pertenezcan al usuario antes de actualizarlas.
5. **Mensajes descriptivos**: Los mensajes de respuesta indican si la actividad fue "publicada" o "ocultada" según el valor de `Publico`.

---

## Códigos de Estado HTTP

### Feed Público

| Código | Descripción |
|--------|-------------|
| 200 | Éxito - Feed público obtenido correctamente |

### Actualizar Estado Público

| Código | Descripción |
|--------|-------------|
| 200 | Éxito - Actividad(es) actualizada(s) correctamente |
| 400 | Error - Algunas actividades no existen o no pertenecen al usuario |
| 404 | No encontrado - Usuario o actividad no encontrada |

---

## Versión
- **API Version**: 1.0
- **Última actualización**: 2025-11-27

