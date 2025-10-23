import cors, {CorsOptions} from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const allowedOrigins: string[] = [
    String(process.env.CLIENT_URL),
    "http://localhost:5173",
    "http://localhost:3000"
]

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    } 
    if(allowedOrigins.indexOf(origin) !== -1){
      return callback(null, true)
    }else {
      console.warn('Blocked CORS for:', origin);
      return callback(new Error("CORS not allowed for this origin"), false);
    }
  
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "Cookie", 
    "Set-Cookie", 
    'csrfToken'
],
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200
};

export default cors(corsOptions)