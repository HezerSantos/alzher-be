import  { ValidationError } from 'express-validator'
interface ErrorDetails {
    (message: string,
    status: number,
    json: JsonResponseType): void
}

interface JsonResponseType {
      msg: string,
      code: string,
      validationErrors?: ValidationError[] | {path: string, msg: string}[]
  }
interface HttpErrorDetails {
    message: string,
    status: number,
    json: JsonResponseType
}

class HttpError extends Error implements HttpErrorDetails{
  status: number
  json: JsonResponseType

  constructor(message: string, status: number, json: JsonResponseType) {
    super(message)
    this.status = status
    this.json = json

    Object.setPrototypeOf(this, HttpError.prototype)
  }
}

const throwError: ErrorDetails = (message, status, json) => {
  throw new HttpError(message, status, json)
}

export default throwError