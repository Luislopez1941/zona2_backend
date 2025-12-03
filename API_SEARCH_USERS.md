# API - Búsqueda de Usuarios

## Endpoint

```
GET /api/sec-users/search
```

## Descripción

Endpoint optimizado y escalable para buscar usuarios por nombre. Utiliza búsqueda eficiente con índices de MySQL para obtener resultados rápidos y relevantes.

## Características

- ✅ Búsqueda por nombre usando `startsWith` (usa índices de MySQL eficientemente)
- ✅ Si no hay resultados, busca con `contains` (búsqueda más amplia)
- ✅ Solo retorna usuarios activos (`active: 'Y'`)
- ✅ Paginación con límite máximo de 50 resultados por página
- ✅ Validación de parámetros
- ✅ Respuesta estructurada con información de paginación
- ✅ Excluye campos sensibles (solo retorna datos públicos)

## Parámetros de Query

| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|-----------|-------------|---------|
| `query` | string | ✅ Sí | Término de búsqueda (mínimo 2 caracteres) | `Juan` |
| `page` | number | ❌ No | Número de página (por defecto: 1) | `1` |
| `limit` | number | ❌ No | Resultados por página (por defecto: 20, máximo: 50) | `20` |

## Validaciones

- **query**: Debe tener al menos 2 caracteres. Si no se proporciona o tiene menos de 2 caracteres, retorna error `400 Bad Request`.
- **page**: Debe ser un número mayor a 0. Si no es válido, retorna error `400 Bad Request`.
- **limit**: Debe ser un número mayor a 0. Si es mayor a 50, se limita automáticamente a 50.

## Ejemplos de Uso

### Ejemplo 1: Búsqueda básica

```bash
GET /api/sec-users/search?query=Juan
```

**Respuesta:**
```json
{
  "message": "Búsqueda de usuarios completada exitosamente",
  "status": "success",
  "query": "Juan",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "usuarios": [
    {
      "RunnerUID": "Z2R123456ABC",
      "name": "Juan Pérez",
      "AliasRunner": "R123456ABC",
      "email": "juan.perez@example.com",
      "Ciudad": "Mérida",
      "Estado": "Yucatán",
      "Pais": "México",
      "TipoMembresia": "R",
      "picture": null,
      "NivelRunner": "B"
    },
    {
      "RunnerUID": "Z2R789012DEF",
      "name": "Juan García",
      "AliasRunner": "R789012DEF",
      "email": "juan.garcia@example.com",
      "Ciudad": "Cancún",
      "Estado": "Quintana Roo",
      "Pais": "México",
      "TipoMembresia": "R",
      "picture": null,
      "NivelRunner": "A"
    }
  ]
}
```

### Ejemplo 2: Búsqueda con paginación

```bash
GET /api/sec-users/search?query=María&page=2&limit=10
```

**Respuesta:**
```json
{
  "message": "Búsqueda de usuarios completada exitosamente",
  "status": "success",
  "query": "María",
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": true
  },
  "usuarios": [
    // ... 10 usuarios (página 2)
  ]
}
```

### Ejemplo 3: Búsqueda con límite máximo

```bash
GET /api/sec-users/search?query=Luis&limit=100
```

**Nota:** Aunque se pide 100 resultados, el sistema automáticamente limita a 50 resultados por página.

**Respuesta:**
```json
{
  "message": "Búsqueda de usuarios completada exitosamente",
  "status": "success",
  "query": "Luis",
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 8,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "usuarios": [
    // ... hasta 50 usuarios
  ]
}
```

## Estructura de Respuesta

### Respuesta Exitosa (200 OK)

```typescript
{
  message: string;           // Mensaje de confirmación
  status: string;            // "success"
  query: string;             // Término de búsqueda utilizado
  pagination: {
    page: number;            // Página actual
    limit: number;           // Resultados por página
    total: number;           // Total de resultados encontrados
    totalPages: number;      // Total de páginas
    hasNextPage: boolean;     // Si hay página siguiente
    hasPreviousPage: boolean;// Si hay página anterior
  };
  usuarios: Array<{
    RunnerUID: string;       // ID único del usuario
    name: string;            // Nombre completo
    AliasRunner: string | null; // Alias del runner
    email: string;           // Email
    Ciudad: string | null;    // Ciudad
    Estado: string | null;    // Estado
    Pais: string | null;     // País
    TipoMembresia: string | null; // Tipo de membresía
    picture: Buffer | null;   // Foto de perfil (buffer)
    NivelRunner: string | null;   // Nivel del runner
  }>;
}
```

### Errores

#### 400 Bad Request - Query muy corto

```json
{
  "statusCode": 400,
  "message": "El parámetro query debe tener al menos 2 caracteres",
  "error": "Bad Request"
}
```

