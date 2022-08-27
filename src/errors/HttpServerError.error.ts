export class HttpServerError extends Error {
  constructor(
    public override readonly message: string,
    public readonly cause: Error,
    //TODO Restrict to valid HttpStatusCodeError
    public readonly httpStatusCode: number
  ) {
    super();
    // TODO Standard way to get the stacktrace ?
    //Error.captureStackTrace(this, this.constructor);
    this.name = 'HttpServerError';
    this.message = message;
  }
}
