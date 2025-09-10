import { Router } from "express";
import createUser from "../../controllers/auth/POST/createUser";
import loginUser from "../../controllers/auth/POST/loginUser";

const secureAuthRouter = Router()


secureAuthRouter.post("/signup", createUser)
secureAuthRouter.post("/login", loginUser)

export default secureAuthRouter