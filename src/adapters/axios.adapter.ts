import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {
  AbsoluteUrl,
  AdapterConfig,
  ErrorMapper,
  getTargetFromPredicate,
  HttpClient,
  HttpClientGetConfig,
  HttpClientPostConfig,
  HttpResponse,
  TargetParams
} from '../httpClient';

import { onFullfilledDefaultResponseInterceptorMaker, onRejectDefaultResponseInterceptorMaker } from './axios.config';
import { shallowMergeConfigs } from './axios.mappers';

export type AxiosErrorWithResponse = AxiosError & { response: AxiosResponse };

export type ResponseInterceptor = (response: AxiosResponse) => AxiosResponse;
export type ErrorInterceptor = (rawAxiosError: AxiosError) => never;

export interface TargetErrorContext<TargetUrls extends string> {
  target: TargetUrls;
  errorMapper: ErrorMapper<TargetUrls>;
}

export type ErrorInterceptorMaker = <TargetUrls extends string>(context: TargetErrorContext<TargetUrls>) => ErrorInterceptor;

interface AxiosInstanceContext {
  axiosRequestConfig: AxiosRequestConfig;
  onFulfilledResponseInterceptor: ResponseInterceptor;
  onRejectResponseInterceptor: ErrorInterceptor;
}

export interface ContextType<TargetUrls extends string> {
  config: AxiosRequestConfig;
  target: TargetUrls;
  errorMapper: ErrorMapper<TargetUrls>;
}

export class ManagedAxios<TargetUrls extends string> implements HttpClient<TargetUrls> {
  constructor(
    public readonly targetUrls: Record<TargetUrls, (params?: TargetParams) => AbsoluteUrl>,
    private readonly targetsErrorMapper: ErrorMapper<TargetUrls> = {},
    private readonly defaultRequestConfig: AxiosRequestConfig = {},
    private readonly onFulfilledResponseInterceptorMaker: (
      context: ContextType<TargetUrls>
    ) => ResponseInterceptor = onFullfilledDefaultResponseInterceptorMaker,
    private readonly onRejectResponseInterceptorMaker: (
      context: ContextType<TargetUrls>
    ) => (rawAxiosError: AxiosError) => never = onRejectDefaultResponseInterceptorMaker
  ) {}

  private static readonly workerInstance = (context: AxiosInstanceContext): AxiosInstance => {
    const axiosInstance: AxiosInstance = axios.create(context.axiosRequestConfig);

    axiosInstance.interceptors.response.use(context.onFulfilledResponseInterceptor, context.onRejectResponseInterceptor);

    return axiosInstance;
  };

  public async get(config: HttpClientGetConfig): Promise<HttpResponse> {
    const { axiosRequestConfig, onFulfilledResponseInterceptor, onRejectResponseInterceptor }: AxiosInstanceContext =
      this.clientInstanceContext(config);

    return ManagedAxios.workerInstance({
      axiosRequestConfig,
      onFulfilledResponseInterceptor,
      onRejectResponseInterceptor
    }).get(config.target(config.targetParams));
  }

  public async post(config: HttpClientPostConfig): Promise<HttpResponse> {
    const { axiosRequestConfig, onFulfilledResponseInterceptor, onRejectResponseInterceptor }: AxiosInstanceContext =
      this.clientInstanceContext(config);

    return ManagedAxios.workerInstance({
      axiosRequestConfig,
      onFulfilledResponseInterceptor,
      onRejectResponseInterceptor
    }).post(config.target(config.targetParams), config.data);
  }

  private readonly clientInstanceContext = (targetConfig: HttpClientGetConfig): AxiosInstanceContext => {
    const target: TargetUrls = getTargetFromPredicate(targetConfig.target, this.targetUrls) as TargetUrls;
    const mergedConfigs: AdapterConfig = shallowMergeConfigs(this.defaultRequestConfig, targetConfig);
    const context: ContextType<TargetUrls> = {
      config: mergedConfigs,
      target,
      errorMapper: this.targetsErrorMapper
    };

    const onFulfilledResponseInterceptor: ResponseInterceptor = this.onFulfilledResponseInterceptorMaker(context);

    const onRejectResponseInterceptor: (rawAxiosError: AxiosError) => never = this.onRejectResponseInterceptorMaker(context);

    return {
      axiosRequestConfig: mergedConfigs,
      onFulfilledResponseInterceptor,
      onRejectResponseInterceptor
    };
  };
}
