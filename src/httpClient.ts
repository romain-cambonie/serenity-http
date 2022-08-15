import { ConfigurationError } from "./errors";
import { HttpClientError } from "./errors";
import { HttpServerError } from "./errors";

export interface HttpClient {
  get: (config: HttpClientGetConfig) => Promise<HttpResponse>;
  post: (config: HttpClientPostConfig) => Promise<HttpResponse>;
  //get$: (config: HttpClientGetConfig) => Observable<HttpResponse>;
  //post$: (config: HttpClientPostConfig) => Observable<HttpResponse>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}

export const getTargetFromPredicate = (
  predicate: (params: any) => AbsoluteUrl,
  targetsUrls: Record<string, (params: any) => AbsoluteUrl>,
): string | never => {
  const target: string | undefined = Object.keys(targetsUrls).find(
    (targetsUrlKey) => targetsUrls[targetsUrlKey] === predicate,
  );
  if (!target)
    throw new ConfigurationError(
      "Invalid configuration: This target predicate does not match any registered target",
    );
  return target;
};

export const isHttpError = (
  error: any,
): error is HttpClientError | HttpServerError =>
  error instanceof HttpClientError || error instanceof HttpServerError;

type Http = "http://" | "https://";
export type AbsoluteUrl = `${Http}${string}`;

export const isHttpClientError = (status: number): boolean =>
  status >= 400 && status < 500;

export const isHttpServerError = (status: number): boolean =>
  status >= 500 && status < 600;

export type TargetUrlsMapper<TargetUrls extends string> = Record<
  TargetUrls,
  (params: any) => AbsoluteUrl
>;

export type ErrorMapper<TargetUrls extends string> = Partial<
  Record<TargetUrls, Partial<Record<string, (error: Error) => Error>>>
>;

// TODO Permettre de retourner data: T si une fct de validation qui fait le typeguard est fournie.
export interface HttpResponse {
  data: unknown;
  status: number;
  statusText: string;
  headers: any;
  config: AdapterConfig;
  request?: any;
}

export type HttpClientPostConfig = {
  target: (params: any) => AbsoluteUrl;
  targetParams?: any;
  data?: string | undefined;
  adapterConfig?: AdapterConfig;
};

export type HttpClientGetConfig = {
  target: (params: any) => AbsoluteUrl;
  targetParams?: any;
  adapterConfig?: AdapterConfig;
};

type Method =
  | 'get' | 'GET'
  | 'delete' | 'DELETE'
  | 'head' | 'HEAD'
  | 'options' | 'OPTIONS'
  | 'post' | 'POST'
  | 'put' | 'PUT'
  | 'patch' | 'PATCH'
  | 'purge' | 'PURGE'
  | 'link' | 'LINK'
  | 'unlink' | 'UNLINK';

export type RequestHeaders = Record<string, string | number | boolean>;


// TODO Equivalent to axios AxiosRequestConfig for now
export type AdapterConfig = {
  url?: string;
  method?: Method;
  baseURL?: string;
  headers?: RequestHeaders;
  params?: any;
  paramsSerializer?: (params: any) => string;
  data?: unknown;
  timeout?: number;
  timeoutErrorMessage?: string;
  withCredentials?: boolean;
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
  onUploadProgress?: (progressEvent: any) => void;
  onDownloadProgress?: (progressEvent: any) => void;
  maxContentLength?: number;
  validateStatus?: ((status: number) => boolean) | null;
  maxBodyLength?: number;
  maxRedirects?: number;
  socketPath?: string | null;
  httpAgent?: any;
  httpsAgent?: any;
  decompress?: boolean;
  signal?: AbortSignal;
  insecureHTTPParser?: boolean;
}
