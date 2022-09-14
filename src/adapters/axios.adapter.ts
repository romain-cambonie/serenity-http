import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ConfigurationError, TypeguardError } from '../errors';

import {
  AdapterConfig,
  ErrorMapper,
  getTargetFromPredicate,
  HttpClient,
  HttpResponse,
  RequestTarget,
  TargetConfiguration,
  UnknownHttpResponse
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

  public async execute<ExternalContract>({
    target,
    urlParams,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data
  }: RequestTarget<TargetKinds>): Promise<HttpResponse<ExternalContract>> {
    const targetConfig: TargetConfiguration = this.targets[target];
    const { axiosRequestConfig, onFulfilledResponseInterceptor, onRejectResponseInterceptor }: AxiosInstanceContext =
      this.clientInstanceContext(targetConfig);

    const response: UnknownHttpResponse = await ManagedAxios.workerInstance({
      axiosRequestConfig,
      onFulfilledResponseInterceptor,
      onRejectResponseInterceptor
    }).request({
      url: targetConfig.makeUrl(urlParams),
      method: axiosRequestConfig.method,
      data
    });

    if (targetConfig.externalContractTypeguard != null && !targetConfig.externalContractTypeguard(response.data))
      throw new TypeguardError(
        `Got response but data does not validate the typeguard, received:\n ${JSON.stringify(response.data, null, 2)}`
      );

    return response as HttpResponse<ExternalContract>;
  }

  private static readonly workerInstance = (context: AxiosInstanceContext): AxiosInstance => {
    const axiosInstance: AxiosInstance = axios.create(context.axiosRequestConfig);

    axiosInstance.interceptors.response.use(context.onFulfilledResponseInterceptor, context.onRejectResponseInterceptor);

    return axiosInstance;
  };

  private readonly clientInstanceContext = (targetConfig: TargetConfiguration): AxiosInstanceContext => {
    const target: TargetKinds = getTargetFromPredicate(targetConfig.makeUrl, this.targets) as TargetKinds;
    const mergedConfigs: AdapterConfig = shallowMergeConfigs(this.defaultRequestConfig, targetConfig.adapterConfig ?? {});
    if (!validConfig(mergedConfigs))
      throw new ConfigurationError(`Invalid minimal configuration: should at least contain 'method' key`);
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

const validConfig = (config: AdapterConfig): boolean => 'method' in config;
