export class HttpClientError extends Error {
  constructor(
    public override readonly message: string,
    public override readonly cause: Error,
    //TODO Restrict to valid HttpStatusCodeError
    public readonly httpStatusCode: number,
  ) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = "HttpClientError";
    this.message = message;
  }
}

export class HttpClientForbiddenError extends HttpClientError {
  constructor(
    public override readonly message: string,
    public override readonly cause: Error, //TODO Restrict to valid HttpStatusCodeError
  ) {
    super(message, cause, 401);
    Error.captureStackTrace(this, this.constructor);
    this.name = "HttpClientForbiddenError";
    this.message = message;
  }
}
