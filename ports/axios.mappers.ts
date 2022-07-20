import { HttpClientError } from "../errors/HttpClientError.error";
import { HttpServerError } from "../errors/HttpServerError.error";
import {
  InfrastructureError,
  ConnectionRefusedError,
  isConnectionRefusedError,
} from "../errors/InfrastructureError.error";

import { AxiosError } from "axios";
import { ErrorMapper, isHttpClientError } from "../httpClient";
import { AxiosErrorWithResponse } from "./axios.port";

export const toInfrastructureError = (
  error: AxiosError,
): InfrastructureError | undefined => {
  if (isConnectionRefusedError(error))
    return new ConnectionRefusedError(
      `Could not connect to server : ${toRawErrorString(error)}`,
      error,
    );
};

export const toHttpError = (
  error: AxiosErrorWithResponse,
): HttpClientError | HttpServerError | undefined => {
  if (isHttpClientError(error.response.status)) {
    return new HttpClientError(
      `4XX Status Code ${toAxiosHttpErrorString(error)}`,
      error,
      error.response.status,
    );
  }

  if (isHttpClientError(error.response.status)) {
    return new HttpServerError(
      `5XX Status Code ${toAxiosHttpErrorString(error)}`,
      error,
      error.response.status,
    );
  }
};

export const toMappedErrorIfOverridenMaker =
  <T extends string>(target: T, errorMapper: ErrorMapper<T>) =>
  (
    error: HttpClientError | HttpServerError,
  ): Error | HttpClientError | HttpServerError => {
    const errorByStatus = errorMapper[target];
    if (!errorByStatus) return error;

    const newErrorMaker = errorByStatus[error.httpStatusCode];
    if (!newErrorMaker) return error;

    return newErrorMaker(error);
  };

/*export const toMappedErrorIfOverriden =
  <T extends string>(target: T, errorMapper: ErrorMapper<T>) =>
    (
      error: HttpClientError | HttpServerError,
    ): Error | HttpClientError | HttpServerError => {
      const errorByStatus = errorMapper[target];
      if (!errorByStatus) return error;

      const newErrorMaker = errorByStatus[error.httpStatusCode];
      if (!newErrorMaker) return error;

      return newErrorMaker(error);
    };*/

export const toUnhandledError = (details: string, error: AxiosError): Error => {
  let rawString: string;
  try {
    rawString = JSON.stringify(error);
  } catch (stringifyError: any) {
    const keys: string[] = Object.keys(error);
    rawString = `Failed to JSON.stringify the error due to : ${
      stringifyError?.message
    }. 
    Raw object keys : ${
      keys.length > 0
        ? keys.join("\n")
        : "Object.keys(error) returned an empty array"
    }`;
  }
  return new Error(
    `Unhandled Http Client Error - ${details} - JSON Stringify tentative result -> ${rawString}`,
    { cause: error },
  );
};

const toAxiosHttpErrorString = (error: AxiosError): string =>
  JSON.stringify(
    {
      requestConfig: {
        url: error.response?.config?.url,
        headers: error.response?.config?.headers,
        method: error.response?.config?.method,
        data: error.response?.config?.data,
        timeout: error.response?.config?.timeout,
      },
      data: error.response?.data,
      status: error.response?.status,
    },
    null,
    2,
  );

const toRawErrorString = (error: any): string =>
  JSON.stringify(
    {
      code: error.code,
      address: error.address,
      port: error.port,
      config: {
        headers: error.config?.headers,
        method: error.config?.method,
        url: error.config?.url,
        baseUrl: error.config?.baseUrl,
        data: error.config?.data,
      },
    },
    null,
    2,
  );
