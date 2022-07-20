export class InfrastructureError extends Error {
  constructor(
    public override readonly message: string = "Infrastructure error",
    public override readonly cause?: Error,
  ) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
  }
}

export class ConnectionRefusedError extends InfrastructureError {
  constructor(
    public override readonly message: string = "Could not connect to server",
    public override readonly cause?: Error,
  ) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
  }
}

export class ConfigurationError extends InfrastructureError {
  constructor(
    public override readonly message: string = "Invalid configuration",
    public override readonly cause?: Error,
  ) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
  }
}

export const isConnectionRefusedError = (error: unknown): boolean =>
  (error as unknown as { code: string }).code === "ECONNREFUSED";
