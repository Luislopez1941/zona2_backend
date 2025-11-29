-- CreateTable
CREATE TABLE `actividades` (
    `actID` INTEGER NOT NULL AUTO_INCREMENT,
    `RunnerUID` VARCHAR(36) NOT NULL,
    `plataforma` CHAR(1) NOT NULL,
    `titulo` VARCHAR(150) NOT NULL,
    `fechaActividad` DATETIME(0) NOT NULL,
    `DistanciaKM` DECIMAL(6, 2) NOT NULL,
    `RitmoMinKm` VARCHAR(10) NOT NULL,
    `Duracion` VARCHAR(10) NOT NULL,
    `Public` BOOLEAN NOT NULL DEFAULT false,
    `Origen` VARCHAR(20) NOT NULL,
    `Ciudad` VARCHAR(20) NOT NULL,
    `Pais` VARCHAR(20) NOT NULL,
    `enlace` VARCHAR(255) NOT NULL,
    `fecha_inicio` DATETIME(0) NULL,
    `fecha_fin` DATETIME(0) NULL,
    `duracion_segundos` INTEGER NULL,
    `duracion_formateada` VARCHAR(10) NULL,
    `distancia` DECIMAL(6, 2) NULL,
    `ritmo` VARCHAR(10) NULL,
    `frecuencia_promedio` INTEGER NULL,
    `frecuencia_maxima` INTEGER NULL,
    `cadencia` INTEGER NULL,
    `calorias` INTEGER NULL,
    `zona_activa` INTEGER NULL,
    `tipo_actividad` VARCHAR(20) NULL,
    `fecha_registro` DATETIME(0) NULL,

    PRIMARY KEY (`actID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `toRunnerUID` CHAR(36) NOT NULL,
    `fromRunnerUID` CHAR(36) NOT NULL,
    `tipo` VARCHAR(50) NOT NULL,
    `mensaje` VARCHAR(255) NULL,
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notificaciones_toRunnerUID_idx`(`toRunnerUID`),
    INDEX `notificaciones_fromRunnerUID_idx`(`fromRunnerUID`),
    UNIQUE INDEX `notificaciones_toRunnerUID_fromRunnerUID_tipo_key`(`toRunnerUID`, `fromRunnerUID`, `tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sec_users` (
    `RunnerUID` CHAR(36) NOT NULL,
    `RunnerUIDRef` CHAR(36) NULL,
    `AliasRunner` VARCHAR(50) NULL,
    `DisciplinaPrincipal` CHAR(1) NULL,
    `name` VARCHAR(255) NOT NULL,
    `login` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(65) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `pswd` VARCHAR(255) NOT NULL,
    `RFC` VARCHAR(13) NULL,
    `TipoMembresia` CHAR(1) NULL,
    `FechaUltimaActividad` DATETIME(0) NULL,
    `FechaRegistro` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `FechaActualizacion` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `InvitacionesTotales` INTEGER NULL DEFAULT 0,
    `SuscripcionMXN` DECIMAL(10, 2) NULL,
    `WalletPuntos` INTEGER NULL,
    `WalletPuntosI` INTEGER NULL,
    `WalletSaldoMXN` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `GananciasAcumuladasMXN` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `InvitacionesMensuales` INTEGER NULL DEFAULT 0,
    `PorcentajeCumplimiento` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `NivelRunner` CHAR(1) NULL,
    `FechaRenovacionMembresia` DATE NULL,
    `CFDIEmitido` BOOLEAN NULL DEFAULT false,
    `StravaAthleteID` BIGINT NULL,
    `GarminUserID` VARCHAR(64) NULL,
    `Z2TotalHistorico` BIGINT NULL DEFAULT 0,
    `Z2Recibidas30d` INTEGER NULL DEFAULT 0,
    `Z2Otorgadas30d` INTEGER NULL DEFAULT 0,
    `Actividades30d` INTEGER NULL DEFAULT 0,
    `NivelMensual` VARCHAR(10) NULL,
    `FechaUltimaZ2` DATETIME(0) NULL,
    `fechaNacimiento` DATE NULL,
    `Genero` CHAR(1) NULL,
    `Peso` CHAR(2) NULL,
    `Estatura` CHAR(3) NULL,
    `Ciudad` VARCHAR(50) NULL,
    `Estado` VARCHAR(50) NULL,
    `Pais` VARCHAR(50) NULL,
    `EmergenciaContacto` VARCHAR(255) NULL,
    `EmergenciaCelular` CHAR(64) NULL,
    `EmergenciaParentesco` CHAR(64) NULL,
    `equipoID` VARCHAR(36) NULL,
    `active` VARCHAR(1) NULL,
    `activation_code` VARCHAR(32) NULL,
    `priv_admin` VARCHAR(1) NULL,
    `mfa` VARCHAR(255) NULL,
    `picture` MEDIUMBLOB NULL,
    `role` VARCHAR(128) NULL,
    `pswd_last_updated` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `mfa_last_updated` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`login`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `followers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `follower_runnerUID` CHAR(36) NOT NULL,
    `followed_runnerUID` CHAR(36) NOT NULL,

    UNIQUE INDEX `followers_follower_runnerUID_followed_runnerUID_key`(`follower_runnerUID`, `followed_runnerUID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zonas` (
    `zonaID` INTEGER NOT NULL AUTO_INCREMENT,
    `RunnerUID` VARCHAR(36) NOT NULL,
    `RunnerUIDRef` VARCHAR(36) NULL,
    `puntos` INTEGER NOT NULL,
    `motivo` CHAR(2) NOT NULL,
    `origen` CHAR(2) NOT NULL,
    `fecha` DATETIME(0) NOT NULL,

    PRIMARY KEY (`zonaID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `establecimientos` (
    `OrgID` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `NombreComercial` VARCHAR(255) NOT NULL,
    `Giro` VARCHAR(150) NULL,
    `Descripcion` VARCHAR(255) NULL,
    `Ciudad` VARCHAR(100) NULL,
    `Estado` VARCHAR(100) NULL,
    `Pais` VARCHAR(100) NULL DEFAULT 'México',
    `Direccion` VARCHAR(255) NULL,
    `Latitud` DECIMAL(10, 7) NULL,
    `Longitud` DECIMAL(10, 7) NULL,
    `UrlSitio` VARCHAR(500) NULL,
    `UrlLogo` VARCHAR(500) NULL,
    `AceptaPuntosZ2` BOOLEAN NOT NULL DEFAULT true,
    `MaxPuntosZ2` INTEGER UNSIGNED NULL,
    `MaxDescuentoZ2` INTEGER UNSIGNED NULL,
    `PuntosEquivalencia` INTEGER UNSIGNED NULL,
    `EquivalenciaDescuentoImporte` DECIMAL(10, 2) NULL,
    `Estatus` ENUM('pendiente', 'activo', 'suspendido', 'baja') NOT NULL DEFAULT 'pendiente',
    `FechaAlta` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `FechaActualiza` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`OrgID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eventos` (
    `EventoID` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `OrgID` INTEGER UNSIGNED NOT NULL,
    `Titulo` VARCHAR(255) NOT NULL,
    `Subtitulo` MEDIUMTEXT NULL,
    `TipoEvento` LONGTEXT NULL DEFAULT 'Carrera',
    `Distancias` LONGTEXT NULL,
    `Categorias` LONGTEXT NULL,
    `FechaEvento` DATE NOT NULL,
    `HoraEvento` TIME(0) NOT NULL,
    `Ciudad` VARCHAR(100) NULL,
    `Estado` VARCHAR(100) NULL,
    `Pais` VARCHAR(100) NULL,
    `Lugar` VARCHAR(255) NULL,
    `UrlMapa` VARCHAR(500) NULL,
    `UrlCalendario` VARCHAR(500) NULL,
    `imagen` MEDIUMBLOB NULL,
    `UrlImagen` VARCHAR(500) NULL,
    `UrlRegistro` VARCHAR(500) NULL,
    `UrlPagoDirecto` VARCHAR(500) NULL,
    `MaxPuntosZ2` INTEGER UNSIGNED NULL,
    `MaxDescuentoZ2` INTEGER UNSIGNED NULL,
    `PuntosEquivalencia` INTEGER UNSIGNED NULL,
    `DescuentoImporte` DECIMAL(10, 2) NULL,
    `editCartaExoneracion` LONGTEXT NULL,
    `UrlCartaExoneracion` VARCHAR(255) NULL,
    `editGuiaExpectador` LONGTEXT NULL,
    `GuiaExpectador` VARCHAR(255) NULL,
    `PrecioEvento` DECIMAL(10, 2) NULL,
    `Moneda` CHAR(3) NULL DEFAULT 'MXN',
    `FechaAlta` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `Estatus` VARCHAR(20) NOT NULL,
    `FechaActualiza` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`EventoID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organizadores` (
    `OrgID` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `RunnerUID` VARCHAR(36) NULL,
    `NombreComercial` VARCHAR(255) NOT NULL,
    `RazonSocial` VARCHAR(255) NULL,
    `RFC` VARCHAR(13) NULL,
    `ContactoNombre` VARCHAR(150) NULL,
    `ContactoEmail` VARCHAR(150) NULL,
    `ContactoTelefono` VARCHAR(50) NULL,
    `Ciudad` VARCHAR(100) NULL,
    `Estado` VARCHAR(100) NULL,
    `Pais` VARCHAR(100) NULL DEFAULT 'México',
    `UrlSitio` VARCHAR(500) NULL,
    `UrlLogo` MEDIUMBLOB NULL,
    `StripeAccountID` VARCHAR(255) NULL,
    `enlaceStripe` VARCHAR(255) NULL,
    `enlacePayPal` VARCHAR(255) NULL,
    `enlaceMercadodePago` VARCHAR(255) NULL,
    `enlaceConekta` VARCHAR(255) NULL,
    `enlaceClip` VARCHAR(255) NULL,
    `enlace_OpenpayBBVA` VARCHAR(255) NULL,
    `enlace_PayU` VARCHAR(255) NULL,
    `enlace_Dashport` VARCHAR(255) NULL,
    `AceptaPuntosZ2` BOOLEAN NOT NULL DEFAULT true,
    `MaxPuntosZ2` INTEGER UNSIGNED NULL,
    `MaxDescuentoZ2` INTEGER UNSIGNED NULL,
    `PuntosEquivalencia` INTEGER UNSIGNED NULL,
    `DescuentoImporte` DECIMAL(10, 2) NULL,
    `Estatus` ENUM('pendiente', 'activo', 'suspendido', 'baja') NOT NULL DEFAULT 'pendiente',
    `FechaAlta` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `FechaActualiza` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`OrgID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sec_settings` (
    `set_name` VARCHAR(255) NOT NULL,
    `set_value` VARCHAR(255) NULL,

    PRIMARY KEY (`set_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `SubscriptionUID` CHAR(36) NOT NULL,
    `RunnerUID` CHAR(36) NOT NULL,
    `PlanCode` ENUM('Runner', 'Pacer', 'Visitante', 'Organizador') NOT NULL,
    `PlanVersion` INTEGER NULL DEFAULT 1,
    `BillingCycle` ENUM('Monthly', 'Quarterly', 'Yearly') NOT NULL DEFAULT 'Yearly',
    `Status` ENUM('Pending', 'Active', 'PastDue', 'Canceled', 'Expired', 'Trial') NOT NULL DEFAULT 'Pending',
    `AutoRenew` BOOLEAN NOT NULL DEFAULT true,
    `StartAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `EndAt` TIMESTAMP(0) NULL,
    `NextChargeAt` TIMESTAMP(0) NULL,
    `LastChargeAt` TIMESTAMP(0) NULL,
    `CanceledAt` TIMESTAMP(0) NULL,
    `CancelReason` VARCHAR(100) NULL,
    `Currency` CHAR(3) NOT NULL DEFAULT 'MXN',
    `PriceMXN` DECIMAL(10, 2) NOT NULL DEFAULT 200.00,
    `DiscountMXN` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `TaxMXN` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `LastTotalChargedMXN` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `PaymentMethod` ENUM('Card', 'Bank', 'Transfer', 'Wallet', 'Cash', 'Other') NULL,
    `PaymentProvider` ENUM('Stripe', 'Conekta', 'OpenPay', 'PayPal', 'Bank', 'Internal', 'Other') NULL,
    `PaymentTxnID` VARCHAR(64) NULL,
    `CFDIUUID` VARCHAR(36) NULL,
    `CFDISerie` VARCHAR(10) NULL,
    `CFDIFolio` VARCHAR(20) NULL,
    `Notes` VARCHAR(255) NULL,
    `CreatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `UpdatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `FK_subscriptions_runner`(`RunnerUID`),
    PRIMARY KEY (`SubscriptionUID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias` (
    `CategoriaID` INTEGER NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(150) NOT NULL,

    PRIMARY KEY (`CategoriaID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ciudades_mexico` (
    `CiudadID` INTEGER NOT NULL AUTO_INCREMENT,
    `Estado` VARCHAR(100) NOT NULL,
    `Ciudad` VARCHAR(150) NOT NULL,

    PRIMARY KEY (`CiudadID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `disciplinas` (
    `DisciplinaID` INTEGER NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(200) NOT NULL,

    PRIMARY KEY (`DisciplinaID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `distancias` (
    `DistanciaID` INTEGER NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(200) NOT NULL,

    PRIMARY KEY (`DistanciaID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipos` (
    `OrgID` INTEGER NOT NULL AUTO_INCREMENT,
    `RunnerUID` CHAR(36) NULL,
    `Logo` MEDIUMBLOB NULL,
    `Contacto` VARCHAR(100) NULL,
    `Celular` VARCHAR(36) NULL,
    `Correo` VARCHAR(255) NULL,
    `NombreEquipo` VARCHAR(100) NULL,
    `AliasEquipo` VARCHAR(30) NULL,
    `RFC` VARCHAR(20) NULL,
    `Descripcion` VARCHAR(255) NULL,
    `Ciudad` VARCHAR(100) NULL,
    `Estado` VARCHAR(100) NULL,
    `Pais` VARCHAR(100) NULL DEFAULT 'México',
    `LugarEntrenamiento` VARCHAR(255) NULL,
    `Disciplinas` LONGTEXT NULL,
    `HorarioEntrenamiento` TIME(0) NULL,
    `AtletasActivos` INTEGER NULL DEFAULT 0,
    `EntrenadoresTotales` INTEGER NULL DEFAULT 0,
    `ProgramasDisponibles` ENUM('Manual', 'Digital', 'Ambos') NULL DEFAULT 'Digital',
    `EntrenadoresEspecialidad` VARCHAR(255) NULL,
    `NivelEquipo` ENUM('Recreativo', 'Intermedio', 'Competitivo', 'Elite') NULL DEFAULT 'Intermedio',
    `Certificacion` ENUM('Verificado', 'Afiliado', 'Independiente') NULL DEFAULT 'Independiente',
    `IntegracionZona2` BOOLEAN NULL DEFAULT false,
    `CostoMensual` DECIMAL(10, 2) NULL,
    `ContactoWhatsApp` VARCHAR(20) NULL,
    `RedSocial` VARCHAR(255) NULL,
    `Activo` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`OrgID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estados_mexico` (
    `EstadoID` INTEGER NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`EstadoID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inscripciones` (
    `InscripcionID` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `EventoID` INTEGER UNSIGNED NOT NULL,
    `OrgID` INTEGER UNSIGNED NOT NULL,
    `FechaEvento` DATE NOT NULL,
    `RunnerUID` CHAR(36) NOT NULL,
    `RunnerNombre` VARCHAR(150) NULL,
    `RunnerEmail` VARCHAR(150) NULL,
    `RunnerTelefono` VARCHAR(50) NULL,
    `Genero` CHAR(1) NULL,
    `FechaNacimiento` DATE NULL,
    `TallaPlayera` ENUM('ExtraChica', 'Chica', 'Mediana', 'Grande', 'ExtraGrande') NULL,
    `EquipoID` CHAR(36) NULL,
    `DistanciaElegida` VARCHAR(50) NOT NULL,
    `CategoriaElegida` VARCHAR(100) NULL,
    `Disciplina` VARCHAR(50) NULL DEFAULT 'Carrera',
    `PrecioOriginal` DECIMAL(10, 2) NOT NULL,
    `PuntosUsados` INTEGER UNSIGNED NULL DEFAULT 0,
    `DescuentoAplicadoMXN` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `PrecioFinal` DECIMAL(10, 2) NOT NULL,
    `Moneda` CHAR(3) NULL DEFAULT 'MXN',
    `MetodoPago` VARCHAR(50) NULL,
    `PagoTransaccionID` VARCHAR(150) NULL,
    `PagoEstado` ENUM('Pendiente', 'Pagado', 'Fallido', 'Cancelado', 'Reembolsado') NULL DEFAULT 'Pendiente',
    `PagoComision` DECIMAL(10, 2) NULL,
    `PagoReciboURL` VARCHAR(300) NULL,
    `ContactoEmergencia` VARCHAR(150) NULL,
    `TelefonoEmergencia` VARCHAR(50) NULL,
    `Ciudad` VARCHAR(100) NULL,
    `Estado` VARCHAR(100) NULL,
    `Pais` VARCHAR(100) NULL,
    `EstatusInscripcion` ENUM('Inscrito', 'Pagado', 'Confirmado', 'Cancelado', 'NoPresentado') NULL DEFAULT 'Inscrito',
    `bibNumber` CHAR(10) NULL,
    `IPRegistro` VARCHAR(50) NULL,
    `UserAgent` VARCHAR(255) NULL,
    `FechaInscripcion` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `FechaActualizacion` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`InscripcionID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paises` (
    `PaisID` INTEGER NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(150) NOT NULL,

    PRIMARY KEY (`PaisID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tokens_sms` (
    `TokenID` INTEGER NOT NULL AUTO_INCREMENT,
    `Telefono` VARCHAR(20) NOT NULL,
    `Codigo` VARCHAR(6) NOT NULL,
    `FechaCreacion` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `FechaExpiracion` DATETIME(0) NOT NULL,
    `Estado` ENUM('activo', 'usado', 'expirado', 'bloqueado') NOT NULL DEFAULT 'activo',
    `IP` VARCHAR(45) NULL,
    `Intentos` INTEGER NULL DEFAULT 0,

    INDEX `idx_codigo`(`Codigo`),
    INDEX `idx_telefono`(`Telefono`),
    PRIMARY KEY (`TokenID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promociones` (
    `PromoID` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `OrgID` INTEGER UNSIGNED NOT NULL,
    `Titulo` VARCHAR(255) NOT NULL,
    `Subtitulo` MEDIUMTEXT NOT NULL,
    `Imagen` MEDIUMBLOB NULL,
    `Precio` DECIMAL(10, 2) NOT NULL,
    `Moneda` CHAR(3) NOT NULL DEFAULT 'MXN',
    `MaxPuntosZ2` INTEGER UNSIGNED NOT NULL,
    `DescuentoImporte` DECIMAL(10, 2) NOT NULL,
    `TipoPromo` ENUM('DescuentoZ2', 'ProductoGratis', 'DescuentoMixto') NOT NULL DEFAULT 'DescuentoZ2',
    `QRUnico` VARCHAR(255) NULL,
    `FechaInicio` DATE NOT NULL,
    `FechaFin` DATE NOT NULL,
    `Estatus` ENUM('Activa', 'Inactiva', 'Suspendida') NOT NULL DEFAULT 'Activa',

    PRIMARY KEY (`PromoID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `actividad_ruta` (
    `ruta_id` INTEGER NOT NULL AUTO_INCREMENT,
    `actividad_id` INTEGER NOT NULL,
    `punto_numero` INTEGER NULL,
    `latitud` DECIMAL(10, 6) NULL,
    `longitud` DECIMAL(10, 6) NULL,

    INDEX `actividad_id`(`actividad_id`),
    PRIMARY KEY (`ruta_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `actividad_ubicacion` (
    `ubicacion_id` INTEGER NOT NULL AUTO_INCREMENT,
    `actividad_id` INTEGER NOT NULL,
    `ciudad` VARCHAR(100) NULL,
    `inicio_lat` DECIMAL(10, 6) NULL,
    `inicio_lon` DECIMAL(10, 6) NULL,
    `fin_lat` DECIMAL(10, 6) NULL,
    `fin_lon` DECIMAL(10, 6) NULL,

    INDEX `actividad_id`(`actividad_id`),
    PRIMARY KEY (`ubicacion_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `actividad_zonas` (
    `zona_id` INTEGER NOT NULL AUTO_INCREMENT,
    `actividad_id` INTEGER NOT NULL,
    `zona_numero` INTEGER NULL,
    `rango_texto` VARCHAR(20) NULL,
    `fue_activa` BOOLEAN NULL,

    INDEX `actividad_id`(`actividad_id`),
    PRIMARY KEY (`zona_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zonas_actividades` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `RunnerUID` VARCHAR(36) NOT NULL,
    `actID` INTEGER NOT NULL,
    `puntos` INTEGER NOT NULL DEFAULT 100,
    `fecha` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `zonas_actividades_RunnerUID_idx`(`RunnerUID`),
    INDEX `zonas_actividades_actID_idx`(`actID`),
    UNIQUE INDEX `zonas_actividades_RunnerUID_actID_key`(`RunnerUID`, `actID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pacers` (
    `PacerID` INTEGER NOT NULL AUTO_INCREMENT,
    `RunnerUID` CHAR(36) NOT NULL,
    `NombreCompleto` VARCHAR(255) NOT NULL,
    `AliasPacer` VARCHAR(100) NULL,
    `Biografia` TEXT NULL,
    `Idiomas` VARCHAR(255) NULL,
    `RitmoMin` VARCHAR(20) NULL,
    `DistanciasDominadas` VARCHAR(255) NULL,
    `Certificaciones` VARCHAR(255) NULL,
    `CiudadBase` VARCHAR(100) NULL,
    `EstadoBase` VARCHAR(100) NULL,
    `PaisBase` VARCHAR(100) NULL DEFAULT 'México',
    `DisponibilidadHoraria` VARCHAR(255) NULL,
    `PickUpHotel` BOOLEAN NULL DEFAULT false,
    `FotoPerfilURL` VARCHAR(500) NULL,
    `RedesSociales` VARCHAR(500) NULL,
    `CalificacionPromedio` DECIMAL(3, 2) NULL DEFAULT 0.00,
    `TotalReviews` INTEGER NULL DEFAULT 0,
    `TotalExperienciasRealizadas` INTEGER NULL DEFAULT 0,
    `Tarifabase` DECIMAL(10, 2) NULL,
    `PacerActivo` BOOLEAN NULL DEFAULT true,
    `FechaRegistro` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `FechaActualizacion` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`PacerID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rutas` (
    `RutaID` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `RunnerUID` CHAR(36) NOT NULL,
    `NombreRuta` VARCHAR(150) NOT NULL,
    `Descripcion` TEXT NULL,
    `Disciplina` VARCHAR(50) NULL DEFAULT 'Carrera',
    `DistanciaKM` VARCHAR(50) NOT NULL,
    `ElevacionM` INTEGER NULL DEFAULT 0,
    `Dificultad` ENUM('Fácil', 'Moderada', 'Difícil', 'Experto') NULL DEFAULT 'Fácil',
    `DuracionEstimadoMin` INTEGER NULL,
    `Ciudad` VARCHAR(50) NOT NULL,
    `Estado` VARCHAR(50) NULL,
    `Pais` VARCHAR(50) NULL,
    `GoogleMaps` VARCHAR(255) NULL,
    `GPXfile` VARCHAR(255) NULL,
    `Estatus` ENUM('Publica', 'Privada', 'Oculta') NULL DEFAULT 'Publica',
    `FechaCreacion` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `FechaActualizacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`RutaID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `actividad_ruta` ADD CONSTRAINT `actividad_ruta_ibfk_1` FOREIGN KEY (`actividad_id`) REFERENCES `actividades`(`actID`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `actividad_ubicacion` ADD CONSTRAINT `actividad_ubicacion_ibfk_1` FOREIGN KEY (`actividad_id`) REFERENCES `actividades`(`actID`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `actividad_zonas` ADD CONSTRAINT `actividad_zonas_ibfk_1` FOREIGN KEY (`actividad_id`) REFERENCES `actividades`(`actID`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `zonas_actividades` ADD CONSTRAINT `zonas_actividades_actID_fkey` FOREIGN KEY (`actID`) REFERENCES `actividades`(`actID`) ON DELETE CASCADE ON UPDATE RESTRICT;
