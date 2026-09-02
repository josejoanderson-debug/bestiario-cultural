import "dotenv/config";
import { createServer } from "http";
import { app } from "../app";
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  const server = createServer(app);

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT ?? 3000);
  server.listen(port, "0.0.0.0", () => console.log(`Bestiário Cultural em execução na porta ${port}.`));
}

startServer().catch((error) => {
  console.error("Não foi possível iniciar o servidor:", error);
  process.exit(1);
});
