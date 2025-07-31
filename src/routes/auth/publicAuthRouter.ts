import { Router } from "express";
import getAuthToken from "../../controllers/auth/GET/getPublicAuthToken";

const publicAuthRouter = Router()


publicAuthRouter.get("/", getAuthToken)

export default publicAuthRouter