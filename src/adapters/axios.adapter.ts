import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {
  AdapterConfig,
  ErrorMapper,
  getFullyQualifiedUrl,
  getTargetFromPredicate,
  HttpClient,
  HttpClientGetConfig,
  HttpClientPostConfig,
  HttpResponse,
  Targets,
  TargetUrlParams
} from '../httpClient';

import { onFullfilledDefaultResponseInterceptorMaker, onRejectDefaultResponseInterceptorMaker } from './axios.config';
import { shallowMergeConfigs } from './axios.mappers';

export class ManagedAxios<TargetKinds extends string> implements HttpClient<TargetKinds> {
  constructor(
    public readonly targets: Targets<TargetKinds>,
    private readonly targetsErrorMapper: ErrorMapper<TargetKinds> = {},
    private readonly defaultRequestConfig: AxiosRequestConfig = {},
    private readonly onFulfilledResponseInterceptorMaker: (
      context: ContextType<TargetKinds>
    ) => ResponseInterceptor = onFullfilledDefaultResponseInterceptorMaker,
    private readonly onRejectResponseInterceptorMaker: (
      context: ContextType<TargetKinds>
    ) => (rawAxiosError: AxiosError) => never = onRejectDefaultResponseInterceptorMaker
  ) {}

  private static readonly workerInstance = (context: AxiosInstanceContext): AxiosInstance => {
    const axiosInstance: AxiosInstance = axios.create(context.axiosRequestConfig);

    axiosInstance.interceptors.response.use(context.onFulfilledResponseInterceptor, context.onRejectResponseInterceptor);

    return axiosInstance;
  };

  public async get(config: HttpClientGetConfig<TargetUrlParams>): Promise<HttpResponse> {
    const { axiosRequestConfig, onFulfilledResponseInterceptor, onRejectResponseInterceptor }: AxiosInstanceContext =
      this.clientInstanceContext(config);

    return ManagedAxios.workerInstance({
      axiosRequestConfig,
      onFulfilledResponseInterceptor,
      onRejectResponseInterceptor
    }).get(getFullyQualifiedUrl(config.target, config.targetParams));
  }

  public async post(config: HttpClientPostConfig<TargetUrlParams>): Promise<HttpResponse> {
    const { axiosRequestConfig, onFulfilledResponseInterceptor, onRejectResponseInterceptor }: AxiosInstanceContext =
      this.clientInstanceContext(config);

    return ManagedAxios.workerInstance({
      axiosRequestConfig,
      onFulfilledResponseInterceptor,
      onRejectResponseInterceptor
    }).post(getFullyQualifiedUrl(config.target, config.targetParams), config.data);
  }

  private readonly clientInstanceContext = (targetConfig: HttpClientGetConfig<TargetUrlParams>): AxiosInstanceContext => {
    const target: TargetKinds = getTargetFromPredicate(targetConfig.target, this.targets);
    const mergedConfigs: AdapterConfig = shallowMergeConfigs(this.defaultRequestConfig, targetConfig);
    const context: ContextType<TargetKinds> = {
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
