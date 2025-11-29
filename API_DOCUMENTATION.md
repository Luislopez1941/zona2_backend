# 📚 Documentación API - Zona 2 Backend

Documentación completa de los endpoints disponibles para el frontend.

## 🌐 Base URL

```
http://localhost:4000/api
```

**Nota:** En producción, reemplazar `localhost:4000` con la URL del servidor.

---

## 🔐 Autenticación

La mayoría de los endpoints requieren autenticación mediante JWT. El token debe enviarse en el header:

```
Authorization: Bearer <token>
```

### Endpoints de Autenticación

#### 1. Validar Login (Verificar si el usuario existe)
```http
POST /api/auth/login-validation
```

**Body:**
```json
{
  "login": "9982355989",
  "phone": "9982355989"
}
```

**Response:**
```json
{
  "message": "Usuario encontrado",
  "status": "success",
  "exists": true,
  "requiresOtp": true
}
```

---

#### 2. Login con OTP
```http
POST /api/auth/login
```

**Body:**
```json
{
  "phone": "9982355989",
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "Login exitoso",
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "RunnerUID": "Z2R738268MVJ",
    "login": "9982355989",
    "name": "Luis",
    "email": "Luislopez@gmail.com"
  }
}
```

---

#### 3. Obtener Perfil del Usuario Autenticado
```http
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Usuario autenticado",
  "status": "success",
  "user": {
    "login": "9982355989",
    "name": "Luis",
    ...
  }
}
```

---

## 👤 Usuarios (sec-users)

### 1. Pre-Registro (Registro de Runner)
```http
POST /api/sec-users/pre-register
```

**Body:**
```json
{
  "name": "Luis",
  "login": "9982355989",
  "phone": "9982355989",
  "email": "luis@example.com",
  "RFC": "RFC123456789",
  "Ciudad": "Mérida",
  "Estado": "Yucatán",
  "Pais": "México",
  "RunnerUIDRef": "RR317DAO",
  "DisciplinaPrincipal": "R",
  "fechaNacimiento": "1990-01-01",
  "Genero": "M",
  "Peso": "70",
  "Estatura": "175",
  "EmergenciaContacto": "Juan Pérez",
  "EmergenciaCelular": "9991234567",
  "EmergenciaParentesco": "Hermano"
}
```

**Response:**
```json
{
  "message": "Usuario creado exitosamente",
  "status": "success",
  "user": {
    "RunnerUID": "Z2R738268MVJ",
    "TipoMembresia": "R",
    "WalletPuntosI": 10000,
    "WalletPuntos": 1000,
    ...
  }
}
```

**Notas:**
- Si se proporciona `RunnerUIDRef`, el nuevo usuario recibe 1000 puntos en `WalletPuntos` y el referidor recibe 500 puntos.
- `TipoMembresia` se establece automáticamente en `'R'` (Runner).
- `WalletPuntosI` se establece en 10000.

---

### 2. Actualizar a Pacer
```http
POST /api/sec-users/update-peacer
```

**Body:**
```json
{
  "RunnerUID": "Z2R738268MVJ",
  "FechaRenovacionMembresia": "2026-12-01"
}
```

**Response:**
```json
{
  "message": "Usuario actualizado a Pacer exitosamente",
  "status": "success",
  "user": {
    "RunnerUID": "Z2R738268MVJ",
    "TipoMembresia": "P",
    "FechaRenovacionMembresia": "2026-12-01"
  },
  "subscriptionUID": "uuid-de-suscripcion"
}
```

**Notas:**
- Solo usuarios con `TipoMembresia = 'R'` pueden convertirse en Pacer.
- Si no se proporciona `FechaRenovacionMembresia`, se establece automáticamente a 1 año desde hoy.

---

### 3. Registro de Organizador
```http
POST /api/sec-users/organizers-register
```

**Body:**
```json
{
  "nombreComercial": "Eventos Deportivos SA",
  "razonSocial": "Eventos Deportivos SA de CV",
  "nombreCompleto": "Juan Pérez",
  "celular": "9991234567",
  "correoElectronico": "juan@eventos.com",
  "RFC": "PERJ900101ABC",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Organizador creado exitosamente",
  "status": "success",
  "user": {
    "RunnerUID": "Z2R123456789",
    "TipoMembresia": "O",
    "WalletPuntosI": 10000,
    ...
  },
  "organizador": {
    "OrgID": 1,
    "NombreComercial": "Eventos Deportivos SA",
    ...
  }
}
```

