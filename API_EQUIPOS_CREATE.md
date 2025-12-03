# Documentación de API - Crear Equipo

## POST `/api/equipos/create`

Crea un nuevo equipo en el sistema.

**Endpoint:** `POST /api/equipos/create`

**Body (JSON):**
```json
{
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
  "HorarioEntrenamiento": "06:00:00",
  "NivelEquipo": "Intermedio",
  "Certificacion": "Independiente",
  "ProgramasDisponibles": "Digital",
  "CostoMensual": 500.00,
  "ContactoWhatsApp": "9991234567",
  "RedSocial": "https://facebook.com/corredoresmerida",
  "Activo": true
}
```

**Parámetros (todos opcionales excepto los marcados):**

### Información Básica
- `RunnerUID` (string, opcional): ID único del usuario que crea el equipo
- `NombreEquipo` (string, opcional): Nombre del equipo (máx. 100 caracteres)
- `AliasEquipo` (string, opcional): Alias o slug del equipo (máx. 30 caracteres)
- `Descripcion` (string, opcional): Descripción del equipo (máx. 255 caracteres)

### Ubicación
- `Ciudad` (string, opcional): Ciudad del equipo (máx. 100 caracteres)
- `Estado` (string, opcional): Estado del equipo (máx. 100 caracteres)
- `Pais` (string, opcional): País del equipo (default: "México", máx. 100 caracteres)

### Contacto
- `Contacto` (string, opcional): Nombre de la persona de contacto (máx. 100 caracteres)
- `Celular` (string, opcional): Número de celular (máx. 36 caracteres)
- `Correo` (string, opcional): Correo electrónico (máx. 255 caracteres)
- `ContactoWhatsApp` (string, opcional): Número de WhatsApp (máx. 20 caracteres)
- `RedSocial` (string, opcional): URL de red social (máx. 255 caracteres)

### Información del Equipo
- `LugarEntrenamiento` (string, opcional): Lugar donde se entrena (máx. 255 caracteres)
- `Disciplinas` (string, opcional): Disciplinas que practica el equipo (texto largo)
- `HorarioEntrenamiento` (string, opcional): Horario de entrenamiento en formato "HH:mm:ss" (ej: "06:00:00")
- `EntrenadoresEspecialidad` (string, opcional): Especialidad de los entrenadores (máx. 255 caracteres)

### Configuración
- `NivelEquipo` (enum, opcional): Nivel del equipo
  - Valores: `"Recreativo"`, `"Intermedio"`, `"Competitivo"`, `"Elite"`
  - Default: `"Intermedio"`
- `Certificacion` (enum, opcional): Tipo de certificación
  - Valores: `"Verificado"`, `"Afiliado"`, `"Independiente"`
  - Default: `"Independiente"`
- `ProgramasDisponibles` (enum, opcional): Tipo de programas
  - Valores: `"Manual"`, `"Digital"`, `"Ambos"`
  - Default: `"Digital"`
- `IntegracionZona2` (boolean, opcional): Si está integrado con Zona2 (default: `false`)
- `CostoMensual` (number, opcional): Costo mensual de membresía (decimal, máx. 10 dígitos, 2 decimales)
- `Activo` (boolean, opcional): Si el equipo está activo (default: `true`)

### Campos Automáticos (no se envían)
- `OrgID`: Se genera automáticamente (ID único del equipo)
- `AtletasActivos`: Se inicializa en 0 automáticamente
- `EntrenadoresTotales`: Se inicializa en 0 automáticamente
- `Logo`: Se puede agregar como Bytes (MEDIUMBLOB) si es necesario

**Respuesta Exitosa (200):**
```json
{
  "message": "Equipo creado exitosamente",
  "status": "success",
  "equipo": {
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
    "AtletasActivos": 0,
    "EntrenadoresTotales": 0,
    "NivelEquipo": "Intermedio",
    "Certificacion": "Independiente",
    "ProgramasDisponibles": "Digital",
    "IntegracionZona2": false,
    "CostoMensual": 500.00,
    "ContactoWhatsApp": "9991234567",
    "RedSocial": "https://facebook.com/corredoresmerida",
    "Activo": true
  }
}
```

**Ejemplo Mínimo (solo campos esenciales):**
```json
{
  "NombreEquipo": "Mi Equipo",
  "Ciudad": "Mérida",
  "Estado": "Yucatán"
}
```

**Ejemplos de Uso:**

1. **Crear equipo básico:**
   ```bash
   curl -X POST https://zona2.mx/api/equipos/create \
     -H "Content-Type: application/json" \
     -d '{
       "RunnerUID": "Z2R807989IZU",
       "NombreEquipo": "Corredores Mérida",
       "Ciudad": "Mérida",
       "Estado": "Yucatán",
       "Pais": "México"
     }'
   ```

2. **Crear equipo completo:**
   ```bash
   curl -X POST https://zona2.mx/api/equipos/create \
     -H "Content-Type: application/json" \
     -d '{
       "RunnerUID": "Z2R807989IZU",
       "NombreEquipo": "Elite Runners",
       "AliasEquipo": "elite-runners",
       "Descripcion": "Equipo de corredores de élite",
       "Ciudad": "Cancún",
       "Estado": "Quintana Roo",
       "Pais": "México",
       "Contacto": "María González",
       "Celular": "9987654321",
       "Correo": "contacto@eliterunners.com",
       "LugarEntrenamiento": "Playa Delfines",
       "Disciplinas": "Maratón, Medio Maratón",
       "HorarioEntrenamiento": "06:00:00",
       "NivelEquipo": "Elite",
       "Certificacion": "Verificado",
       "ProgramasDisponibles": "Ambos",
       "CostoMensual": 800.00,
       "ContactoWhatsApp": "9987654321",
       "RedSocial": "https://instagram.com/eliterunners",
       "Activo": true
     }'
   ```

3. **Ejemplo con JavaScript/Fetch:**
   ```javascript
   const createEquipo = async (equipoData) => {
     const response = await fetch('https://zona2.mx/api/equipos/create', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(equipoData)
     });
     
     const data = await response.json();
     return data;
   };

   // Uso
   const nuevoEquipo = await createEquipo({
     NombreEquipo: "Corredores Mérida",
     Ciudad: "Mérida",
     Estado: "Yucatán"
   });
   ```

**Notas:**
- Todos los campos son opcionales, pero se recomienda incluir al menos `NombreEquipo` y la ubicación (`Ciudad`, `Estado`, `Pais`)
- El campo `OrgID` se genera automáticamente y es único
- Los campos `AtletasActivos` y `EntrenadoresTotales` se inicializan en 0
- El campo `Activo` por defecto es `true`
- El campo `Pais` por defecto es "México"
- El campo `HorarioEntrenamiento` debe enviarse como string en formato "HH:mm:ss"

**Base URL:**
- **Desarrollo:** `http://localhost:4000/api`
- **Producción:** `https://zona2.mx/api`

---

**Última actualización:** Diciembre 2024

