import { ErrorRequestHandler } from "express"

const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  const stackLines = err.stack?.split('\n') || [];

    console.error(`
        ${new Date().toISOString()}\n
        Error Status ${err.status || 500 }: ${err.name}\n
        ${err.message || 'Internal Server Error'}\n
        METHOD: ${req.method} @ API: ${req.originalUrl}\n
        File: ${stackLines[2].trim()}\n
        From: ${req.headers["user-agent"]}\n
      `)
    
    
    res.status(err.status || 500).json({
      errors: err.status === 400? err.json.errors : err.json || [{msg: 'Internal Server Error'}],
    });
}

export default errorMiddleware