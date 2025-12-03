# Documentación de API - Unirse a Equipo

## POST `/api/sec-users/join-a-team`

Permite que un usuario se una a uno o múltiples equipos. Este endpoint actualiza el campo `equiposIDs` (array JSON) del usuario y maneja el contador de atletas activos.

**Endpoint:** `POST /api/sec-users/join-a-team`

**Body (JSON):**
```json
{
  "RunnerUID": "Z2R807989IZU",
  "OrgID": 4
}
```

**Parámetros:**
- `RunnerUID` (string, requerido): ID único del usuario
- `OrgID` (number, requerido): ID del equipo al que se quiere unir

**Validaciones:**
- El usuario debe existir
- El equipo debe existir
- El equipo debe estar activo (`Activo: true`)
- Si el usuario ya está en el equipo, se devuelve un mensaje informativo sin error

**Comportamiento:**
- Agrega el `OrgID` al array `equiposIDs` del usuario (permite múltiples equipos)
- Incrementa el contador `AtletasActivos` del equipo
- Si el usuario ya está en el equipo, no hace cambios y devuelve un mensaje informativo
- Utiliza transacciones de base de datos para garantizar consistencia

**Respuesta Exitosa (200) - Usuario unido exitosamente:**
```json
{
  "message": "Usuario unido al equipo exitosamente",
  "status": "success",
  "usuario": {
    "RunnerUID": "Z2R807989IZU",
    "equiposIDs": [1, 4, 7],
    "name": "Juan Pérez"
  },
  "equipo": {
    "OrgID": 4,
    "NombreEquipo": "Equipo Corredores",
    "AtletasActivos": 15,
    "Ciudad": "Mérida",
    "Estado": "Yucatán",
    "Pais": "México",
    "Activo": true
  }
}
```

**Respuesta Exitosa (200) - Usuario ya está en el equipo:**
```json
{
  "message": "El usuario ya está en este equipo",
  "status": "success",
  "equipo": {
    "OrgID": 4,
    "NombreEquipo": "Equipo Corredores",
    "AtletasActivos": 15
  },
  "equiposIDs": [1, 4, 7]
}
```

**Errores:**

- `404 Not Found`: Si el usuario no existe
  ```json
  {
    "statusCode": 404,
    "message": "Usuario con RunnerUID Z2R807989IZU no encontrado",
    "error": "Not Found"
  }
  ```

- `404 Not Found`: Si el equipo no existe
  ```json
  {
    "statusCode": 404,
    "message": "Equipo con ID 4 no encontrado",
    "error": "Not Found"
  }
  ```

- `409 Conflict`: Si el equipo no está activo
  ```json
  {
    "statusCode": 409,
    "message": "El equipo con ID 4 no está activo",
    "error": "Conflict"
  }
  ```

**Características:**
- ✅ Permite que un usuario esté en múltiples equipos simultáneamente
- ✅ Maneja el array `equiposIDs` como JSON
- ✅ Actualiza automáticamente el contador de atletas activos del equipo
- ✅ Usa transacciones para garantizar consistencia de datos
- ✅ No genera error si el usuario ya está en el equipo (idempotente)

**Ejemplos de Uso:**

1. **Unirse a un equipo:**
   ```bash
   curl -X POST https://zona2.mx/api/sec-users/join-a-team \
     -H "Content-Type: application/json" \
     -d '{
       "RunnerUID": "Z2R807989IZU",
       "OrgID": 4
     }'
   ```

2. **Unirse a múltiples equipos (llamadas separadas):**
   ```bash
   # Primera llamada
   POST /api/sec-users/join-a-team
   { "RunnerUID": "Z2R807989IZU", "OrgID": 1 }
   
   # Segunda llamada
   POST /api/sec-users/join-a-team
   { "RunnerUID": "Z2R807989IZU", "OrgID": 4 }
   
   # Resultado: usuario.equiposIDs = [1, 4]
   ```

3. **Ejemplo con JavaScript/Fetch:**
   ```javascript
   const joinTeam = async (runnerUID, orgID) => {
     const response = await fetch('https://zona2.mx/api/sec-users/join-a-team', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         RunnerUID: runnerUID,
         OrgID: orgID
       })
     });
     
     const data = await response.json();
     return data;
   };
   ```

**Nota:** Este endpoint maneja el sistema nuevo donde los usuarios pueden estar en múltiples equipos simultáneamente (`equiposIDs` como array JSON). Cada vez que un usuario se une a un equipo, se agrega el `OrgID` al array y se incrementa el contador del equipo.

**Base URL:**
- **Desarrollo:** `http://localhost:4000/api`
- **Producción:** `https://zona2.mx/api`

---

**Última actualización:** Diciembre 2024

