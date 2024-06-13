// Do Router dispatch here, i.e. map incoming routes to appropriate router
import { Application, Request, Response } from "express";
import routes from "./routers";
import { BASE_URL } from "./types/pageURL";
import { ErrorService } from "./services/errorService";

const routerDispatch = (app: Application) => {
    app.use(BASE_URL, routes);
    app.use("*", (req: Request, res: Response) => {
        const errorService = new ErrorService();
        errorService.render404Page(req, res);
    });
};

export default routerDispatch;
