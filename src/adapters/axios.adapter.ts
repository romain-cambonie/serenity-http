import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {
  AdapterConfig,
  ErrorMapper,
  getTargetFromPredicate,
  HttpClient,
  HttpClientGetConfig,
  HttpClientPostConfig,
  HttpResponse,
  TargetConfiguration
} from '../httpClient';

import { onFullfilledDefaultResponseInterceptorMaker, onRejectDefaultResponseInterceptorMaker } from './axios.config';
import { shallowMergeConfigs } from './axios.mappers';

export class ManagedAxios<TargetKinds extends string> implements HttpClient<TargetKinds> {
  constructor(
    public readonly targets: Record<TargetKinds, TargetConfiguration>,
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

  public async get(config: HttpClientGetConfig): Promise<HttpResponse> {
    const { axiosRequestConfig, onFulfilledResponseInterceptor, onRejectResponseInterceptor }: AxiosInstanceContext =
      this.clientInstanceContext(config);

    return ManagedAxios.workerInstance({
      axiosRequestConfig,
      onFulfilledResponseInterceptor,
      onRejectResponseInterceptor
    }).get(
      config.target.makeUrl(
        // TODO Did not find a way to narrow types : https://github.com/microsoft/TypeScript/issues/13995 related ?
        // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error,@typescript-eslint/ban-ts-comment
        // @ts-ignore
        config.targetParams
      )
    );
  }

  public async post(config: HttpClientPostConfig): Promise<HttpResponse> {
    const { axiosRequestConfig, onFulfilledResponseInterceptor, onRejectResponseInterceptor }: AxiosInstanceContext =
      this.clientInstanceContext(config);

    return ManagedAxios.workerInstance({
      axiosRequestConfig,
      onFulfilledResponseInterceptor,
      onRejectResponseInterceptor
    }).post(
      config.target.makeUrl(
        // TODO Did not find a way to narrow types : https://github.com/microsoft/TypeScript/issues/13995 related ?
        // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error,@typescript-eslint/ban-ts-comment
        // @ts-ignore
        config.targetParams
      ),
      config.data
    );
  }

  private readonly clientInstanceContext = (targetConfig: HttpClientGetConfig): AxiosInstanceContext => {
    const target: TargetKinds = getTargetFromPredicate(targetConfig.target.makeUrl, this.targets) as TargetKinds;
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

export type TargetErrorContext<Target extends string> = {
  target: Target;
  errorMapper: ErrorMapper<Target>;
};

export type ErrorInterceptorMaker = <Target extends string>(context: TargetErrorContext<Target>) => ErrorInterceptor;

type AxiosInstanceContext = {
  axiosRequestConfig: AxiosRequestConfig;
  onFulfilledResponseInterceptor: ResponseInterceptor;
  onRejectResponseInterceptor: ErrorInterceptor;
};

export type ContextType<Target extends string> = {
  config: AxiosRequestConfig;
  target: Target;
  errorMapper: ErrorMapper<Target>;
};
