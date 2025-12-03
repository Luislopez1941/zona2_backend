# Documentación de API - Filtros de Equipos

Esta documentación describe los endpoints para filtrar equipos por país, ciudad y estado.

---

## GET `/api/equipos/by-pais/:pais`

Obtiene equipos filtrados por país.

**Endpoint:** `GET /api/equipos/by-pais/:pais`

**Parámetros de URL:**
- `pais` (string, requerido): Nombre del país

**Ejemplo de Request:**
```
GET /api/equipos/by-pais/México
```

**Descripción:** Retorna una lista de todos los equipos activos que pertenecen al país especificado, ordenados alfabéticamente por nombre del equipo.

**Respuesta Exitosa (200):**
```json
{
  "message": "Equipos obtenidos exitosamente",
  "status": "success",
  "total": 15,
  "pais": "México",
  "equipos": [
    {
      "OrgID": 1,
      "RunnerUID": "Z2R807989IZU",
      "NombreEquipo": "Corredores Mérida",
      "AliasEquipo": "corredores-merida",
      "Descripcion": "Equipo de corredores de la ciudad de Mérida",
      "Ciudad": "Mérida",
      "Estado": "Yucatán",
      "Pais": "México",
      "Contacto": "Juan Pérez",
      "Celular": "9991234567",
      "Correo": "contacto@corredoresmerida.com",
      "LugarEntrenamiento": "Parque de la Paz",
      "Disciplinas": "Running, Trail Running",
      "HorarioEntrenamiento": "1970-01-01T06:00:00.000Z",
      "AtletasActivos": 25,
      "EntrenadoresTotales": 3,
      "NivelEquipo": "Intermedio",
      "Certificacion": "Independiente",
      "ProgramasDisponibles": "Digital",
      "IntegracionZona2": false,
      "CostoMensual": 500.00,
      "ContactoWhatsApp": "9991234567",
      "RedSocial": "https://facebook.com/corredoresmerida",
      "Activo": true
    }
  ]
}
```

**Nota:** La búsqueda es exacta (case-sensitive). Solo retorna equipos activos (`Activo: true`).

**Ejemplo de Uso:**
```bash
curl -X GET https://zona2.mx/api/equipos/by-pais/México
```

---

## GET `/api/equipos/by-ciudad/:ciudad`

Obtiene equipos filtrados por ciudad.

**Endpoint:** `GET /api/equipos/by-ciudad/:ciudad`

**Parámetros de URL:**
- `ciudad` (string, requerido): Nombre de la ciudad

**Ejemplo de Request:**
```
GET /api/equipos/by-ciudad/Mérida
```

**Descripción:** Retorna una lista de todos los equipos activos que pertenecen a la ciudad especificada, ordenados alfabéticamente por nombre del equipo.

**Respuesta Exitosa (200):**
```json
{
  "message": "Equipos obtenidos exitosamente",
  "status": "success",
  "total": 5,
  "ciudad": "Mérida",
  "equipos": [
    {
      "OrgID": 1,
      "RunnerUID": "Z2R807989IZU",
      "NombreEquipo": "Corredores Mérida",
      "Ciudad": "Mérida",
      "Estado": "Yucatán",
      "Pais": "México",
      "AtletasActivos": 25,
      "Activo": true
    }
  ]
}
```

**Nota:** La búsqueda es exacta (case-sensitive). Solo retorna equipos activos (`Activo: true`).

**Ejemplo de Uso:**
```bash
curl -X GET https://zona2.mx/api/equipos/by-ciudad/Mérida
```

---

## GET `/api/equipos/by-estado/:estado`

Obtiene equipos filtrados por estado.

**Endpoint:** `GET /api/equipos/by-estado/:estado`

**Parámetros de URL:**
- `estado` (string, requerido): Nombre del estado

**Ejemplo de Request:**
```
GET /api/equipos/by-estado/Yucatán
```

**Descripción:** Retorna una lista de todos los equipos activos que pertenecen al estado especificado, ordenados alfabéticamente por nombre del equipo.

**Respuesta Exitosa (200):**
```json
{
  "message": "Equipos obtenidos exitosamente",
  "status": "success",
  "total": 10,
  "estado": "Yucatán",
  "equipos": [
    {
      "OrgID": 1,
      "RunnerUID": "Z2R807989IZU",
      "NombreEquipo": "Corredores Mérida",
      "Ciudad": "Mérida",
      "Estado": "Yucatán",
      "Pais": "México",
      "AtletasActivos": 25,
      "Activo": true
    },
    {
      "OrgID": 2,
      "RunnerUID": "Z2R999888777",
      "NombreEquipo": "Runners Progreso",
      "Ciudad": "Progreso",
      "Estado": "Yucatán",
      "Pais": "México",
      "AtletasActivos": 15,
      "Activo": true
    }
  ]
}
```

