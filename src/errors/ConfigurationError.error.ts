export class ConfigurationError extends Error {
  constructor(
    public override readonly message: string = 'Invalid configuration',
    public readonly cause?: Error
  ) {
    super();
    // TODO Standard way to get the stacktrace ?
    //Error.captureStackTrace(this, this.constructor);
    this.name = 'ConfigurationError';
    this.message = message;
  }
}