**Notas:**
- `TipoMembresia` se establece en `'O'` (Organizador).
- `WalletPuntosI` se establece en 10000.
- `WalletPuntos`, `Z2TotalHistorico` y `Z2Recibidas30d` se establecen en `null`.

---

### 4. Registro de Establecimiento
```http
POST /api/sec-users/establishments-register
```

**Body:**
```json
{
  "nombreComercial": "Tienda Deportiva",
  "razonSocial": "Tienda Deportiva SA de CV",
  "nombreCompleto": "María García",
  "celular": "9997654321",
  "correoElectronico": "maria@tienda.com",
  "RFC": "GARM800201XYZ",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Establecimiento creado exitosamente",
  "status": "success",
  "user": {
    "RunnerUID": "Z2R987654321",
    "TipoMembresia": "S",
    "WalletPuntosI": 10000,
    ...
  },
  "establecimiento": {
    "EstablecimientoID": 1,
    "NombreComercial": "Tienda Deportiva",
    ...
  }
}
```

**Notas:**
- `TipoMembresia` se establece en `'S'` (Store/Establecimiento).
- `WalletPuntosI` se establece en 10000.
- `WalletPuntos`, `Z2TotalHistorico` y `Z2Recibidas30d` se establecen en `null`.

---

### 5. Obtener Usuario Actual
```http
GET /api/sec-users/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Usuario obtenido exitosamente",
  "status": "success",
  "user": {
    "RunnerUID": "Z2R738268MVJ",
    "AliasRunner": "R867883KCV",
    "name": "Luis",
    "email": "Luislopez@gmail.com",
    "TipoMembresia": "R",
    "WalletPuntos": null,
    "WalletPuntosI": 10000,
    "WalletSaldoMXN": 0,
    "Z2TotalHistorico": null,
    "Z2Recibidas30d": null,
    ...
  }
}
```

---

### 6. Actualizar Usuario
```http
PUT /api/sec-users/update/:RunnerUID
```

**Body:**
```json
{
  "name": "Luis López",
  "email": "nuevo@email.com",
  "Ciudad": "Cancún",
  "Estado": "Quintana Roo",
  "picture": "base64_encoded_image"
}
```

**Response:**
```json
{
  "message": "Usuario actualizado exitosamente",
  "status": "success",
  "user": {
    ...
  }
}
```

---

### 7. Recuperar Contraseña - Enviar Código
```http
POST /api/sec-users/send-recovery-code
```

**Body:**
```json
{
  "login": "9982355989",
  "phone": "9982355989"
}
```

**Response:**
```json
{
  "message": "Código de recuperación enviado",
  "status": "success",
  "codeSent": true
}
```

---

### 8. Verificar Código de Recuperación
```http
POST /api/sec-users/verify-recovery-code
```

**Body:**
```json
{
  "phone": "9982355989",
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "Código verificado exitosamente",
  "status": "success",
  "verified": true
}
```

---

### 9. Restablecer Contraseña
```http
POST /api/sec-users/reset-password
```

**Body:**
```json
{
  "login": "9982355989",
  "phone": "9982355989",
  "code": "123456",
  "password": "nuevaPassword123"
}
```

**Response:**
```json
{
  "message": "Contraseña restablecida exitosamente",
  "status": "success",
  "changed": true
}
```

---

## 🎉 Eventos

### 1. Obtener Todos los Eventos
```http
GET /api/eventos/get-all
```

**Response:**
```json
{
  "message": "Eventos obtenidos exitosamente",
  "status": "success",
  "total": 50,
  "eventos": [
    {
      "EventoID": 1,
      "Titulo": "Maratón de Mérida",
      "FechaEvento": "2025-12-15T06:00:00.000Z",
      "Ciudad": "Mérida",
      "Estado": "Yucatán",
      "Pais": "México",
      "Estatus": "Activo",
      ...
    }
  ]
}
```

---

