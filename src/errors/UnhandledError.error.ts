export class UnhandledError extends Error {
  constructor(public override readonly message: string, public readonly cause: Error) {
    super();
    /*
     *  TODO Standard way to get the stacktrace ?
     * Error.captureStackTrace(this, this.constructor);
     */
    this.name = 'UnhandledError';
    this.message = message;
  }
}
