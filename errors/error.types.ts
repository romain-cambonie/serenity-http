import { HttpServerError } from "./HttpServerError.error";
import { HttpClientError } from "./HttpClientError.error";

export const isHttpError = (
  error: any,
): error is HttpClientError | HttpServerError =>
  error instanceof HttpClientError || error instanceof HttpServerError;
