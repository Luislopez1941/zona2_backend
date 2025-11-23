-- Actualizar el enum Estatus en la tabla organizadores para que coincida con el schema de Prisma
-- Cambiar 'pendiente' a 'pendientez' en el enum
ALTER TABLE `organizadores` MODIFY COLUMN `Estatus` ENUM('pendientez', 'activo', 'suspendido', 'baja') NOT NULL DEFAULT 'pendientez';

