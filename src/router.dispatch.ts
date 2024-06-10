// Do Router dispatch here, i.e. map incoming routes to appropriate router
import { Application, Request, Response } from "express";
import indexRouter from "./routers/indexRouter";
import userRouter from "./routers/userRouter";
import companyRouter from "./routers/companyRouter";

const routerDispatch = (app: Application) => {
    app.use("/", indexRouter);
    app.use("/user", userRouter);
    app.use("/company", companyRouter);
    app.use("*", (req: Request, res: Response) => {
        res.status(404).render("partials/error_400");
    });
};

export default routerDispatch;
