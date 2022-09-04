/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { AxiosRequestConfig, AxiosResponseHeaders } from 'axios';
import { ConfigurationError, HttpClientError, HttpServerError } from './errors';

export interface HttpClient<Target extends string> {
  get: (config: HttpClientGetConfig) => Promise<HttpResponse>;
  post: (config: HttpClientPostConfig) => Promise<HttpResponse>;
  targets: Record<Target, TargetConfiguration>;
}

export type Targets<Target extends string> = Record<Target, TargetConfiguration>;
export type TargetConfiguration = {
  makeUrl: MakeUrlTypes;
};

type MakeUrlTypes = /*WithCustomType |*/ WithNumber | WithString | WithUndefined;
export type WithUndefined = (params: undefined) => Url;
export type WithNumber = (params: number) => Url;
export type WithCustomType = <T extends object>(params: T) => Url;
export type WithString = (params: string) => Url;

export type ErrorMapper<Target extends string> = Partial<Record<Target, Partial<Record<string, (error: Error) => Error>>>>;

export type Url = `${Http}${string}`;

export const isTarget = <Target extends string>(url: string, targets: Targets<Target>): url is Target => {
  const targetsAsConst: readonly string[] = [...Object.keys(targets)] as const;
  return targetsAsConst.includes(url);
};

export const getTargetFromPredicate = <Target extends string>(
  predicate: WithCustomType | WithNumber | WithString | WithUndefined,
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
  target: TargetConfiguration;
  targetParams?: number | /*object |*/ string | undefined;
  adapterConfig?: AdapterConfig;
}

export type HttpClientGetConfig = HttpClientTargetConfig;

export type HttpClientPostConfig = HttpClientTargetConfig & {
  data?: object | string;
};

// Equivalent to axios AxiosRequestConfig for now but port may change over time
export type AdapterConfig = AxiosRequestConfig;
export type AdapterResponseHeaders = AxiosResponseHeaders;
