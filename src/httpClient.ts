import type { AxiosRequestConfig, AxiosResponseHeaders } from 'axios';
import { ConfigurationError, HttpClientError, HttpServerError } from './errors';

export type HttpClient<Target extends string> = {
  execute: <ExternalContract>(targetRequestConfiguration: RequestTarget<Target>) => Promise<HttpResponse<ExternalContract>>;
};

export type RequestTarget<Target> = {
  target: Target;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  urlParams?: any;
  data?: object | string;
};

export type Targets<Target extends string> = Record<Target, TargetConfiguration>;

export type TargetConfiguration<T = unknown> = {
  adapterConfig?: AdapterConfig;
  makeUrl: UrlMaker;
  externalContractTypeguard?: (data: unknown) => data is T;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type UrlMaker = (params?: any) => Url;

export type ErrorMapper<Target extends string> = Partial<Record<Target, Partial<Record<string, (error: Error) => Error>>>>;

export type Url = `${Http}${string}`;

export const isTarget = <Target extends string>(url: string, targets: Targets<Target>): url is Target => {
  const targetsAsConst: readonly string[] = [...Object.keys(targets)] as const;
  return targetsAsConst.includes(url);
};

export const getTargetFromPredicate = <Target extends string>(
  predicate: UrlMaker,
  targets: Targets<Target>
): Target | never => {
  const targetFromPredicate: string | undefined = Object.keys(targets).find(
    (targetsUrlKey: string): boolean => targets[targetsUrlKey as Target].makeUrl === predicate
  );

  if (targetFromPredicate === undefined || !isTarget(targetFromPredicate, targets))
    throw new ConfigurationError('Invalid configuration: This target predicate does not match any registered target');

  return targetFromPredicate;
};

export const isHttpError = (error: unknown): error is HttpClientError | HttpServerError =>
  error instanceof HttpClientError || error instanceof HttpServerError;

type Http = 'http://' | 'https://';

export const isHttpClientError = (httpStatusCode: number): boolean => httpStatusCode >= 400 && httpStatusCode < 500;

export const isHttpServerError = (httpStatusCode: number): boolean => httpStatusCode >= 500 && httpStatusCode < 600;

export type UnknownHttpResponse = {
  data: unknown;
  status: number;
  statusText: string;
  headers: AdapterResponseHeaders;
  config: AdapterConfig;
  request?: object;
};

export type HttpResponse<T = unknown> = {
  data: T;
  status: number;
  statusText: string;
  headers: AdapterResponseHeaders;
  config: AdapterConfig;
  request?: object;
};

// Equivalent to axios AxiosRequestConfig for now but port may change over time
export type AdapterConfig = AxiosRequestConfig;
export type AdapterResponseHeaders = AxiosResponseHeaders;
