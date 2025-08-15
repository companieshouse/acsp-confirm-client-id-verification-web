// Do Router dispatch here, i.e. map incoming routes to appropriate router
import { Application, Request, Response } from "express";
import routes from "./routers";
import reverifyRoutes from "./routers/reverifyRoutes";
import { isActiveFeature } from "./utils/feature.flag";
import { FEATURE_FLAG_ENABLE_REVERIFY_SOMEONES_IDENTITY } from "./utils/properties";
import { BASE_URL, REVERIFY_BASE_URL } from "./types/pageURL";
import { ErrorService } from "./services/errorService";

const routerDispatch = (app: Application) => {
    app.use(BASE_URL, routes);
    if (isActiveFeature(FEATURE_FLAG_ENABLE_REVERIFY_SOMEONES_IDENTITY)) {
        app.use(REVERIFY_BASE_URL, reverifyRoutes);
    }
    app.use("*", (req: Request, res: Response) => {
        const errorService = new ErrorService();
        errorService.render404Page(req, res);
    });
};

export default routerDispatch;
