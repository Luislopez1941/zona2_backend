# Documentación: API de Seguidores (Followers)

Esta documentación describe los endpoints para gestionar el sistema de seguimiento de usuarios, similar a una red social.

---

## 1. Endpoint: Seguir a un Usuario

### Descripción
Este endpoint permite a un usuario seguir a otro usuario. Crea un registro en la tabla `Followers` que establece la relación de seguimiento.

### Detalles del Endpoint

#### Método HTTP
```
POST
```

#### Ruta
```
/api/folloers/follow/:follower_runnerUID
```

#### Parámetros de Ruta

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `follower_runnerUID` | string | Sí | El RunnerUID del usuario que quiere seguir (tú). Ejemplo: `Z2R738268MVJ` |

#### Body (JSON)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `followed_runnerUID` | string | Sí | El RunnerUID de la persona que quieres seguir. Ejemplo: `Z2R776985QXZ` |

#### Autenticación
No requiere autenticación (puede variar según tu configuración).

---

### Respuesta Exitosa

#### Código de Estado
```
200 OK
```

#### Estructura de la Respuesta

```json
{
  "message": "Usuario seguido exitosamente",
  "status": "success",
  "follow": {
    "id": 1,
    "follower_runnerUID": "Z2R738268MVJ",
    "followed_runnerUID": "Z2R776985QXZ"
  }
}
```

---

### Respuestas de Error

#### Usuario que Sigue No Encontrado

**Código de Estado:** `404 Not Found`

```json
{
  "statusCode": 404,
  "message": "Usuario con RunnerUID Z2R738268MVJ no encontrado",
  "error": "Not Found"
}
```

#### Usuario a Seguir No Encontrado

**Código de Estado:** `404 Not Found`

```json
{
  "statusCode": 404,
  "message": "Usuario con RunnerUID Z2R776985QXZ no encontrado",
  "error": "Not Found"
}
```

#### Intentar Seguirse a Sí Mismo

**Código de Estado:** `409 Conflict`

```json
{
  "statusCode": 409,
  "message": "No puedes seguirte a ti mismo",
  "error": "Conflict"
}
```

#### Ya Sigues a Este Usuario

**Código de Estado:** `409 Conflict`

```json
{
  "statusCode": 409,
  "message": "Ya sigues a este usuario",
  "error": "Conflict"
}
```

---

## 2. Endpoint: Dejar de Seguir a un Usuario

### Descripción
Este endpoint permite a un usuario dejar de seguir a otro usuario. Elimina el registro de la tabla `Followers`.

### Detalles del Endpoint

#### Método HTTP
```
DELETE
```

#### Ruta
```
/api/folloers/unfollow/:follower_runnerUID/:followed_runnerUID
```

#### Parámetros de Ruta

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `follower_runnerUID` | string | Sí | El RunnerUID del usuario que quiere dejar de seguir (tú). Ejemplo: `Z2R738268MVJ` |
| `followed_runnerUID` | string | Sí | El RunnerUID de la persona que quieres dejar de seguir. Ejemplo: `Z2R776985QXZ` |

#### Autenticación
No requiere autenticación (puede variar según tu configuración).

---

### Respuesta Exitosa

#### Código de Estado
```
200 OK
```

#### Estructura de la Respuesta

```json
{
  "message": "Usuario dejado de seguir exitosamente",
  "status": "success"
}
```

---

### Respuestas de Error

#### No Sigues a Este Usuario

**Código de Estado:** `404 Not Found`

```json
{
  "statusCode": 404,
  "message": "No sigues a este usuario",
  "error": "Not Found"
}
```

---

## 3. Endpoint: Obtener Usuarios que Sigo

### Descripción
Este endpoint retorna todos los usuarios que sigue un usuario específico. Útil para mostrar la lista de personas que sigues.

### Detalles del Endpoint

#### Método HTTP
```
GET
```

#### Ruta
```
/api/folloers/following/:runneruid
```

#### Parámetros de Ruta

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `runneruid` | string | Sí | El RunnerUID del usuario. Ejemplo: `Z2R738268MVJ` |

#### Autenticación
No requiere autenticación (puede variar según tu configuración).

---

### Respuesta Exitosa

#### Código de Estado
```
200 OK
```

#### Estructura de la Respuesta

