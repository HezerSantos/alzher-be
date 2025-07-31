import { Router } from 'express'
import getRobots from '../../controllers/robots/GET/getRobots'

const robotsRouter = Router()

robotsRouter.get("/", getRobots)

export default robotsRouter