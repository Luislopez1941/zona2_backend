# Documentación de API - Búsqueda de Usuarios

## GET `/api/sec-users/search`

Búsqueda optimizada de usuarios por nombre con paginación.

**Endpoint:** `GET /api/sec-users/search`

**Query Parameters:**
- `query` (string, requerido): Término de búsqueda (mínimo 2 caracteres)
- `page` (number, opcional): Número de página (default: 1)
- `limit` (number, opcional): Resultados por página (default: 20, máximo: 50)

**Ejemplo de Request:**
```
GET /api/sec-users/search?query=Juan&page=1&limit=20
```

**Validaciones:**
- `query` debe tener al menos 2 caracteres
- `page` debe ser un número mayor a 0
- `limit` debe ser un número mayor a 0 (máximo 50)

**Algoritmo de Búsqueda:**
1. **Búsqueda Principal:** Busca usuarios cuyo nombre **empieza** con el término de búsqueda (más relevante)
2. **Búsqueda Secundaria:** Si no hay resultados, busca usuarios cuyo nombre **contiene** el término
3. Solo retorna usuarios activos (`active: 'Y'`)
4. Los resultados están ordenados alfabéticamente por nombre

**Respuesta Exitosa (200):**
```json
{
  "message": "Búsqueda de usuarios completada exitosamente",
  "status": "success",
  "query": "Juan",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "usuarios": [
    {
      "RunnerUID": "Z2R807989IZU",
      "name": "Juan Pérez",
      "AliasRunner": "juanperez",
      "email": "juan@example.com",
      "Ciudad": "Mérida",
      "Estado": "Yucatán",
      "Pais": "México",
      "TipoMembresia": "Premium",
      "picture": "https://example.com/picture.jpg",
      "NivelRunner": 5
    }
  ]
}
```

**Campos del Usuario:**
- `RunnerUID`: ID único del usuario
- `name`: Nombre completo
- `AliasRunner`: Alias del corredor
- `email`: Correo electrónico
- `Ciudad`, `Estado`, `Pais`: Ubicación
- `TipoMembresia`: Tipo de membresía
- `picture`: URL de la foto de perfil
- `NivelRunner`: Nivel del corredor

**Información de Paginación:**
- `page`: Página actual
- `limit`: Resultados por página
- `total`: Total de resultados encontrados
- `totalPages`: Total de páginas disponibles
- `hasNextPage`: Indica si hay más páginas
- `hasPreviousPage`: Indica si hay páginas anteriores

**Errores:**

- `400 Bad Request`: Si el query tiene menos de 2 caracteres
  ```json
  {
    "statusCode": 400,
    "message": "El parámetro query debe tener al menos 2 caracteres",
    "error": "Bad Request"
  }
  ```

- `400 Bad Request`: Si el parámetro `page` es inválido
  ```json
  {
    "statusCode": 400,
    "message": "El parámetro page debe ser un número mayor a 0",
    "error": "Bad Request"
  }
  ```

- `400 Bad Request`: Si el parámetro `limit` es inválido
  ```json
  {
    "statusCode": 400,
    "message": "El parámetro limit debe ser un número mayor a 0",
    "error": "Bad Request"
  }
  ```

**Optimizaciones:**
- Usa índices de MySQL eficientemente con `startsWith` (no comienza con `%`)
- Paginación para evitar sobrecarga
- Límite máximo de 50 resultados por página
- Búsqueda en dos fases: primero "empieza con" (más rápida), luego "contiene" si no hay resultados

**Ejemplos de Uso:**

1. **Búsqueda básica:**
   ```
   GET /api/sec-users/search?query=Mar
   ```

2. **Búsqueda con paginación:**
   ```
   GET /api/sec-users/search?query=Juan&page=2&limit=10
   ```

3. **Búsqueda con límite máximo:**
   ```
   GET /api/sec-users/search?query=Pedro&limit=100
   ```
   (Se limitará automáticamente a 50 resultados)

**Base URL:**
- **Desarrollo:** `http://localhost:4000/api`
- **Producción:** `https://zona2.mx/api`

---

**Última actualización:** Diciembre 2024

