# Socket.IO Client - Notificaciones en Tiempo Real

## Instalación

En tu proyecto frontend, instala `socket.io-client`:

```bash
npm install socket.io-client
# o
yarn add socket.io-client
```

## Implementación Completa

### 1. Crear un Hook/Service para Notificaciones

```typescript
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  id: number;
  toRunnerUID: string;
  fromRunnerUID: string;
  tipo: string;
  mensaje: string | null;
  leida: boolean;
  fecha: Date;
  fromUser?: {
    RunnerUID: string;
    name: string;
    AliasRunner: string | null;
    picture: Buffer | null;
    Ciudad: string | null;
    Estado: string | null;
    Pais: string | null;
    TipoMembresia: string | null;
  } | null;
}

interface UseNotificationsReturn {
  socket: Socket | null;
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNotifications(runnerUID: string | null): UseNotificationsReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!runnerUID) return;

    // URL del servidor (ajusta según tu entorno)
    const serverUrl = process.env.NODE_ENV === 'production' 
      ? 'https://zona2.mx' 
      : 'http://localhost:4000';

    // Conectar al servidor de notificaciones
    // La URL debe incluir el namespace completo: /api/notificaciones
    const newSocket = io(`${serverUrl}/api/notificaciones`, {
      query: {
        runnerUID: runnerUID,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Evento: Conectado
    newSocket.on('connect', () => {
      console.log('✅ Conectado al servidor de notificaciones');
      setIsConnected(true);
    });

    // Evento: Confirmación de conexión
    newSocket.on('connected', (data) => {
      console.log('✅ Confirmación:', data);
    });

    // Evento: Recibir notificaciones (tanto al conectar como nuevas)
    newSocket.on('notification', (notification: Notification) => {
      console.log('📬 Nueva notificación recibida:', notification);
      
      // Agregar la notificación al estado (evitar duplicados)
      setNotifications((prev) => {
        // Verificar si ya existe
        const exists = prev.find((n) => n.id === notification.id);
        if (exists) {
          return prev; // No agregar duplicados
        }
        // Agregar al inicio del array
        return [notification, ...prev];
      });
    });

    // Evento: Desconectado
    newSocket.on('disconnect', (reason) => {
      console.log('❌ Desconectado:', reason);
      setIsConnected(false);
    });

    // Evento: Error de conexión
    newSocket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup al desmontar
    return () => {
      newSocket.close();
    };
  }, [runnerUID]);

  // Calcular notificaciones no leídas
  const unreadCount = notifications.filter((n) => !n.leida).length;

  // Marcar una notificación como leída
  const markAsRead = useCallback(async (id: number) => {
    try {
      const response = await fetch(
        `https://zona2.mx/api/notificaciones/mark-as-read/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        // Actualizar el estado local
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
        );
      }
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    if (!runnerUID) return;

    try {
      const response = await fetch(
        `https://zona2.mx/api/notificaciones/mark-all-as-read/${runnerUID}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        // Actualizar el estado local
        setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
      }
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  }, [runnerUID]);

  return {
    socket,
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
  };
}
```

### 2. Componente de Notificaciones

```typescript
import React from 'react';
import { useNotifications } from './hooks/useNotifications';

function NotificationsComponent() {
  // Obtener el RunnerUID del contexto/auth
  const runnerUID = 'Z2R123456ABC'; // Reemplazar con tu RunnerUID real

  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
  } = useNotifications(runnerUID);

  return (
    <div className="notifications-container">
      {/* Indicador de conexión */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
      </div>

      {/* Contador de no leídas */}
      <div className="notifications-header">
        <h2>Notificaciones</h2>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount} no leídas</span>
        )}
        {unreadCount > 0 && (
          <button onClick={markAllAsRead}>Marcar todas como leídas</button>
        )}
      </div>

      {/* Lista de notificaciones */}
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p>No hay notificaciones</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.leida ? 'unread' : ''}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="notification-header">
                <strong>{notification.tipo}</strong>
                {!notification.leida && <span className="dot">●</span>}
              </div>
              {notification.mensaje && (
                <p className="notification-message">{notification.mensaje}</p>
              )}
              {notification.fromUser && (
                <div className="notification-from">
                  De: {notification.fromUser.name || notification.fromUser.AliasRunner}
                </div>
              )}
              <div className="notification-date">
                {new Date(notification.fecha).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationsComponent;
```

### 3. Estilos CSS (Opcional)

```css
.notifications-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.connection-status {
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-weight: bold;
}

.connection-status.connected {
  background-color: #4caf50;
  color: white;
}

.connection-status.disconnected {
  background-color: #f44336;
  color: white;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.badge {
  background-color: #ff5722;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.notification-item:hover {
  background-color: #f5f5f5;
}

.notification-item.unread {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.dot {
  color: #2196f3;
  font-size: 12px;
}

.notification-message {
  margin: 8px 0;
  color: #666;
}

.notification-from {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.notification-date {
  font-size: 11px;
  color: #bbb;
  margin-top: 8px;
}
```

### 4. Uso en tu App Principal

```typescript
import React from 'react';
import { useNotifications } from './hooks/useNotifications';
import { useAuth } from './contexts/AuthContext'; // Tu contexto de autenticación

function App() {
  const { user } = useAuth(); // Obtener usuario autenticado
  const { unreadCount, isConnected } = useNotifications(user?.runnerUID);

  return (
    <div className="app">
      {/* Tu header con contador de notificaciones */}
      <header>
        <h1>Mi App</h1>
        {isConnected && unreadCount > 0 && (
          <div className="notification-bell">
            🔔 <span>{unreadCount}</span>
          </div>
        )}
      </header>

      {/* Resto de tu app */}
    </div>
  );
}
```

## Eventos que Recibirás

### Al Conectarse:
1. `connect` - Cuando se establece la conexión
2. `connected` - Confirmación del servidor con `{ message, runnerUID }`
3. `notification` - **Todas tus notificaciones no leídas** (una por una)

### En Tiempo Real:
- `notification` - Nuevas notificaciones cuando se crean

### Errores:
- `disconnect` - Cuando se pierde la conexión
- `connect_error` - Error al intentar conectar

## Estructura de Notificación

```typescript
{
  id: number;              // ID de la notificación
  toRunnerUID: string;     // RunnerUID del destinatario (tú)
  fromRunnerUID: string;   // RunnerUID del remitente
  tipo: string;            // Tipo: 'nuevo_referido', 'follow', 'like', etc.
  mensaje: string | null;  // Mensaje opcional
  leida: boolean;          // Si está leída o no
  fecha: Date;             // Fecha de creación
  fromUser: {              // Información del usuario que envió (opcional)
    RunnerUID: string;
    name: string;
    AliasRunner: string | null;
    picture: Buffer | null;
    Ciudad: string | null;
    Estado: string | null;
    Pais: string | null;
    TipoMembresia: string | null;
  } | null;
}
```

## URLs de Producción y Desarrollo

```typescript
// Desarrollo
const socket = io('http://localhost:4000/api/notificaciones', { ... });

// Producción
const socket = io('https://zona2.mx/api/notificaciones', { ... });
```

## Notas Importantes

1. **RunnerUID es requerido**: Debes enviar el `runnerUID` en el query al conectar
2. **Notificaciones al conectar**: Al conectarte, recibirás TODAS tus notificaciones no leídas automáticamente
3. **Tiempo real**: Las nuevas notificaciones se envían automáticamente cuando se crean
4. **Reconexión automática**: Socket.IO se reconecta automáticamente si se pierde la conexión
5. **Evitar duplicados**: El hook verifica si una notificación ya existe antes de agregarla

## Ejemplo Completo con TypeScript

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const useSocketNotifications = (runnerUID: string | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!runnerUID) return;

    const serverUrl = 'https://zona2.mx'; // O 'http://localhost:4000' para desarrollo
    
    const newSocket = io(`${serverUrl}/api/notificaciones`, {
      query: { runnerUID },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));
    
    newSocket.on('notification', (notification) => {
      setNotifications((prev) => {
        const exists = prev.find((n) => n.id === notification.id);
        return exists ? prev : [notification, ...prev];
      });
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, [runnerUID]);

  return { socket, notifications, isConnected };
};
```
