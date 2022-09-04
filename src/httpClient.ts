// TODO Check rule details
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { AxiosRequestConfig, AxiosResponseHeaders } from 'axios';
import { ConfigurationError, HttpClientError, HttpServerError } from './errors';

// A target is defined by a string id and a configuration
export type Targets<TargetKind extends string> = Record<TargetKind, TargetConfiguration>;

// The target configuration aim is to resolve to a fully qualified url
export type TargetConfiguration = { url: ResolvedUrl<TargetUrlParams> };

export type TargetUrlParams = number | object | string;

// A fully qualified url is either a valid url string or a function that will return one.
export type ResolvedUrl<P extends TargetUrlParams = undefined> = ValidUrl | ValidUrlCallback<P>;
// export type ResolvedUrl = ValidUrl | (<P extends TargetUrlParams>(urlParams: P) => ValidUrl);

type Http = 'http://' | 'https://';
export type ValidUrl = `${Http}${string}`;
export type ValidUrlCallback<P extends TargetUrlParams> = (urlParams: P) => ValidUrl;

// Error mapper allows map custom domain error to be thrown instead of http in case of complex workflows
export type ErrorMapper<TargetUrls extends string> = Partial<
  Record<TargetUrls, Partial<Record<string, (error: Error) => Error>>>
>;

export interface HttpClient<TargetKinds extends string> {
  get: (config: HttpClientGetConfig<TargetUrlParams>) => Promise<HttpResponse>;
  post: (config: HttpClientPostConfig<TargetUrlParams>) => Promise<HttpResponse>;
  targets: Targets<TargetKinds>;
  /*
   * targetUrls: Record<TargetUrls, {
   * resolvedUrl: <TargetParams>(params: TargetParams) => ValidUrl;
   * typeguard?: <U>(responseData: unknown) => responseData is U;
   * }>;
   */
}

export const isTargetUrl = <TargetUrls extends string>(
  url: string,
  urlRecord: Record<TargetUrls, unknown>
): url is TargetUrls => {
  const targetUrlsAsConst: readonly string[] = [...Object.keys(urlRecord)] as const;

  return targetUrlsAsConst.includes(url);
};

export const getTargetFromPredicate = <TargetKind extends string>(
  predicate: ResolvedUrl<TargetUrlParams>,
  targetsUrls: Targets<TargetKind>
): TargetKind | never => {
  const target: string | undefined = Object.keys(targetsUrls).find(
    (targetsUrlKey: string): boolean => targetsUrls[targetsUrlKey] === predicate
  );

  if (target === undefined || !isTargetUrl(target, targetsUrls))
    throw new ConfigurationError('Invalid configuration: This target predicate does not match any registered target');

  return target;
};

export const getFullyQualifiedUrl = (
  urlToResolve: ResolvedUrl<TargetUrlParams>,
  urlParams: TargetUrlParams = undefined
): ValidUrl => (typeof urlToResolve === 'string' ? urlToResolve : urlToResolve(urlParams));

export const isHttpError = (error: unknown): error is HttpClientError | HttpServerError =>
  error instanceof HttpClientError || error instanceof HttpServerError;
export const isHttpClientError = (httpStatusCode: number): boolean => httpStatusCode >= 400 && httpStatusCode < 500;
export const isHttpServerError = (httpStatusCode: number): boolean => httpStatusCode >= 500 && httpStatusCode < 600;

// TODO Permettre de retourner data: T si une fct de validation qui fait le typeguard est fournie.
export interface HttpResponse {
  data: unknown;
  status: number;
  statusText: string;
  headers: AdapterResponseHeaders;
  config: AdapterConfig;
  request?: object; // TODO To type better
}

export interface HttpClientTargetConfig<P extends TargetUrlParams> {
  target: ResolvedUrl<P>;
  targetParams?: P;
  adapterConfig?: AdapterConfig;
}

export type HttpClientGetConfig<P extends TargetUrlParams> = HttpClientTargetConfig<P>;

export type HttpClientPostConfig<P extends TargetUrlParams> = HttpClientTargetConfig<P> & {
  data?: object | string;
};

// Equivalent to axios AxiosRequestConfig for now but port may change over time
export type AdapterConfig = AxiosRequestConfig;
export type AdapterResponseHeaders = AxiosResponseHeaders;