### 2. Obtener Evento por ID
```http
GET /api/eventos/get-by-id/:id
```

**Response:**
```json
{
  "message": "Evento obtenido exitosamente",
  "status": "success",
  "evento": {
    "EventoID": 1,
    "Titulo": "Maratón de Mérida",
    ...
  }
}
```

---

### 3. Obtener Eventos por Estado
```http
GET /api/eventos/get-by-estado/:estado
```

**Ejemplo:**
```
GET /api/eventos/get-by-estado/Yucatán
```

---

### 4. Obtener Eventos por País
```http
GET /api/eventos/get-by-pais/:pais
```

**Ejemplo:**
```
GET /api/eventos/get-by-pais/México
```

---

### 5. Obtener Eventos por Ciudad
```http
GET /api/eventos/get-by-ciudad/:ciudad
```

**Ejemplo:**
```
GET /api/eventos/get-by-ciudad/Mérida
```

---

## 🎁 Promociones

### 1. Obtener Primeras 10 Promociones Activas
```http
GET /api/promociones
```

**Response:**
```json
{
  "message": "Promociones obtenidas exitosamente",
  "status": "success",
  "total": 10,
  "promociones": [
    {
      "PromoID": 1,
      "Titulo": "Descuento 50%",
      "Subtitulo": "En todos los productos",
      "Precio": 100.00,
      "Moneda": "MXN",
      "MaxPuntosZ2": 500,
      "DescuentoImporte": 50.00,
      "TipoPromo": "DescuentoZ2",
      "Estatus": "Activa",
      "FechaInicio": "2025-01-01",
      "FechaFin": "2025-12-31",
      "organizador": {
        "OrgID": 1,
        "NombreComercial": "Tienda Deportiva",
        ...
      }
    }
  ]
}
```

---

### 2. Obtener Todas las Promociones (con paginación opcional)
```http
GET /api/promociones/get-all
GET /api/promociones/get-all?page=1&limit=20
```

**Sin parámetros:** Retorna todas las promociones.

**Con parámetros:**
- `page`: Número de página (mayor a 0)
- `limit`: Resultados por página (máximo 100)

**Response:**
```json
{
  "message": "Promociones obtenidas exitosamente",
  "status": "success",
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3,
  "promociones": [...]
}
```

---

### 3. Obtener Promoción por ID
```http
GET /api/promociones/:id
```

**Ejemplo:**
```
GET /api/promociones/1
```

**Response:**
```json
{
  "message": "Promoción obtenida exitosamente",
  "status": "success",
  "promocione": {
    "PromoID": 1,
    "Titulo": "Descuento 50%",
    "organizador": {
      "OrgID": 1,
      "NombreComercial": "Tienda Deportiva",
      ...
    },
    ...
  }
}
```

---

## 🏙️ Ciudades de México

### Obtener Ciudades (con filtro opcional por estado)
```http
GET /api/ciudades-mexico/get-all
GET /api/ciudades-mexico/get-all?estado=Yucatán
```

**Response:**
```json
{
  "message": "Ciudades obtenidas exitosamente",
  "status": "success",
  "total": 150,
  "ciudades": [
    {
      "CiudadID": 1,
      "Estado": "Yucatán",
      "Ciudad": "Mérida"
    },
    {
      "CiudadID": 2,
      "Estado": "Yucatán",
      "Ciudad": "Cancún"
    }
  ]
}
```

---

## 🗺️ Estados de México

### Obtener Todos los Estados
```http
GET /api/estados-mexico/get-all
```

**Response:**
```json
{
  "message": "Estados obtenidos exitosamente",
  "status": "success",
  "total": 32,
  "estados": [
    {
      "EstadoID": 1,
      "Nombre": "Aguascalientes"
    },
    {
      "EstadoID": 2,
      "Nombre": "Baja California"
    }
  ]
}
```

---

## 🌍 Países

### Obtener Todos los Países
```http
GET /api/paises/get-all
```

**Response:**
```json
{
  "message": "Países obtenidos exitosamente",
  "status": "success",
  "total": 50,
  "paises": [
    {
      "PaisID": 1,
      "Nombre": "México"
    },
    {
      "PaisID": 2,
      "Nombre": "Estados Unidos"
    }
  ]
}
```

