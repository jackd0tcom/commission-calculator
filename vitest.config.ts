import { defineConfig } from "vitest/config";

const testDbUrl = "postgresql:///commissions-db-test";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["src/**/*.test.ts", "server/**/*.test.ts"],
          exclude: ["server/tests/**"],
          environment: "node",
        },
      },
      {
        test: {
          name: "api",
          include: ["server/tests/api/**/*.test.ts"],
          environment: "node",
          setupFiles: ["server/tests/setup.ts"],
          globalSetup: ["server/tests/globalSetup.ts"],
          fileParallelism: false,
          env: {
            DATABASE_URL: testDbUrl,
            NODE_ENV: "test",
            RESPONA_WEBHOOK_SECRET: "test-webhook-secret",
          },
        },
      },
    ],
  },
});
