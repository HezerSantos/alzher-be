import { Router } from "express";
import createUser from "../../controllers/auth/POST/createUser";
import loginUser from "../../controllers/auth/POST/loginUser";
import getSecureAuthToken from "../../controllers/auth/GET/getSecureAuthToken";
import getCheckSecureAuthToken from "../../controllers/auth/GET/getCheckSecureAuthToken";

const secureAuthRouter = Router()


secureAuthRouter.post("/signup", createUser)
secureAuthRouter.post("/login", loginUser)
secureAuthRouter.get("/refresh", getSecureAuthToken)
secureAuthRouter.get("/validate", getCheckSecureAuthToken)


export default secureAuthRouter