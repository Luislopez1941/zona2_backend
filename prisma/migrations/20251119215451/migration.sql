-- CreateTable
CREATE TABLE `actividades` (
    `actID` INTEGER NOT NULL AUTO_INCREMENT,
    `RunnerUID` VARCHAR(36) NOT NULL,
    `plataforma` CHAR(1) NOT NULL,
    `titulo` VARCHAR(150) NOT NULL,
    `fechaActividad` DATETIME NOT NULL,
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
    `FechaUltimaActividad` DATETIME NULL,
    `FechaRegistro` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `FechaActualizacion` TIMESTAMP(0) NOT NULL,
    `InvitacionesTotales` INTEGER NOT NULL DEFAULT 0,
    `SuscripcionMXN` DECIMAL(10, 2) NULL,
    `WalletPuntos` INTEGER NULL,
    `WalletPuntosI` INTEGER NULL,
    `WalletSaldoMXN` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `GananciasAcumuladasMXN` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `InvitacionesMensuales` INTEGER NOT NULL DEFAULT 0,
    `PorcentajeCumplimiento` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `NivelRunner` CHAR(1) NULL,
    `FechaRenovacionMembresia` DATE NULL,
    `CFDIEmitido` BOOLEAN NOT NULL DEFAULT false,
    `StravaAthleteID` BIGINT NULL,
    `GarminUserID` VARCHAR(64) NULL,
    `Z2TotalHistorico` BIGINT NOT NULL DEFAULT 0,
    `Z2Recibidas30d` INTEGER NOT NULL DEFAULT 0,
    `Z2Otorgadas30d` INTEGER NOT NULL DEFAULT 0,
    `Actividades30d` INTEGER NOT NULL DEFAULT 0,
    `NivelMensual` VARCHAR(10) NULL,
    `FechaUltimaZ2` DATETIME NULL,
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
    `active` CHAR(1) NULL,
    `activation_code` VARCHAR(32) NULL,
    `priv_admin` CHAR(1) NULL,
    `mfa` VARCHAR(255) NULL,
    `picture` BLOB NULL,
    `role` VARCHAR(128) NULL,
    `pswd_last_updated` TIMESTAMP(0) NULL,
    `mfa_last_updated` DATETIME NULL DEFAULT CURRENT_TIMESTAMP(3),

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
    `fecha` DATETIME NOT NULL,

    PRIMARY KEY (`zonaID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
