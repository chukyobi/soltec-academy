import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    url: "postgresql://neondb_owner:REDACTED_ROTATE_NOW@ep-odd-art-amyt0r74-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
});
