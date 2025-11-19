import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Cargar variables de entorno desde .env
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // MariaDB connection string format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
    url: process.env.DATABASE_URL || "mysql://root:zona123@localhost:3306/zona_2",
  },
});
