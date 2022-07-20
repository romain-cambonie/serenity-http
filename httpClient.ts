import { HttpClientError } from "./errors/HttpClientError.error";
import { HttpServerError } from "./errors/HttpServerError.error";

type Http = "http://" | "https://";

export type AbsoluteUrl = `${Http}${string}`;

export const isHttpClientError = (status: number): boolean =>
  status >= 400 && status < 500;

export const isHttpServerError = (status: number): boolean =>
  status >= 500 && status < 600;

export type ErrorMapper<TargetUrls extends string> = Partial<
  Record<
    TargetUrls,
    Partial<Record<number, (error: HttpServerError | HttpClientError) => Error>>
  >
>;

export type TargetUrlsMapper<TargetUrls extends string> = Record<
  TargetUrls,
  (params: any) => AbsoluteUrl
>;

export interface HttpResponse<T = any, _D = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
  request?: any;
}

export type HttpClientPostConfig = {
  target: (params: any) => AbsoluteUrl;
  targetParams?: any;
  data?: string | undefined;
  adapterConfig?: any;
};

export type HttpClientGetConfig = {
  // TODO Should target returns AbsoluteUrl ?
  target: (params: any) => AbsoluteUrl;
  targetParams?: any;
  adapterConfig?: any;
};

export interface HttpClient {
  get: (config: HttpClientGetConfig) => Promise<HttpResponse>;
  post: (config: HttpClientPostConfig) => Promise<HttpResponse>;
  //get$: (config: HttpClientGetConfig) => Observable<HttpResponse>;
  //post$: (config: HttpClientPostConfig) => Observable<HttpResponse>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}

/*export type HttpClientPostConfig<TargetUrls extends string> = {
  target: TargetUrls;
  data?: string | undefined;
  adapterConfig?: any;
};

export type HttpClientGetConfig<TargetUrls extends string> = {
  target: TargetUrls;
  adapterConfig?: any;
};

export interface HttpClient {
  get: (config: HttpClientGetConfig<TargetUrls>) => Promise<HttpResponse>;
  post: (config: HttpClientPostConfig<TargetUrls>) => Promise<HttpResponse>;
  //get$: (config: HttpClientGetConfig) => Observable<HttpResponse>;
  //post$: (config: HttpClientPostConfig) => Observable<HttpResponse>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}*/
