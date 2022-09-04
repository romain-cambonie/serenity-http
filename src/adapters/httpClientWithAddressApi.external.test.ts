import { HttpClientError } from '../errors';
import type { ValidUrl, ErrorMapper, HttpClient, HttpResponse, Targets, ResolvedUrl, HttpClientGetConfig } from '../httpClient';
import { ManagedAxios } from './axios.adapter';

describe('httpClient with axios concrete adapter', (): void => {
  it('expect user defined function to produce absolute url', (): void => {
    const searchUrlMaker: ResolvedUrl<string> = (rawQueryString: string): ValidUrl =>
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURI(rawQueryString)}&limit=1`;

    expect(searchUrlMaker('18 avenue des Canuts 69120')).toBe(
      `https://api-adresse.data.gouv.fr/search/?q=18%20avenue%20des%20Canuts%2069120&limit=1`
    );
  });

  it('should call API Adresse and return 200 with data', async (): Promise<void> => {
    const searchUrlMaker: ResolvedUrl<string> = (rawQueryString: string): ValidUrl =>
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURI(rawQueryString)}&limit=1`;

    type TargetKinds = 'ADRESSE_API_ENDPOINT';
    const targetUrls: Targets<TargetKinds> = {
      ADRESSE_API_ENDPOINT: { url: searchUrlMaker }
    };

    const httpClient: HttpClient<TargetKinds> = new ManagedAxios(targetUrls);

    const clientGetConfig: HttpClientGetConfig<string> = {
      target: targetUrls.ADRESSE_API_ENDPOINT.url,
      targetParams: '18 avenue des Canuts 69120'
    };

    const response: HttpResponse = await httpClient.get(clientGetConfig);

    const expectedStatus: number = 200;
    const expectedData: object = {
      attribution: 'BAN',
      features: [
        {
          geometry: {
            coordinates: [4.923847, 45.761134],
            type: 'Point'
          },
          properties: {
            city: 'Vaulx-en-Velin',
            citycode: '69256',
            context: '69, Rhône, Auvergne-Rhône-Alpes',
            housenumber: '18',
            id: '69256_0227_00018',
            importance: 0.62418,
            label: '18 Avenue des Canuts 69120 Vaulx-en-Velin',
            name: '18 Avenue des Canuts',
            postcode: '69120',
            score: 0.8749254545454545,
            street: 'Avenue des Canuts',
            type: 'housenumber',
            x: 849523.68,
            y: 6519769.27
          },
          type: 'Feature'
        }
      ],
      licence: 'ETALAB-2.0',
      limit: 1,
      query: '18 avenue des Canuts 69120',
      type: 'FeatureCollection',
      version: 'draft'
    };

    expect(response.status).toBe(expectedStatus);
    expect(response.data).toStrictEqual(expectedData);
  });

  it('should call API Adresse with invalid address and throw HttpClientError', async (): Promise<void> => {
    type TargetUrls = 'ADDRESS_API_SEARCH_ENDPOINT';

    const invalidUrlMaker: ResolvedUrl<string> = (rawQueryString: string): ValidUrl =>
      `https://api-adresse.data.gouv.fr/search/?d=${rawQueryString}&limit=1`;

    const targetUrls: Targets<TargetUrls> = {
      ADDRESS_API_SEARCH_ENDPOINT: { url: invalidUrlMaker }
    };

    const httpClient: HttpClient<TargetUrls> = new ManagedAxios(targetUrls);

    const responsePromise: Promise<HttpResponse> = httpClient.get({
      target: targetUrls.ADDRESS_API_SEARCH_ENDPOINT.url,
      targetParams: '18 avenue des Canuts 69120'
    });

    await expect(responsePromise).rejects.toThrow(HttpClientError);
  });

  it('should call API Adresse with invalid address and throw remapped CustomError', async (): Promise<void> => {
    class CustomError extends Error {}

    type TargetKinds = 'ADDRESS_API_SEARCH_ENDPOINT';

    const invalidUrlMaker: ResolvedUrl<string> = (rawQueryString: string): ValidUrl =>
      `https://api-adresse.data.gouv.fr/search/?d=${rawQueryString}&limit=1`;

    const targetUrls: Targets<TargetKinds> = {
      ADDRESS_API_SEARCH_ENDPOINT: { url: invalidUrlMaker }
    };

    const targetsErrorResponseOverrideMapper: ErrorMapper<TargetKinds> = {
      ADDRESS_API_SEARCH_ENDPOINT: {
        HttpClientError: (error: Error): Error =>
          new CustomError(`You have an invalid url you dummy dum dum ! ${error.message}`),
        HttpServerError: (error: Error): Error =>
          new Error(`You have an invalid url HttpServerError you dummy dum dum ! ${error.message}`)
      }
    };

    const httpClient: HttpClient<TargetKinds> = new ManagedAxios(targetUrls, targetsErrorResponseOverrideMapper);

    const responsePromise: Promise<HttpResponse> = httpClient.get({
      target: targetUrls.ADDRESS_API_SEARCH_ENDPOINT.url,
      targetParams: '18 avenue des Canuts 69120'
    });

    await expect(responsePromise).rejects.toThrow(CustomError);
  });

  it('Error log should contain enough info to help debug', async (): Promise<void> => {
    type TargetUrls = 'ADDRESS_API_SEARCH_ENDPOINT';

    const invalidUrlMaker: ResolvedUrl<string> = (rawQueryString: string): ValidUrl =>
      `https://api-adresse.data.gouv.fr/search/?d=${rawQueryString as string}&limit=1`;

    const targetUrls: Targets<TargetUrls> = {
      ADDRESS_API_SEARCH_ENDPOINT: { url: invalidUrlMaker }
    };

    const httpClient: HttpClient<TargetUrls> = new ManagedAxios(targetUrls);

    const expectedMessage: Record<string, unknown> = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _response: {
        data: {
          title: 'Missing query',
          description: 'Missing query'
        },
        status: 400,
        headers: {
          server: expect.any(String),
          date: expect.any(String),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'content-type': 'application/json; charset=UTF-8',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'content-length': '58',
          connection: 'close',
          vary: 'Accept'
        }
      },
      requestConfig: {
        url: 'https://api-adresse.data.gouv.fr/search/?d=18 avenue des Canuts 69120&limit=1',
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Accept: 'application/json, text/plain, */*',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'User-Agent': 'axios/0.26.1'
        },
        method: 'get',
        timeout: 0
      },
      request: expect.any(Object)
    };

    const error: Error | HttpClientError = await getError<HttpClientError>(
      async (): Promise<HttpResponse> =>
        httpClient.get({
          target: targetUrls.ADDRESS_API_SEARCH_ENDPOINT.url,
          targetParams: '18 avenue des Canuts 69120'
        })
    );

    expect(error).toBeInstanceOf(HttpClientError);
    expect(JSON.parse(error.message)).toMatchObject(expectedMessage);
  });
});

const getError = async <TError>(call: () => unknown): Promise<Error | TError> => {
  try {
    await call();
    return new Error();
  } catch (error: unknown) {
    return error as TError;
  }
};