```json
{
  "message": "Usuarios seguidos obtenidos exitosamente",
  "status": "success",
  "total": 5,
  "runneruid": "Z2R738268MVJ",
  "following": [
    {
      "RunnerUID": "Z2R776985QXZ",
      "name": "María",
      "AliasRunner": "R776985QXZ",
      "picture": null,
      "Ciudad": "Cancún",
      "Estado": "Quintana Roo",
      "Pais": "México",
      "TipoMembresia": "R"
    },
    {
      "RunnerUID": "Z2R698973TQU",
      "name": "Carlos",
      "AliasRunner": "O698973TQU",
      "picture": null,
      "Ciudad": "Mérida",
      "Estado": "Yucatán",
      "Pais": "México",
      "TipoMembresia": "O"
    }
  ]
}
```

### Campos de la Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `message` | string | Mensaje descriptivo de la operación |
| `status` | string | Estado de la operación (`success`) |
| `total` | number | Número total de usuarios seguidos |
| `runneruid` | string | El RunnerUID del usuario consultado |
| `following` | array | Array de objetos con información de los usuarios seguidos |

### Campos del Usuario Seguido

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `RunnerUID` | string | Identificador único del usuario |
| `name` | string | Nombre del usuario |
| `AliasRunner` | string | Alias del usuario |
| `picture` | Buffer\|null | Foto de perfil (puede ser null) |
| `Ciudad` | string\|null | Ciudad del usuario |
| `Estado` | string\|null | Estado del usuario |
| `Pais` | string\|null | País del usuario |
| `TipoMembresia` | string\|null | Tipo de membresía (R=Runner, O=Organizador, S=Establecimiento, P=Pacer) |

---

### Respuestas de Error

#### Usuario No Encontrado

**Código de Estado:** `404 Not Found`

```json
{
  "statusCode": 404,
  "message": "Usuario con RunnerUID Z2R738268MVJ no encontrado",
  "error": "Not Found"
}
```

#### Sin Usuarios Seguidos

Si el usuario existe pero no sigue a nadie, se retorna:

```json
{
  "message": "Usuarios seguidos obtenidos exitosamente",
  "status": "success",
  "total": 0,
  "runneruid": "Z2R738268MVJ",
  "following": []
}
```

---

## 4. Endpoint: Obtener Mis Seguidores

### Descripción
Este endpoint retorna todos los usuarios que siguen a un usuario específico. Útil para mostrar la lista de seguidores.

### Detalles del Endpoint

#### Método HTTP
```
GET
```

#### Ruta
```
/api/folloers/followers/:runneruid
```

#### Parámetros de Ruta

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `runneruid` | string | Sí | El RunnerUID del usuario. Ejemplo: `Z2R738268MVJ` |

#### Autenticación
No requiere autenticación (puede variar según tu configuración).

---

### Respuesta Exitosa

#### Código de Estado
```
200 OK
```

#### Estructura de la Respuesta

```json
{
  "message": "Seguidores obtenidos exitosamente",
  "status": "success",
  "total": 8,
  "runneruid": "Z2R738268MVJ",
  "followers": [
    {
      "RunnerUID": "Z2R776985QXZ",
      "name": "María",
      "AliasRunner": "R776985QXZ",
      "picture": null,
      "Ciudad": "Cancún",
      "Estado": "Quintana Roo",
      "Pais": "México",
      "TipoMembresia": "R"
    },
    {
      "RunnerUID": "Z2R698973TQU",
      "name": "Carlos",
      "AliasRunner": "O698973TQU",
      "picture": null,
      "Ciudad": "Mérida",
      "Estado": "Yucatán",
      "Pais": "México",
      "TipoMembresia": "O"
    }
  ]
}
```

### Campos de la Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `message` | string | Mensaje descriptivo de la operación |
| `status` | string | Estado de la operación (`success`) |
| `total` | number | Número total de seguidores |
| `runneruid` | string | El RunnerUID del usuario consultado |
| `followers` | array | Array de objetos con información de los seguidores |

### Campos del Seguidor

Los campos son los mismos que en el endpoint de "Usuarios que Sigo" (ver sección anterior).

---

### Respuestas de Error

#### Usuario No Encontrado

**Código de Estado:** `404 Not Found`

```json
{
  "statusCode": 404,
  "message": "Usuario con RunnerUID Z2R738268MVJ no encontrado",
  "error": "Not Found"
}
```

#### Sin Seguidores

Si el usuario existe pero no tiene seguidores, se retorna:

