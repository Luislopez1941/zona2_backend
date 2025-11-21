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
