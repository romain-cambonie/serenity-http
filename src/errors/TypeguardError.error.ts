export class TypeguardError extends Error {
  constructor(public override readonly message: string) {
    super();
    /*
     *  TODO Standard way to get the stacktrace ?
     * Error.captureStackTrace(this, this.constructor);
     */
    this.name = 'TypeguardError';
  }
}
