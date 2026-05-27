import express, { type RequestHandler } from "express";
import { logger } from "@repo/logger";
import cors from "cors";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import cookieParser from "cookie-parser";
import { serverRouter, createContext } from "@repo/trpc/server";

import { env } from "./env.js";

export const app = express();
let apiReferenceHandlerPromise: Promise<RequestHandler> | undefined;

function getApiReferenceHandler() {
  apiReferenceHandlerPromise ??= import("@scalar/express-api-reference").then(({ apiReference }) =>
    apiReference({ url: "/openapi.json" }),
  );

  return apiReferenceHandlerPromise;
}

const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "ChaiForms API",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  return res.json({ message: "ChaiForms is up and running..." });
});

app.get("/health", (req, res) => {
  return res.json({ message: "ChaiForms server is healthy", healthy: true });
});

logger.debug(`openapi.json: ${env.BASE_URL}/openapi.json`);
app.get("/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", async (req, res, next) => {
  try {
    const apiReferenceHandler = await getApiReferenceHandler();
    apiReferenceHandler(req, res, next);
  } catch (err) {
    next(err);
  }
});

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

export default app;
