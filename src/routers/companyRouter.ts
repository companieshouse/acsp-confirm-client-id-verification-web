import { Request, Response, Router, NextFunction } from "express";
import { CreateHandler } from "./handlers/company/create";
import { DetailsHandler } from "./handlers/company/details";

const router: Router = Router();
const routeViews: string = "router_views/company";

router.get("/create", async (req: Request, res: Response, next: NextFunction) => {
    const handler = new CreateHandler();
    const viewData = await handler.execute(req, res);
    res.render(`${routeViews}/create`, viewData);
});

router.post("/create", async (req: Request, res: Response, next: NextFunction) => {
    const handler = new CreateHandler();
    const viewData = await handler.execute(req, res, "POST");
    res.render(`${routeViews}/create`, viewData);
});

router.get("/details/:id", async (req: Request, res: Response, next: NextFunction) => {
    const handler = new DetailsHandler();
    const viewData = await handler.execute(req, res);
    res.render(`${routeViews}/details`, viewData);
});

export default router;
