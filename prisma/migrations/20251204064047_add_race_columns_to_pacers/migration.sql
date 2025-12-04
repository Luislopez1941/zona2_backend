-- AlterTable
ALTER TABLE `pacers` ADD COLUMN `Race1` VARCHAR(255) NULL,
    ADD COLUMN `Race2` VARCHAR(255) NULL,
    ADD COLUMN `Race3` VARCHAR(255) NULL,
    ADD COLUMN `Race4` VARCHAR(255) NULL,
    ADD COLUMN `Race5` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `blog` (
    `BlogID` INTEGER NOT NULL AUTO_INCREMENT,
    `Tipo` ENUM('Blog', 'Noticia') NOT NULL DEFAULT 'Blog',
    `Categoria` VARCHAR(150) NOT NULL,
    `Titulo` VARCHAR(255) NOT NULL,
    `Slug` VARCHAR(255) NOT NULL,
    `Resumen` TEXT NULL,
    `ContenidoHTML` LONGTEXT NULL,
    `ImagenPortada` VARCHAR(255) NULL,
    `AutorNombre` VARCHAR(150) NOT NULL,
    `AutorID` CHAR(36) NULL,
    `FechaPublicacion` DATETIME(0) NULL,
    `Estado` ENUM('Borrador', 'Publicado', 'Archivado') NOT NULL DEFAULT 'Borrador',
    `Vistas` INTEGER NULL DEFAULT 0,
    `Etiquetas` VARCHAR(255) NULL,
    `FechaCreacion` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `FechaActualizacion` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Slug`(`Slug`),
    PRIMARY KEY (`BlogID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `runner_photos` (
    `PhotoUID` INTEGER NOT NULL AUTO_INCREMENT,
    `RunnerUID` CHAR(36) NOT NULL,
    `EventUID` CHAR(36) NULL,
    `PhotoURL` VARCHAR(255) NOT NULL,
    `Description` VARCHAR(255) NULL,
    `Status` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    `Fecha` DATE NULL,

    PRIMARY KEY (`PhotoUID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
