import { Router } from "express";
import createUser from "../../controllers/auth/POST/createUser";
import loginUser from "../../controllers/auth/POST/loginUser";
import getSecureAuthToken from "../../controllers/auth/GET/getSecureAuthToken";

const secureAuthRouter = Router()


secureAuthRouter.post("/signup", createUser)
secureAuthRouter.post("/login", loginUser)
secureAuthRouter.get("/refresh", getSecureAuthToken)

export default secureAuthRouter