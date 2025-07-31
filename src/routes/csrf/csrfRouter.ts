import { Router } from 'express'
import getCsrfController from '../../controllers/csrf/GET/getCsrf'

const csrfRouter = Router()

csrfRouter.get("/", getCsrfController)

export default csrfRouter