import expressListRoutes from "express-list-routes";

export function attachRouter(app, appRouter) {
  appRouter.forEach((x) => {
    if (process.env.NODE_ENV == "development") {
      console.log("\n");
      expressListRoutes(x.router, { prefix: x.prefix });
    }
    app.use(x.prefix, x.router);
  });
  console.log("\n");
}