**Nota:** La búsqueda es exacta (case-sensitive). Solo retorna equipos activos (`Activo: true`).

**Ejemplo de Uso:**
```bash
curl -X GET https://zona2.mx/api/equipos/by-estado/Yucatán
```

---

## Características Comunes

### Filtrado
- Todos los endpoints solo retornan equipos con `Activo: true`
- La búsqueda es **exacta** (case-sensitive), por lo que "Mérida" y "mérida" son diferentes
- Los resultados están ordenados alfabéticamente por `NombreEquipo`

### Respuesta
Todos los endpoints retornan el mismo formato de respuesta:
- `message`: Mensaje descriptivo
- `status`: Estado de la operación (`success`)
- `total`: Número total de equipos encontrados
- `pais`/`ciudad`/`estado`: Parámetro de búsqueda utilizado
- `equipos`: Array con los equipos encontrados

### Campos del Equipo
Cada equipo incluye todos sus campos:
- `OrgID`: ID único del equipo
- `RunnerUID`: ID del usuario que creó el equipo
- `NombreEquipo`: Nombre del equipo
- `AliasEquipo`: Alias del equipo
- `Descripcion`: Descripción del equipo
- `Ciudad`, `Estado`, `Pais`: Ubicación
- `Contacto`, `Celular`, `Correo`: Información de contacto
- `LugarEntrenamiento`: Lugar de entrenamiento
- `Disciplinas`: Disciplinas que practica
- `HorarioEntrenamiento`: Horario de entrenamiento
- `AtletasActivos`: Número de atletas activos
- `EntrenadoresTotales`: Número total de entrenadores
- `NivelEquipo`: Nivel del equipo (Recreativo, Intermedio, Competitivo, Elite)
- `Certificacion`: Tipo de certificación (Verificado, Afiliado, Independiente)
- `ProgramasDisponibles`: Tipo de programas (Manual, Digital, Ambos)
- `CostoMensual`: Costo mensual de membresía
- `ContactoWhatsApp`: Número de WhatsApp
- `RedSocial`: URL de red social
- `Activo`: Estado del equipo

### Ejemplos de Uso con JavaScript/Fetch

**Buscar por país:**
```javascript
const getEquiposByPais = async (pais) => {
  const response = await fetch(`https://zona2.mx/api/equipos/by-pais/${encodeURIComponent(pais)}`);
  const data = await response.json();
  return data;
};

// Uso
const equipos = await getEquiposByPais('México');
```

**Buscar por ciudad:**
```javascript
const getEquiposByCiudad = async (ciudad) => {
  const response = await fetch(`https://zona2.mx/api/equipos/by-ciudad/${encodeURIComponent(ciudad)}`);
  const data = await response.json();
  return data;
};

// Uso
const equipos = await getEquiposByCiudad('Mérida');
```

**Buscar por estado:**
```javascript
const getEquiposByEstado = async (estado) => {
  const response = await fetch(`https://zona2.mx/api/equipos/by-estado/${encodeURIComponent(estado)}`);
  const data = await response.json();
  return data;
};

// Uso
const equipos = await getEquiposByEstado('Yucatán');
```

### Notas Importantes

1. **Case Sensitivity:** Las búsquedas son case-sensitive. "México" y "méxico" son diferentes.

2. **Encoding:** Al usar caracteres especiales o acentos en la URL, asegúrate de usar `encodeURIComponent()` en JavaScript o el encoding apropiado en tu lenguaje.

3. **Equipos Inactivos:** Solo se retornan equipos con `Activo: true`. Los equipos inactivos no aparecerán en los resultados.

4. **Sin Resultados:** Si no hay equipos que coincidan con el filtro, se retornará un array vacío:
   ```json
   {
     "message": "Equipos obtenidos exitosamente",
     "status": "success",
     "total": 0,
     "pais": "España",
     "equipos": []
   }
   ```

**Base URL:**
- **Desarrollo:** `http://localhost:4000/api`
- **Producción:** `https://zona2.mx/api`

---

**Última actualización:** Diciembre 2024

