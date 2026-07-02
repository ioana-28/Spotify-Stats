import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // The "!" at the end tells strict TypeScript we guarantee this variable exists.
    // This instantly resolves the "string | undefined" error.
    url: process.env.DIRECT_URL!, 
  },
});