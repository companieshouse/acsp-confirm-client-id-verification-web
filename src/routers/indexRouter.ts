import { Request, Response, Router, NextFunction } from "express";
import { HomeHandler } from "./handlers/index/home";

const router: Router = Router();
const routeViews: string = "router_views/index";

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    const handler = new HomeHandler();
    const viewData = await handler.execute(req, res);
    res.render(`${routeViews}/home`, viewData);
});

export default router;
