import { AxiosRequestHeaders, AxiosResponse } from "axios";
import { HttpClientError, HttpServerError } from "../errors";
import { AdapterConfig, HttpClientTargetConfig } from "../httpClient";
import { AxiosErrorWithResponse } from "./axios.adapter";
import { shallowMergeConfigs, toHttpError } from "./axios.mappers";

describe("Errors", () => {


  it.each([
    [{ status: 400 }, HttpClientError],
    [{ status: 404 }, HttpClientError],
    [{ status: 500 }, HttpServerError],
    [{ status: 503 }, HttpServerError],
    ])("should return %s if status code is %d", (status: { status:number }, expected: typeof HttpClientError | HttpServerError) => {

    const dummy: AxiosErrorWithResponse = {
      config: {},
      isAxiosError: true,
      message: "plop",
      name: "",
      response: {} as AxiosResponse,
      toJSON: () => ({ message: "plop" })
    }

    const response: AxiosResponse = {
      ...{
        data: undefined,
        statusText: "",
        headers: {},
        config: {},
      },
      ...status
    } ;

    expect(toHttpError({ ...dummy, response })).toBeInstanceOf(expected);
  });
});

describe("Configurations", () => {
  it("should shallow merge targetSpecificConfig into adapterConfig, replacing common keys config", () => {
      const defaultTimeout: number = 5000;
      const defaultHeaders: AxiosRequestHeaders =  {
        "accept": "application/json",
        "content-type": "text/html; charset=UTF-8"
    };

      const defaultConfig: AdapterConfig = {
        timeout: defaultTimeout,
        headers: defaultHeaders
      };

      const targetSpecificConfig: HttpClientTargetConfig = {
        target: () => "https://plop",
        adapterConfig: {
          headers: {
            "accept": "text/html; charset=UTF-8",
          },
          timeoutErrorMessage: "PLOP"
        }
      };

      const expected: AdapterConfig = {
        headers: {
          "accept": "text/html; charset=UTF-8",
        },
        timeout: defaultTimeout,
        timeoutErrorMessage: "PLOP"
      }

      expect(shallowMergeConfigs(defaultConfig, targetSpecificConfig)).toStrictEqual(expected);
  });
});