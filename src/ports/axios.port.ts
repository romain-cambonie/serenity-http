import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { ConfigurationError } from "../errors/InfrastructureError.error";
import {
  AbsoluteUrl,
  ErrorMapper,
  HttpClient,
  HttpClientGetConfig,
  HttpClientPostConfig,
  HttpResponse,
} from "../httpClient";
import {
  onFullfilledDefaultResponseInterceptorMaker,
  onRejectDefaultResponseInterceptorMaker,
} from "./axios.config";

export type AxiosErrorWithResponse = AxiosError & { response: AxiosResponse };

type AxiosInstanceContext = {
  axiosRequestConfig: AxiosRequestConfig;
  onFulfilledResponseInterceptor: (response: AxiosResponse) => AxiosResponse;
  onRejectResponseInterceptor: (rawAxiosError: AxiosError) => never;
};

export class ManagedAxios<TargetUrls extends string> implements HttpClient {
  constructor(
    //prettier-ignore
    private readonly targetsUrls: Record<TargetUrls, (params: any) => AbsoluteUrl>,
    //prettier-ignore
    private readonly targetsErrorResponseOverrideMapper: ErrorMapper<TargetUrls> = {},
    //prettier-ignore
    private readonly defaultRequestConfig: AxiosRequestConfig = {},
    //prettier-ignore
    private readonly onFulfilledResponseInterceptorMaker:
      (context: any) =>
        (response: AxiosResponse) => AxiosResponse =
          onFullfilledDefaultResponseInterceptorMaker,
    //prettier-ignore
    private readonly onRejectResponseInterceptorMaker:
      (context: any) =>
        (rawAxiosError: AxiosError) => never =
          onRejectDefaultResponseInterceptorMaker,
  ) {}

  /*  public static createManagedInstance<TargetUrls extends string>(
    targetsUrlsMapper: TargetUrlsMapper<TargetUrls>,
    //targetsErrorResponseOverrideMapper: ErrorMapper<TargetUrls> = {},
    axiosRequestConfig: AxiosRequestConfig = {},
    onFulfilledResponseInterceptorMaker: (response: AxiosResponse) => AxiosResponse,
    onRejectResponseInterceptorMaker: (rawAxiosError: AxiosError) => never,
  ): HttpClient {
    return new ManagedAxios({});
  }*/

  private static workerInstance = (
    context: AxiosInstanceContext,
  ): AxiosInstance => {
    const axiosInstance = axios.create(context.axiosRequestConfig);

    //TODO Add request interceptors ?
    /*    axiosInstance.interceptors.request.use(
      axiosValidRequestInterceptor(targetsUrlsMapper),
      axiosErrorRequestInterceptor,
    );*/

    axiosInstance.interceptors.response.use(
      context.onFulfilledResponseInterceptor,
      context.onRejectResponseInterceptor,
    );

    return axiosInstance;
  };

  async get(config: HttpClientGetConfig): Promise<HttpResponse> {
    const {
      axiosRequestConfig,
      onFulfilledResponseInterceptor,
      onRejectResponseInterceptor,
    } = this.clientInstanceContext(config);

    return ManagedAxios.workerInstance({
      axiosRequestConfig,
      onFulfilledResponseInterceptor,
      onRejectResponseInterceptor,
    }).get(config.target(config.targetParams));
  }

  async post(config: HttpClientPostConfig): Promise<HttpResponse> {
    const {
      axiosRequestConfig,
      onFulfilledResponseInterceptor,
      onRejectResponseInterceptor,
    } = this.clientInstanceContext(config);

    return ManagedAxios.workerInstance({
      axiosRequestConfig,
      onFulfilledResponseInterceptor,
      onRejectResponseInterceptor,
    }).post(config.target(config.targetParams), config.data);
  }

  private clientInstanceContext = (
    targetConfig: HttpClientGetConfig,
  ): AxiosInstanceContext => {
    const target: TargetUrls = getTargetFromPredicate(
      targetConfig.target,
      this.targetsUrls,
    ) as TargetUrls;
    const mergedConfigs = { ...this.defaultRequestConfig, ...targetConfig };
    const onFulfilledResponseInterceptor =
      this.onFulfilledResponseInterceptorMaker({
        config: { ...this.defaultRequestConfig, ...targetConfig },
        target,
      });

    const onRejectResponseInterceptor = this.onRejectResponseInterceptorMaker({
      target,
      config: { ...this.defaultRequestConfig, ...targetConfig },
    });
    return {
      axiosRequestConfig: mergedConfigs,
      onFulfilledResponseInterceptor,
      onRejectResponseInterceptor,
    };
  };
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
