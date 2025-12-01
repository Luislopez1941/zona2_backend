# Configuración de Socket.IO en el Servidor

## Problema
El error `404` al intentar conectarse al namespace `/notificaciones` indica que el servidor web (nginx/apache) no está pasando correctamente las conexiones WebSocket al backend.

## Solución: Configurar Proxy Reverso para WebSockets

### Para Nginx

Agrega esta configuración en tu archivo de configuración de nginx (generalmente en `/etc/nginx/sites-available/tu-sitio`):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name zona2.mx www.zona2.mx;

    # Redirección a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name zona2.mx www.zona2.mx;

    # Configuración SSL (ajusta según tu certificado)
    ssl_certificate /ruta/a/tu/certificado.crt;
    ssl_certificate_key /ruta/a/tu/private.key;

    # Configuración para Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Configuración para la API REST
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Configuración para Swagger (si lo necesitas)
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Para Apache

Si usas Apache, agrega esto en tu configuración:

```apache
<VirtualHost *:443>
    ServerName zona2.mx
    ServerAlias www.zona2.mx

    # Configuración SSL
    SSLEngine on
    SSLCertificateFile /ruta/a/tu/certificado.crt
    SSLCertificateKeyFile /ruta/a/tu/private.key

    # Habilitar módulos necesarios
    LoadModule proxy_module modules/mod_proxy.so
    LoadModule proxy_http_module modules/mod_proxy_http.so
    LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so

    # Configuración para Socket.IO
    ProxyPreserveHost On
    ProxyRequests Off

    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/socket.io/(.*) ws://localhost:4000/socket.io/$1 [P,L]

    # Configuración para la API REST
    ProxyPass /api/ http://localhost:4000/api/
    ProxyPassReverse /api/ http://localhost:4000/api/

    # Configuración para Socket.IO (fallback)
    ProxyPass /socket.io/ http://localhost:4000/socket.io/
    ProxyPassReverse /socket.io/ http://localhost:4000/socket.io/
</VirtualHost>
```

## Después de configurar

1. **Reinicia el servidor web:**
   ```bash
   # Para nginx
   sudo nginx -t  # Verificar configuración
   sudo systemctl restart nginx

   # Para apache
   sudo apache2ctl configtest  # Verificar configuración
   sudo systemctl restart apache2
   ```

2. **Verifica que el backend esté corriendo:**
   ```bash
   pm2 status
   # O
   ps aux | grep node
   ```

3. **Prueba la conexión:**
   - El frontend debería conectarse a: `https://zona2.mx/notificaciones`
   - Socket.IO automáticamente usará: `https://zona2.mx/socket.io/?EIO=4&transport=polling&ns=/notificaciones`

## Verificación

Puedes probar la conexión con curl:

```bash
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: test" \
  https://zona2.mx/socket.io/?EIO=4&transport=websocket&ns=/notificaciones
```

## Notas Importantes

1. **Puerto del backend**: Asegúrate de que el backend esté corriendo en el puerto 4000 (o el que configuraste en `process.env.PORT`)
2. **Firewall**: Asegúrate de que el puerto 4000 esté abierto solo para localhost (no expuesto públicamente)
3. **PM2**: Si usas PM2, verifica que esté corriendo: `pm2 status`
4. **Logs**: Revisa los logs del servidor web y del backend para diagnosticar problemas

