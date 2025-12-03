# Documentación API - Zonas Actividades

Esta documentación describe los endpoints para gestionar las "zonas" (likes) que los usuarios dan a las actividades/publicaciones.

---

## 1. Dar Zonas a una Actividad

Permite a un usuario dar "zonas" (likes) a una actividad. Este endpoint crea dos registros:
- Un registro en `zonas_actividades` que relaciona al usuario con la actividad
- Un registro en `zonas` para el usuario que recibe las zonas (dueño de la actividad)

**Endpoint:** `POST /api/zonas-actividades/create`

### Request Body

```json
{
  "RunnerUID": "Z2R738268MVJ",
  "actID": 1,
  "puntos": 100
}
```

### Parámetros del Body

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `RunnerUID` | string | Sí | RunnerUID del usuario que da las zonas (like) |
| `actID` | number | Sí | ID de la actividad a la que se le dan las zonas |
| `puntos` | number | Sí | Cantidad de puntos a otorgar (mínimo: 1) |

### Validaciones

- El usuario que da las zonas (`RunnerUID`) debe existir en la base de datos
- La actividad (`actID`) debe existir
- El usuario dueño de la actividad debe existir
- Un usuario solo puede dar zonas una vez por actividad (restricción única)
- Los puntos deben ser mayor o igual a 1

### Response Exitosa (200)

```json
{
  "message": "Zonas otorgadas exitosamente",
  "status": "success",
  "zonaActividad": {
    "id": 1,
    "RunnerUID": "Z2R738268MVJ",
    "actID": 1,
    "puntos": 100,
    "fecha": "2025-11-29T10:30:00.000Z"
  },
  "zona": {
    "zonaID": 1,
    "RunnerUID": "Z2R776985QXZ",
    "RunnerUIDRef": "Z2R738268MVJ",
    "puntos": 100,
    "motivo": "R",
    "origen": "3",
    "fecha": "2025-11-29T10:30:00.000Z"
  }
}
```

### Errores Posibles

#### 404 - Usuario no encontrado
```json
{
  "statusCode": 404,
  "message": "Usuario con RunnerUID Z2R738268MVJ no encontrado",
  "error": "Not Found"
}
```

#### 404 - Actividad no encontrada
```json
{
  "statusCode": 404,
  "message": "Actividad con ID 1 no encontrada",
  "error": "Not Found"
}
```

#### 409 - Ya se dieron zonas a esta actividad
```json
{
  "statusCode": 409,
  "message": "Ya has dado zonas a esta actividad anteriormente",
  "error": "Conflict"
}
```

### Ejemplo con Fetch

```javascript
const response = await fetch('http://localhost:3000/api/zonas-actividades/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    RunnerUID: 'Z2R738268MVJ',
    actID: 1,
    puntos: 100
  })
});

const data = await response.json();
console.log(data);
```

### Ejemplo con Axios

```javascript
import axios from 'axios';

const response = await axios.post('http://localhost:3000/api/zonas-actividades/create', {
  RunnerUID: 'Z2R738268MVJ',
  actID: 1,
  puntos: 100
});

console.log(response.data);
```

---

## 2. Verificar si un Usuario ya Dio Zonas a una Actividad

Verifica si un usuario específico ya ha dado zonas (like) a una actividad específica. Útil para actualizar el estado del botón de "like" en el frontend.

**Endpoint:** `GET /api/zonas-actividades/has-given/:runnerUID/:actID`

### Parámetros de Ruta

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `runnerUID` | string | Sí | RunnerUID del usuario a verificar |
| `actID` | number | Sí | ID de la actividad a verificar |

### Response Exitosa (200)

#### Si el usuario ya dio zonas:
```json
{
  "hasGiven": true,
  "zona": {
    "id": 1,
    "RunnerUID": "Z2R738268MVJ",
    "actID": 1,
    "puntos": 100,
    "fecha": "2025-11-29T10:30:00.000Z"
  }
}
```

#### Si el usuario NO ha dado zonas:
```json
{
  "hasGiven": false,
  "zona": null
}
```

### Ejemplo de Request

```
GET /api/zonas-actividades/has-given/Z2R738268MVJ/1
```

### Ejemplo con Fetch

```javascript
const runnerUID = 'Z2R738268MVJ';
const actID = 1;

const response = await fetch(
  `http://localhost:3000/api/zonas-actividades/has-given/${runnerUID}/${actID}`
);
const data = await response.json();

if (data.hasGiven) {
  console.log('El usuario ya dio zonas a esta actividad');
  console.log('Detalles:', data.zona);
} else {
  console.log('El usuario NO ha dado zonas a esta actividad');
}
```

### Ejemplo con Axios

```javascript
import axios from 'axios';

const runnerUID = 'Z2R738268MVJ';
const actID = 1;

const response = await axios.get(
  `http://localhost:3000/api/zonas-actividades/has-given/${runnerUID}/${actID}`
);

