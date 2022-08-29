import type { AxiosRequestConfig, AxiosResponseHeaders } from 'axios';
import { ConfigurationError, HttpClientError, HttpServerError } from './errors';

export interface HttpClient<TargetUrls extends string> {
  get: (config: HttpClientGetConfig) => Promise<HttpResponse>;
  post: (config: HttpClientPostConfig) => Promise<HttpResponse>;
  targetUrls: Record<TargetUrls, (params?: TargetParams) => AbsoluteUrl>;
}

// TODO Do better with a generic
export type TargetParams = number | object | string;

export const getTargetFromPredicate = (
  predicate: (params?: TargetParams) => AbsoluteUrl,
  targetsUrls: Record<string, (params?: TargetParams) => AbsoluteUrl>
): never | string => {
  const target: string | undefined = Object.keys(targetsUrls).find(
    (targetsUrlKey: string): boolean => targetsUrls[targetsUrlKey] === predicate
  );

  if (target === undefined)
    throw new ConfigurationError('Invalid configuration: This target predicate does not match any registered target');

  return target;
};

export const isHttpError = (error: unknown): error is HttpClientError | HttpServerError =>
  error instanceof HttpClientError || error instanceof HttpServerError;

type Http = 'http://' | 'https://';

export type AbsoluteUrl = `${Http}${string}`;

export const isHttpClientError = (httpStatusCode: number): boolean => httpStatusCode >= 400 && httpStatusCode < 500;

export const isHttpServerError = (httpStatusCode: number): boolean => httpStatusCode >= 500 && httpStatusCode < 600;

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

export interface HttpClientTargetConfig {
  target: (params?: TargetParams) => AbsoluteUrl;
  targetParams?: TargetParams;
  adapterConfig?: AdapterConfig;
}

export type HttpClientGetConfig = HttpClientTargetConfig;

export type HttpClientPostConfig = HttpClientTargetConfig & {
  data?: object | string;
};

// Equivalent to axios AxiosRequestConfig for now but port may change over time
export type AdapterConfig = AxiosRequestConfig;
export type AdapterResponseHeaders = AxiosResponseHeaders;
