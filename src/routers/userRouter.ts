import { Request, Response, NextFunction, Router } from "express";
import { ProfileHandler } from "./handlers/user/profile";
import { SettingsHandler } from "./handlers/user/settings";

const router: Router = Router();
const routeViews: string = "router_views/user";

router.get("/profile", async (req: Request, res: Response, next: NextFunction) => {
    const handler = new ProfileHandler();
    const viewData = await handler.execute(req, res);
    res.render(`${routeViews}/profile`, viewData);
});

router.get("/settings", async (req: Request, res: Response, next: NextFunction) => {
    const handler = new SettingsHandler();
    const viewData = await handler.execute(req, res);
    res.render(`${routeViews}/settings`, viewData);
});

router.post("/settings", async (req: Request, res: Response, next: NextFunction) => {
    const handler = new SettingsHandler();
    const viewData = await handler.execute(req, res, "post");
    res.render(`${routeViews}/settings`, viewData);
});

export default router;