if (response.data.hasGiven) {
  console.log('El usuario ya dio zonas');
} else {
  console.log('El usuario NO ha dado zonas');
}
```

### Casos de Uso

Este endpoint es especialmente útil para:
- Verificar el estado del botón de "like" al cargar una actividad
- Determinar si se debe mostrar el botón como "Ya diste zonas" o "Dar zonas"
- Evitar que el usuario intente dar zonas dos veces (aunque el backend también lo previene)

---

## 3. Obtener Todas las Zonas de un Usuario

Obtiene todas las zonas (puntos) que un usuario ha recibido. Este endpoint devuelve todas las zonas donde el usuario es el receptor (`RunnerUID`), ordenadas por fecha descendente (más recientes primero).

**Endpoint:** `GET /api/zonas/get-by-runneruid/:runnerUID`

### Parámetros de Ruta

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `runnerUID` | string | Sí | RunnerUID del usuario del cual se quieren obtener las zonas recibidas |

### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `currentUser` | string | No | RunnerUID del usuario que está consultando (opcional, para futuras mejoras) |

### Response Exitosa (200)

```json
{
  "message": "Zonas obtenidas exitosamente",
  "status": "success",
  "total": 5,
  "runnerUID": "Z2R738268MVJ",
  "zonas": [
    {
      "zonaID": 1,
      "RunnerUID": "Z2R738268MVJ",
      "RunnerUIDRef": "Z2R776985QXZ",
      "puntos": 100,
      "motivo": "R",
      "origen": "3",
      "fecha": "2025-11-29T10:30:00.000Z"
    },
    {
      "zonaID": 2,
      "RunnerUID": "Z2R738268MVJ",
      "RunnerUIDRef": "Z2R698973TQU",
      "puntos": 50,
      "motivo": "R",
      "origen": "3",
      "fecha": "2025-11-28T15:20:00.000Z"
    }
  ]
}
```

### Errores Posibles

#### 404 - Usuario no encontrado
```json
{
  "statusCode": 404,
  "message": "Usuario con RunnerUID Z2R738268MVJ no encontrado",
  "error": "Not Found"
}
```

### Ejemplo de Request

```
GET /api/zonas/get-by-runneruid/Z2R738268MVJ
GET /api/zonas/get-by-runneruid/Z2R738268MVJ?currentUser=Z2R776985QXZ
```

### Ejemplo con Fetch

```javascript
const runnerUID = 'Z2R738268MVJ';

const response = await fetch(
  `http://localhost:3000/api/zonas/get-by-runneruid/${runnerUID}`
);
const data = await response.json();

console.log(`Total de zonas recibidas: ${data.total}`);
console.log('Zonas:', data.zonas);
```

### Ejemplo con Axios

```javascript
import axios from 'axios';

const runnerUID = 'Z2R738268MVJ';

const response = await axios.get(
  `http://localhost:3000/api/zonas/get-by-runneruid/${runnerUID}`,
  {
    params: {
      currentUser: 'Z2R776985QXZ' // Opcional
    }
  }
);

console.log(response.data.zonas);
```

### Campos de la Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `message` | string | Mensaje de confirmación |
| `status` | string | Estado de la operación ("success") |
| `total` | number | Número total de zonas recibidas |
| `runnerUID` | string | RunnerUID del usuario consultado |
| `zonas` | array | Array de objetos con las zonas recibidas |

### Estructura de cada Zona

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `zonaID` | number | ID único de la zona |
| `RunnerUID` | string | RunnerUID del usuario que recibió las zonas |
| `RunnerUIDRef` | string | RunnerUID del usuario que dio las zonas (puede ser null) |
| `puntos` | number | Cantidad de puntos otorgados |
| `motivo` | string | Motivo de la zona (ej: "R" para Runner) |
| `origen` | string | Origen de la zona (ej: "3") |
| `fecha` | string | Fecha en que se otorgaron las zonas (ISO 8601) |

### Casos de Uso

Este endpoint es útil para:
- Mostrar el historial de zonas recibidas por un usuario
- Calcular el total de puntos acumulados
- Mostrar en el perfil del usuario todas las zonas que ha recibido
- Generar reportes de actividad y puntos

### Nota Importante

Este endpoint devuelve las zonas que el usuario **recibió** (donde `RunnerUID` es el usuario que recibió). Si necesitas las zonas que el usuario **dio**, debes usar el endpoint `GET /api/zonas-actividades/given-by-user/:runnerUID`.

---

## Notas Importantes

1. **Restricción Única**: Un usuario solo puede dar zonas una vez por actividad. Si intenta dar zonas nuevamente, recibirá un error 409 (Conflict).

2. **Transacción Atómica**: Cuando se dan zonas, se crean dos registros en una transacción:
   - `zonas_actividades`: Relación usuario-actividad
   - `zonas`: Registro de puntos para el usuario que recibe

3. **Puntos**: Los puntos otorgados deben ser mayor o igual a 1. El valor por defecto típico es 100.

4. **Validaciones Automáticas**: El sistema valida que:
   - El usuario que da las zonas existe
   - La actividad existe
   - El dueño de la actividad existe
   - No se haya dado zonas previamente a esa actividad

---

## Integración con Feed de Actividades

Estos endpoints se complementan con los endpoints del feed de actividades que incluyen el campo `hasGivenZonas` en cada actividad:

- `GET /api/actividades/feed/:runneruid?currentUser=Z2R738268MVJ`
- `GET /api/actividades/feed-public?currentUser=Z2R738268MVJ`
- `GET /api/actividades/get-by-runneruid/:runneruid?currentUser=Z2R738268MVJ`

El campo `hasGivenZonas` indica si el usuario actual (`currentUser`) ya dio zonas a cada actividad, permitiendo actualizar la UI instantáneamente sin necesidad de llamadas adicionales.