#### 400 Bad Request - Página inválida

```json
{
  "statusCode": 400,
  "message": "El parámetro page debe ser un número mayor a 0",
  "error": "Bad Request"
}
```

#### 400 Bad Request - Límite inválido

```json
{
  "statusCode": 400,
  "message": "El parámetro limit debe ser un número mayor a 0",
  "error": "Bad Request"
}
```

## Algoritmo de Búsqueda

1. **Primera búsqueda (más relevante)**: Busca usuarios cuyo nombre **empieza** con el término de búsqueda usando `startsWith`. Esta búsqueda es más eficiente porque MySQL puede usar índices cuando el patrón no empieza con `%`.

2. **Segunda búsqueda (si no hay resultados)**: Si la primera búsqueda no encuentra resultados, busca usuarios cuyo nombre **contiene** el término de búsqueda usando `contains`. Esta búsqueda es menos eficiente pero más amplia.

3. **Filtrado**: Solo retorna usuarios activos (`active: 'Y'`).

4. **Ordenamiento**: Los resultados se ordenan alfabéticamente por nombre (`name: 'asc'`).

## Optimizaciones

- ✅ Usa índices de MySQL eficientemente con `startsWith`
- ✅ Paginación para evitar cargar demasiados datos
- ✅ Límite máximo de 50 resultados por página
- ✅ Solo retorna campos necesarios (excluye campos sensibles)
- ✅ Búsqueda case-insensitive (MySQL con collation utf8mb4)

## Ejemplos con cURL

```bash
# Búsqueda básica
curl -X GET "https://zona2.mx/api/sec-users/search?query=Juan"

# Búsqueda con paginación
curl -X GET "https://zona2.mx/api/sec-users/search?query=María&page=2&limit=10"

# Búsqueda con límite máximo
curl -X GET "https://zona2.mx/api/sec-users/search?query=Luis&limit=50"
```

## Ejemplos con JavaScript/TypeScript

```typescript
// Búsqueda básica
const response = await fetch('https://zona2.mx/api/sec-users/search?query=Juan');
const data = await response.json();
console.log(data.usuarios);

// Búsqueda con paginación
const searchUsers = async (query: string, page: number = 1, limit: number = 20) => {
  const response = await fetch(
    `https://zona2.mx/api/sec-users/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  );
  
  if (!response.ok) {
    throw new Error('Error en la búsqueda');
  }
  
  return await response.json();
};

// Uso
const resultados = await searchUsers('Juan', 1, 20);
console.log(`Encontrados ${resultados.pagination.total} usuarios`);
console.log(`Página ${resultados.pagination.page} de ${resultados.pagination.totalPages}`);
```

## Ejemplos con Axios

```typescript
import axios from 'axios';

// Búsqueda básica
const buscarUsuarios = async (query: string, page: number = 1, limit: number = 20) => {
  try {
    const response = await axios.get('https://zona2.mx/api/sec-users/search', {
      params: {
        query,
        page,
        limit,
      },
    });
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      console.error('Error de validación:', error.response.data.message);
    } else {
      console.error('Error en la búsqueda:', error.message);
    }
    throw error;
  }
};

// Uso
const resultados = await buscarUsuarios('Juan', 1, 20);
console.log(resultados.usuarios);
```

## Notas Importantes

1. **Mínimo 2 caracteres**: El término de búsqueda debe tener al menos 2 caracteres para evitar búsquedas demasiado amplias.

2. **Límite máximo**: Aunque se puede especificar un límite mayor, el sistema automáticamente limita a 50 resultados por página para evitar sobrecarga.

3. **Solo usuarios activos**: Solo se retornan usuarios con `active: 'Y'`.

4. **Campos sensibles**: El endpoint no retorna campos sensibles como `pswd`, `mfa`, `activation_code`, etc.

5. **Case-insensitive**: La búsqueda no distingue entre mayúsculas y minúsculas.

6. **Ordenamiento**: Los resultados se ordenan alfabéticamente por nombre.

## Casos de Uso

- 🔍 Búsqueda de usuarios para agregar como amigos/seguidores
- 👥 Búsqueda de usuarios para invitar a eventos
- 📱 Autocompletado en formularios de búsqueda
- 🔎 Búsqueda de usuarios por nombre en listas

## Performance

- **Búsqueda con `startsWith`**: Muy rápida, usa índices de MySQL
- **Búsqueda con `contains`**: Más lenta, pero solo se ejecuta si no hay resultados con `startsWith`
- **Paginación**: Limita la cantidad de datos transferidos
- **Select específico**: Solo retorna campos necesarios, reduciendo el tamaño de la respuesta

