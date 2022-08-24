import { HttpClientError, HttpClientForbiddenError, HttpServerError } from "../errors";
import { AdapterConfig, HttpClientTargetConfig, isHttpClientError, isHttpServerError } from "../httpClient";
import { AxiosErrorWithResponse } from "./axios.adapter";
import {
  AxiosInfrastructureError,
  AxiosInfrastructureErrorCodes,
  ConnectionRefusedError,
  ConnectionResetError,
  InfrastructureError,
  isAxiosInfrastructureError,
  isTCPWrapperConnectionRefusedError,
  isTCPWrapperConnectionResetError,
} from "./errors";

export const toHttpError = (
  error: AxiosErrorWithResponse,
): HttpClientError | HttpServerError | undefined => {
  if (isHttpClientError(error.response.status)) {
    if (error.response.status === 401)
      return new HttpClientForbiddenError(`Forbidden Access`, error);

    return new HttpClientError(
      `${JSON.stringify(toSerializableAxiosHttpError(error), null, 2)}`,
      error,
      error.response.status,
    );
  }

  if (isHttpServerError(error.response.status)) {
    return new HttpServerError(
      `${JSON.stringify(toSerializableAxiosHttpError(error), null, 2)}`,
      error,
      error.response.status,
    );
  }
};

export const toInfrastructureError = (
  error: Error,
): InfrastructureError | undefined => {
  if (isTCPWrapperConnectionRefusedError(error))
    return new ConnectionRefusedError(
      `Could not connect to server : ${toAxiosInfrastructureErrorString(
        error,
      )}`,
      error,
    );

  if (isTCPWrapperConnectionResetError(error))
    return new ConnectionResetError(
      `The other side of the TCP conversation abruptly closed its end of the connection: ${toAxiosInfrastructureErrorString(
        error,
      )}`,
      error,
    );

  if (isAxiosInfrastructureError(error))
    return new AxiosInfrastructureError(
      `Axios infrastructure error: ${toAxiosInfrastructureErrorString(error)}`,
      error,
      (error as unknown as { code: AxiosInfrastructureErrorCodes }).code,
    );
};

// TODO Do better with generic
/*type PartiallyTypedSerializableAxiosHttpError = {
  _response: {
    data: any,
    status: number,
    headers: AxiosResponseHeaders,
    requestConfig: {
      url: string,
      headers: AxiosRequestHeaders,
      method: string,
      data: any,
      timeout: number,
    },
    request?: object;
  }
};*/

const toSerializableAxiosHttpError = ({
                                        response,
                                      }: AxiosErrorWithResponse): object => {
  const {config, data, status, headers, request} = response;

  const axiosHttpErrorWithoutRequest = {
    _response: {
      data,
      status,
      headers,
    },
    requestConfig: {
      url: config.url!,
      headers: config.headers!,
      method: config.method!,
      data: config.data!,
      timeout: config.timeout!,
    },
  };

  if (!request) return axiosHttpErrorWithoutRequest;

  // socket, agent, res, _redirectable are keys that cause "cyclic structure" errors.
  // If needed for debug we may want to further explore them by listing keys and displaying what can be.
  const {socket, agent, res, _redirectable, ...nonCyclicRequest} = request;
  return {
    ...axiosHttpErrorWithoutRequest,
    request: nonCyclicRequest,
  };
};

const toAxiosInfrastructureErrorString = (error: any): string =>
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

export const shallowMergeConfigs = (
  initialConfig: AdapterConfig,
  additionalConfig: HttpClientTargetConfig,
): AdapterConfig => ({...initialConfig, ...additionalConfig.adapterConfig});
