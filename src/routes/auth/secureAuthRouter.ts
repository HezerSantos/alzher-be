import { Router } from "express";
import createUser from "../../controllers/auth/POST/createUser";

const secureAuthRouter = Router()


secureAuthRouter.post("/signup", createUser)

export default secureAuthRouter