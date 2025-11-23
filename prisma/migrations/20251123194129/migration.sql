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
    `Origen` VARCHAR(20) NOT NULL,
    `Ciudad` VARCHAR(20) NOT NULL,
    `Pais` VARCHAR(20) NOT NULL,
    `enlace` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`actID`)
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
    `picture` BLOB NULL,
    `role` VARCHAR(128) NULL,
    `pswd_last_updated` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `mfa_last_updated` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`login`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zonas` (
    `zonaID` INTEGER NOT NULL AUTO_INCREMENT,
    `RunnerUID` VARCHAR(36) NOT NULL,
    `RunnerUIDRef` VARCHAR(36) NOT NULL,
    `puntos` INTEGER NOT NULL,
    `motivo` CHAR(2) NOT NULL,
    `origen` CHAR(2) NOT NULL,
    `fecha` DATETIME(0) NOT NULL,

    PRIMARY KEY (`zonaID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `establecimientos` (
    `EstablecimientoID` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
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
    `FechaAlta` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `FechaActualiza` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`EstablecimientoID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eventos` (
    `EventoID` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `OrgID` INTEGER UNSIGNED NOT NULL,
    `Titulo` VARCHAR(255) NOT NULL,
    `Subtitulo` VARCHAR(255) NULL,
    `TipoEvento` VARCHAR(50) NULL DEFAULT 'Carrera',
    `Distancias` VARCHAR(150) NULL,
    `FechaEvento` DATE NOT NULL,
    `HoraEvento` TIME(0) NOT NULL,
    `Ciudad` VARCHAR(100) NULL,
    `Estado` VARCHAR(100) NULL,
    `Lugar` VARCHAR(255) NULL,
    `UrlMapa` VARCHAR(500) NULL,
    `UrlCalendario` VARCHAR(500) NULL,
    `UrlImagen` VARCHAR(500) NULL,
    `UrlRegistro` VARCHAR(500) NULL,
    `UrlPagoDirecto` VARCHAR(500) NULL,
    `MaxPuntosZ2` INTEGER UNSIGNED NULL,
    `MaxDescuentoZ2` INTEGER UNSIGNED NULL,
    `PuntosEquivalencia` INTEGER UNSIGNED NULL,
    `DescuentoImporte` DECIMAL(10, 2) NULL,
    `UrlCartaExoneracion` VARCHAR(500) NULL,
    `GuiaExpectador` VARCHAR(500) NULL,
    `PrecioEvento` DECIMAL(10, 2) NULL,
    `Moneda` CHAR(3) NULL DEFAULT 'MXN',
    `Estatus` ENUM('borrador', 'publicado', 'cerrado', 'cancelado') NULL DEFAULT 'borrador',
    `FechaAlta` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
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
    `UrlLogo` BLOB NULL,
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
    `Estatus` ENUM('pendientez', 'activo', 'suspendido', 'baja') NOT NULL DEFAULT 'pendientez',
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
