import express from 'express'
import dotenv from 'dotenv'
import cookieParser from './middleware/cookieParserMiddleware'
import helmet from './middleware/helmetMiddleware'
import bodyParser from './middleware/bodyParserMiddleware'
import cors from './middleware/corsMiddleware'
import errorMiddleware from './middleware/errors/errorMiddleware'
import publicAuthRouter from './routes/auth/publicAuthRouter'
import verifyPublicAuthToken from './middleware/auth/verifyPublicAuthToken'
import csrfRouter from './routes/csrf/csrfRouter'
import robotsRouter from './routes/robots/robotsRouter'
import secureAuthRouter from './routes/auth/secureAuthRouter'
import validateCsrf from './middleware/csrf/validateCsrf'
import verifyUser from './controllers/auth/helpers/auth'
import dashboardRouter from './routes/dashboard/dashboardRouter'
dotenv.config()
const app = express()
app.use("/robots.txt", robotsRouter)
app.set('trust proxy', 1)
app.use(cookieParser)
app.use(helmet)
app.use(bodyParser)
app.use(cors)

app.use("/api/auth/public", publicAuthRouter)

app.use(verifyPublicAuthToken)
app.use("/api/csrf", csrfRouter)

app.use("/api/auth/secure", validateCsrf, secureAuthRouter)
app.use("/api/dashboard", validateCsrf, verifyUser, dashboardRouter)
app.use(errorMiddleware)
const PORT = Number(process.env.PORT) || 8080
app.listen(PORT, '0.0.0.0', () => {
    console.log(`App running on Port ${PORT}`)
})