import axios, { AxiosError, AxiosResponse } from 'axios';
import type { HttpClientError, HttpServerError } from '../errors';
import { toMappedErrorMaker, toUnhandledError } from '../httpClient.mappers';
import type { AxiosErrorWithResponse, ErrorInterceptor, TargetErrorContext } from './axios.adapter';
import { toHttpError, toInfrastructureError } from './axios.mappers';
import type { InfrastructureErrorKinds } from './errors';

export const onFullfilledDefaultResponseInterceptorMaker =
  () =>
  (response: AxiosResponse): AxiosResponse => {
    // eslint-disable-next-line no-console
    console.log('[Axios Managed Response Status]: ', response.status, ' - ', response.config.url);
    return response;
  };

export const onRejectDefaultResponseInterceptorMaker = <Target extends string>(
  context: TargetErrorContext<Target>
): ErrorInterceptor => {
  const toMappedError: (error: Error) => Error = toMappedErrorMaker(context.target, context.errorMapper);

  /*
   * TODO Because error handling logic is complicated
   *  it should be worth it to extract part of the following logic as functions with clear responsibilities
   */
  return (rawAxiosError: AxiosError): never => {
    // Handle infrastructure and network errors
    const infrastructureError: InfrastructureErrorKinds | undefined = toInfrastructureError(rawAxiosError);
    if (infrastructureError != null) throw toMappedError(infrastructureError);

    throwUnhandledIfInvalidError(rawAxiosError);

    const httpError: HttpClientError | HttpServerError | undefined = toHttpError(rawAxiosError as AxiosErrorWithResponse);

    if (httpError === undefined)
      throw toUnhandledError('failed to convert error to valid HttpClientError or HttpServerError', rawAxiosError);

    throw toMappedError(httpError);
  };
};

const throwUnhandledIfInvalidError = (rawAxiosError: AxiosError): never | void => {
  // Axios failed to convert the error into a valid error
  if (!axios.isAxiosError(rawAxiosError))
    throw toUnhandledError(`error Response does not have the property isAxiosError set to true`, rawAxiosError);

  // Error does not satisfy our minimal requirements
  if (!isValidErrorResponse(rawAxiosError.response))
    throw toUnhandledError('error response objects does not have mandatory keys', rawAxiosError);
};

export const isValidErrorResponse = (response: AxiosResponse | undefined): response is AxiosResponse =>
  !(response == null) && typeof response.status === 'number';

// TODO Do we want to restrict statuses to a union of HttpCodes ?

/*
 *  TODO Do we have to further test what is a valid axios response format for us ?
 * && !!headers && !!config: AxiosRequestConfig
 */
