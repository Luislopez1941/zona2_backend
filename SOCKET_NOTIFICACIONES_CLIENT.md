# Socket.IO Client - Solo Recibir Notificaciones

Este gateway está diseñado **solo para recibir notificaciones** en tiempo real. No necesitas enviar mensajes, solo conectarte y escuchar.

## Instalación

En tu proyecto frontend, instala `socket.io-client`:

```bash
npm install socket.io-client
# o
yarn add socket.io-client
```

## Uso Básico - Solo Recibir

### 1. Importar y conectar

```typescript
import { io } from 'socket.io-client';

// IMPORTANTE: La URL debe ser la base del servidor, el namespace se agrega automáticamente
// Para producción: 'https://zona2.mx' (sin /notificaciones en la URL base)
// Para desarrollo: 'http://localhost:4000' (sin /notificaciones en la URL base)

const socket = io('https://zona2.mx/notificaciones', {
  // O para desarrollo: io('http://localhost:4000/notificaciones', {
  query: {
    runnerUID: 'TU_RUNNER_UID_AQUI' // El RunnerUID del usuario autenticado
  },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  path: '/socket.io/', // Ruta por defecto de Socket.IO
  forceNew: false,
});
```

### 2. Escuchar notificaciones (solo recibir)

```typescript
// Escuchar cuando se conecta
socket.on('connect', () => {
  console.log('Conectado al servidor de notificaciones');
});

// Escuchar confirmación de conexión
socket.on('connected', (data) => {
  console.log('Confirmación:', data);
  // data = { message: 'Conectado al servidor de notificaciones', runnerUID: '...' }
});

// ⭐ ESCUCHAR NUEVAS NOTIFICACIONES (esto es lo importante)
socket.on('notification', (notification) => {
  console.log('Nueva notificación recibida:', notification);
  // notification = {
  //   id: number,
  //   toRunnerUID: string,
  //   fromRunnerUID: string,
  //   tipo: string,
  //   mensaje: string | null,
  //   leida: boolean,
  //   fecha: Date
  // }
  
  // Aquí puedes actualizar tu UI, mostrar un toast, etc.
  mostrarNotificacion(notification);
});

// Escuchar cuando se desconecta
socket.on('disconnect', (reason) => {
  console.log('Desconectado:', reason);
});

// Escuchar errores
socket.on('connect_error', (error) => {
  console.error('Error de conexión:', error);
});
```

### 3. Desconectar manualmente

```typescript
// Desconectar cuando el usuario cierra sesión o sale de la app
socket.disconnect();
```

## Notas Importantes

1. **RunnerUID es requerido**: Debes enviar el `runnerUID` en el query al conectar
2. **Namespace**: El gateway está en el namespace `/notificaciones`
3. **Solo recibir**: Este gateway solo recibe notificaciones, no envía mensajes

## Estructura de Notificación

```typescript
{
  id: number;              // ID de la notificación
  toRunnerUID: string;     // RunnerUID del destinatario
  fromRunnerUID: string;   // RunnerUID del remitente
  tipo: string;            // Tipo de notificación (ej: 'follow', 'like', 'comment')
  mensaje: string | null;  // Mensaje opcional
  leida: boolean;          // Si está leída o no
  fecha: Date;             // Fecha de creación
}
```

