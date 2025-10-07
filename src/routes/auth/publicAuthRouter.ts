import { Router } from "express";
import getAuthToken from "../../controllers/auth/GET/getPublicAuthToken";
import logoutUser from "../../controllers/auth/POST/logoutUser";

const publicAuthRouter = Router()


publicAuthRouter.get("/", getAuthToken)
publicAuthRouter.post("/logout", logoutUser)

export default publicAuthRouter