```json
{
  "message": "Seguidores obtenidos exitosamente",
  "status": "success",
  "total": 0,
  "runneruid": "Z2R738268MVJ",
  "followers": []
}
```

---

## Ejemplos de Uso

### JavaScript (Fetch API)

#### Seguir a un Usuario

```javascript
const followerUID = 'Z2R738268MVJ';
const followedUID = 'Z2R776985QXZ';

fetch(`http://localhost:4000/api/folloers/follow/${followerUID}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    followed_runnerUID: followedUID
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

#### Dejar de Seguir a un Usuario

```javascript
const followerUID = 'Z2R738268MVJ';
const followedUID = 'Z2R776985QXZ';

fetch(`http://localhost:4000/api/folloers/unfollow/${followerUID}/${followedUID}`, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  }
})
  .then(response => response.json())
  .then(data => {
    console.log(data.message);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

#### Obtener Usuarios que Sigo

```javascript
const runneruid = 'Z2R738268MVJ';

fetch(`http://localhost:4000/api/folloers/following/${runneruid}`)
  .then(response => response.json())
  .then(data => {
    console.log(`Sigues a ${data.total} usuarios`);
    console.log('Usuarios seguidos:', data.following);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

#### Obtener Mis Seguidores

```javascript
const runneruid = 'Z2R738268MVJ';

fetch(`http://localhost:4000/api/folloers/followers/${runneruid}`)
  .then(response => response.json())
  .then(data => {
    console.log(`Tienes ${data.total} seguidores`);
    console.log('Seguidores:', data.followers);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### JavaScript (Async/Await)

#### Seguir a un Usuario

```javascript
async function seguirUsuario(followerUID, followedUID) {
  try {
    const response = await fetch(
      `http://localhost:4000/api/folloers/follow/${followerUID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followed_runnerUID: followedUID
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al seguir usuario:', error);
    throw error;
  }
}

// Uso
await seguirUsuario('Z2R738268MVJ', 'Z2R776985QXZ');
```

#### Dejar de Seguir a un Usuario

```javascript
async function dejarDeSeguir(followerUID, followedUID) {
  try {
    const response = await fetch(
      `http://localhost:4000/api/folloers/unfollow/${followerUID}/${followedUID}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al dejar de seguir:', error);
    throw error;
  }
}

// Uso
await dejarDeSeguir('Z2R738268MVJ', 'Z2R776985QXZ');
```

### Axios

#### Seguir a un Usuario

```javascript
import axios from 'axios';

const seguirUsuario = async (followerUID, followedUID) => {
  try {
    const response = await axios.post(
      `http://localhost:4000/api/folloers/follow/${followerUID}`,
      {
        followed_runnerUID: followedUID
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      console.error('Ya sigues a este usuario o no puedes seguirte a ti mismo');
    } else if (error.response?.status === 404) {
      console.error('Usuario no encontrado');
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};

// Uso
await seguirUsuario('Z2R738268MVJ', 'Z2R776985QXZ');
```

#### Obtener Usuarios que Sigo

```javascript
import axios from 'axios';

const obtenerUsuariosQueSigo = async (runneruid) => {
  try {
    const response = await axios.get(
      `http://localhost:4000/api/folloers/following/${runneruid}`
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios seguidos:', error);
    throw error;
  }
};

// Uso
const data = await obtenerUsuariosQueSigo('Z2R738268MVJ');
console.log(data.following);
```

### React Hooks

#### Hook para Seguir/Dejar de Seguir

```javascript
import { useState } from 'react';
import axios from 'axios';

function useFollow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const seguir = async (followerUID, followedUID) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        `/api/folloers/follow/${followerUID}`,
        { followed_runnerUID: followedUID }
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al seguir usuario';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const dejarDeSeguir = async (followerUID, followedUID) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.delete(
        `/api/folloers/unfollow/${followerUID}/${followedUID}`
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al dejar de seguir';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { seguir, dejarDeSeguir, loading, error };
}

// Uso en componente
function UsuarioCard({ usuario, miRunnerUID }) {
  const { seguir, dejarDeSeguir, loading } = useFollow();
  const [siguiendo, setSiguiendo] = useState(false);

  const handleFollow = async () => {
    try {
      if (siguiendo) {
        await dejarDeSeguir(miRunnerUID, usuario.RunnerUID);
        setSiguiendo(false);
      } else {
        await seguir(miRunnerUID, usuario.RunnerUID);
        setSiguiendo(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h3>{usuario.name}</h3>
      <button onClick={handleFollow} disabled={loading}>
        {siguiendo ? 'Dejar de Seguir' : 'Seguir'}
      </button>
    </div>
  );
}
```

#### Hook para Obtener Usuarios que Sigo

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

function useFollowing(runneruid) {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/folloers/following/${runneruid}`
        );
        setFollowing(response.data.following);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar usuarios seguidos');
        setFollowing([]);
      } finally {
        setLoading(false);
      }
    };

    if (runneruid) {
      fetchFollowing();
    }
  }, [runneruid]);

  return { following, loading, error };
}

// Uso en componente
function FollowingList({ runneruid }) {
  const { following, loading, error } = useFollowing(runneruid);

  if (loading) return <div>Cargando usuarios seguidos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Usuarios que sigo ({following.length})</h2>
      {following.map(usuario => (
        <div key={usuario.RunnerUID}>
          <h3>{usuario.name}</h3>
          <p>{usuario.Ciudad}, {usuario.Estado}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Hook para Obtener Seguidores

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

function useFollowers(runneruid) {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/folloers/followers/${runneruid}`
        );
        setFollowers(response.data.followers);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar seguidores');
        setFollowers([]);
      } finally {
        setLoading(false);
      }
    };

    if (runneruid) {
      fetchFollowers();
    }
  }, [runneruid]);

  return { followers, loading, error };
}

// Uso en componente
function FollowersList({ runneruid }) {
  const { followers, loading, error } = useFollowers(runneruid);

  if (loading) return <div>Cargando seguidores...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Seguidores ({followers.length})</h2>
      {followers.map(usuario => (
        <div key={usuario.RunnerUID}>
          <h3>{usuario.name}</h3>
          <p>{usuario.Ciudad}, {usuario.Estado}</p>
        </div>
      ))}
    </div>
  );
}
```

### cURL

#### Seguir a un Usuario

```bash
curl -X POST \
  http://localhost:4000/api/folloers/follow/Z2R738268MVJ \
  -H 'Content-Type: application/json' \
  -d '{
    "followed_runnerUID": "Z2R776985QXZ"
  }'
```

#### Dejar de Seguir a un Usuario

```bash
curl -X DELETE \
  http://localhost:4000/api/folloers/unfollow/Z2R738268MVJ/Z2R776985QXZ \
  -H 'Content-Type: application/json'
```

#### Obtener Usuarios que Sigo

```bash
curl -X GET \
  http://localhost:4000/api/folloers/following/Z2R738268MVJ \
  -H 'Content-Type: application/json'
```

#### Obtener Mis Seguidores

```bash
curl -X GET \
  http://localhost:4000/api/folloers/followers/Z2R738268MVJ \
  -H 'Content-Type: application/json'
```

---

## Notas Importantes

### Sistema de Seguimiento

1. **Relación Bidireccional**: El seguimiento es unidireccional. Si A sigue a B, B no sigue automáticamente a A.
2. **Tabla Followers**: Cada relación de seguimiento se almacena como un registro en la tabla `Followers` con:
   - `follower_runnerUID`: El usuario que sigue
   - `followed_runnerUID`: El usuario que es seguido
3. **Restricciones**:
   - No puedes seguirte a ti mismo
   - No puedes seguir al mismo usuario dos veces
   - Solo puedes dejar de seguir a usuarios que realmente sigues

### Validaciones

1. **Existencia de Usuarios**: Ambos usuarios (el que sigue y el seguido) deben existir en la base de datos.
2. **Unicidad**: La combinación `follower_runnerUID` + `followed_runnerUID` es única (no se pueden duplicar relaciones).
3. **Propiedad**: Solo puedes dejar de seguir a usuarios que realmente sigues.

### Integración con Feed

Una vez que sigues a usuarios, puedes usar el endpoint de feed para obtener sus actividades públicas:
```
GET /api/actividades/feed/:runneruid
```

Este endpoint retorna las actividades públicas de los usuarios que sigues.

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Éxito - Operación completada correctamente |
| 404 | No encontrado - Usuario o relación no encontrada |
| 409 | Conflicto - Ya sigues a este usuario o intentas seguirte a ti mismo |

---

## Versión
- **API Version**: 1.0
- **Última actualización**: 2025-11-27

