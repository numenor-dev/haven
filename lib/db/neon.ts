import { createClient } from "@neondatabase/neon-js";

export const client = createClient({
  auth: {
    url: process.env.NEON_AUTH_BASE_URL!,
  },
  dataApi: {
    url: process.env.NEON_DATA_API_URL!,
  },
});