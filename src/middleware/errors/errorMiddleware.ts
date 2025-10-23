import { ErrorRequestHandler } from "express"
import multer from "multer";

const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  const stackLines = err.stack?.split('\n') || [];
  if (err instanceof multer.MulterError){
   return res.status(413).json({msg: "Invalid File Sumbission", code: "INVALID_UPLOAD"})
  }
    console.error(`
        ${new Date().toISOString()}\n
        Error Status ${err.status || 500 }: ${err.name}\n
        ${err.message || 'Internal Server Error'}\n
        METHOD: ${req.method} @ API: ${req.originalUrl}\n
        File: ${stackLines[2].trim()}\n
        From: ${req.headers["user-agent"]}\n
      `)
    
    console.error(err)
    res.status(err.status || 500).json(err.json || {msg: "Internal Server Error", code: "INVALID_SERVER"});
}

export default errorMiddleware