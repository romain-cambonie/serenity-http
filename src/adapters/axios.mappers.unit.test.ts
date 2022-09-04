import type { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { HttpClientError, HttpServerError } from '../errors';
import type { Url, AdapterConfig, HttpClientTargetConfig } from '../httpClient';
import type { AxiosErrorWithResponse } from './axios.adapter';
import { shallowMergeConfigs, toHttpError } from './axios.mappers';

describe('Errors', (): void => {
  it.each([
    [{ status: 400 }, HttpClientError],
    [{ status: 404 }, HttpClientError],
    [{ status: 500 }, HttpServerError],
    [{ status: 503 }, HttpServerError]
  ])(
    'should return %s if status code is %d',
    // eslint-disable-next-line @typescript-eslint/no-shadow
    (status: { status: number }, expected: HttpServerError | typeof HttpClientError): void => {
      const dummy: AxiosErrorWithResponse = {
        config: {},
        isAxiosError: true,
        message: 'plop',
        name: '',
        response: {} as AxiosResponse,
        toJSON: (): object => ({ message: 'plop' })
      };

      const response: AxiosResponse = {
        ...{
          data: undefined,
          statusText: '',
          headers: {},
          config: {}
        },
        ...status
      };

      expect(toHttpError({ ...dummy, response })).toBeInstanceOf(expected);
    }
  );
});

describe('Configurations', (): void => {
  it('should shallow merge targetSpecificConfig into adapterConfig, replacing common keys config', (): void => {
    const defaultTimeout: number = 5000;
    const defaultHeaders: AxiosRequestHeaders = {
      accept: 'application/json',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'content-type': 'text/html; charset=UTF-8'
    };

    const defaultConfig: AdapterConfig = {
      timeout: defaultTimeout,
      headers: defaultHeaders
    };

    const targetSpecificConfig: HttpClientTargetConfig = {
      target: { makeUrl: (): Url => 'https://plop' },
      adapterConfig: {
        headers: {
          accept: 'text/html; charset=UTF-8'
        },
        timeoutErrorMessage: 'PLOP'
      }
    };

    const expected: AdapterConfig = {
      headers: {
        accept: 'text/html; charset=UTF-8'
      },
      timeout: defaultTimeout,
      timeoutErrorMessage: 'PLOP'
    };

    expect(shallowMergeConfigs(defaultConfig, targetSpecificConfig)).toStrictEqual(expected);
  });
});