---

## ⚽ Equipos

### 1. Unirse a un Equipo
```http
POST /api/equipos/join-a-team
```

**Body:**
```json
{
  "RunnerUID": "Z2R738268MVJ",
  "OrgID": 1
}
```

**Response:**
```json
{
  "message": "Usuario unido al equipo exitosamente",
  "status": "success",
  "equipo": {
    "OrgID": 1,
    "NombreEquipo": "Equipo Ejemplo",
    "AtletasActivos": 5,
    "Activo": true,
    ...
  }
}
```

**Notas:**
- Si el usuario ya está en el equipo, retorna éxito sin cambios.
- Si el usuario está en otro equipo, permite el cambio.
- Incrementa `AtletasActivos` solo si el usuario no estaba en ningún equipo antes.

---

### 2. Obtener Todos los Equipos
```http
GET /api/equipos
```

**Response:**
```json
{
  "message": "Equipos obtenidos exitosamente",
  "status": "success",
  "total": 20,
  "equipos": [
    {
      "OrgID": 1,
      "NombreEquipo": "Equipo Ejemplo",
      "AtletasActivos": 5,
      "Activo": true,
      ...
    }
  ]
}
```

---

### 3. Obtener Equipo por ID
```http
GET /api/equipos/:id
```

---

## 📊 Tipos de Membresía

| Código | Descripción |
|--------|-------------|
| `R` | Runner (Corredor) |
| `P` | Pacer |
| `O` | Organizador |
| `S` | Store/Establecimiento |

---

## 📝 Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| `200` | OK - Solicitud exitosa |
| `201` | Created - Recurso creado exitosamente |
| `400` | Bad Request - Error en los datos enviados |
| `401` | Unauthorized - No autenticado |
| `403` | Forbidden - No autorizado |
| `404` | Not Found - Recurso no encontrado |
| `409` | Conflict - Conflicto (ej: usuario ya existe) |
| `500` | Internal Server Error - Error del servidor |

---

## 🔄 Formato de Respuesta Estándar

Todas las respuestas exitosas siguen este formato:

```json
{
  "message": "Mensaje descriptivo",
  "status": "success",
  "data": { ... }
}
```

Respuestas de error:

```json
{
  "message": "Mensaje de error",
  "status": "error",
  "error": "Detalles del error"
}
```

---

## 🛠️ Ejemplo de Uso con Fetch (JavaScript)

```javascript
// Login
const login = async (phone, code) => {
  const response = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: phone,
      code: code,
    }),
  });
  
  const data = await response.json();
  if (data.status === 'success') {
    localStorage.setItem('token', data.token);
  }
  return data;
};

// Obtener usuario actual
const getMe = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:4000/api/sec-users/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return await response.json();
};

// Obtener promociones
const getPromociones = async (page, limit) => {
  const url = limit 
    ? `http://localhost:4000/api/promociones/get-all?page=${page}&limit=${limit}`
    : 'http://localhost:4000/api/promociones/get-all';
    
  const response = await fetch(url);
  return await response.json();
};
```

---

## 📌 Notas Importantes

1. **Autenticación:** La mayoría de los endpoints requieren el token JWT en el header `Authorization: Bearer <token>`.

2. **CORS:** La API está configurada para aceptar peticiones desde cualquier origen.

3. **Validación:** Todos los datos enviados son validados automáticamente. Los errores de validación retornan código 400.

4. **Fechas:** Las fechas deben enviarse en formato ISO 8601: `YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss.sssZ`.

5. **Imágenes:** El campo `picture` debe enviarse como base64 o como Buffer según el caso.

6. **Paginación:** Los endpoints que soportan paginación retornan `total`, `page`, `limit` y `totalPages`.

---

## 🚀 Endpoints Adicionales

### Actividades
- `GET /api/actividades` - Obtener todas las actividades
- `POST /api/actividades` - Crear actividad

### Zonas
- `GET /api/zonas` - Obtener todas las zonas
- `POST /api/zonas` - Crear zona

### Establecimientos
- `GET /api/establecimientos` - Obtener todos los establecimientos
- `POST /api/establecimientos` - Crear establecimiento

---

**Última actualización:** Diciembre 2025

