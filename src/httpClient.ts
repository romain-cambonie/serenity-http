import type { AxiosRequestConfig, AxiosResponseHeaders } from 'axios';
import { ConfigurationError } from './errors';
import { HttpClientError } from './errors';
import { HttpServerError } from './errors';

export interface HttpClient {
  get: (config: HttpClientGetConfig) => Promise<HttpResponse>;
  post: (config: HttpClientPostConfig) => Promise<HttpResponse>;
  //get$: (config: HttpClientGetConfig) => Observable<HttpResponse>;
  //post$: (config: HttpClientPostConfig) => Observable<HttpResponse>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}

// TODO Do better with a generic
export type TargetParams = number | string | object;

export const getTargetFromPredicate = (
  predicate: (params?: TargetParams) => AbsoluteUrl,
  targetsUrls: Record<string, (params?: TargetParams) => AbsoluteUrl>
): string | never => {
  const target: string | undefined = Object.keys(targetsUrls).find((targetsUrlKey) => targetsUrls[targetsUrlKey] === predicate);
  if (!target)
    throw new ConfigurationError('Invalid configuration: This target predicate does not match any registered target');
  return target;
};

export const isHttpError = (error: unknown): error is HttpClientError | HttpServerError =>
  error instanceof HttpClientError || error instanceof HttpServerError;

type Http = 'http://' | 'https://';

export type AbsoluteUrl = `${Http}${string}`;

export const isHttpClientError = (status: number): boolean => status >= 400 && status < 500;

export const isHttpServerError = (status: number): boolean => status >= 500 && status < 600;

export type TargetUrlsMapper<TargetUrls extends string> = Record<TargetUrls, (params?: TargetParams) => AbsoluteUrl>;

export type ErrorMapper<TargetUrls extends string> = Partial<
  Record<TargetUrls, Partial<Record<string, (error: Error) => Error>>>
>;

// TODO Permettre de retourner data: T si une fct de validation qui fait le typeguard est fournie.
export interface HttpResponse {
  data: unknown;
  status: number;
  statusText: string;
  headers: AdapterResponseHeaders;
  config: AdapterConfig;
  request?: object; // TODO To type better
}

export type HttpClientTargetConfig = {
  target: (params?: TargetParams) => AbsoluteUrl;
  targetParams?: TargetParams;
  adapterConfig?: AdapterConfig;
};

export type HttpClientGetConfig = HttpClientTargetConfig;

export type HttpClientPostConfig = HttpClientTargetConfig & {
  data?: string | undefined;
};

// Equivalent to axios AxiosRequestConfig for now but port may change over time
export type AdapterConfig = AxiosRequestConfig;
export type AdapterResponseHeaders = AxiosResponseHeaders;
