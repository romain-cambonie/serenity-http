import type { FeatureCollection, Point } from 'geojson';
import { HttpClientError, TypeguardError } from '../errors';
import type { ErrorMapper, HttpClient, HttpResponse, Targets, Url } from '../httpClient';
import { ManagedAxios } from './axios.adapter';

// Using the GeoJson standard: https://geojson.org/
type ApiAdresseFeatureCollection = FeatureCollection<Point, ApiAdresseProperties>;

type ApiAdresseProperties = {
  city: string;
  citycode: string;
  context: string;
  housenumber: string;
  id: string;
  importance: number;
  label: string;
  name: string;
  postcode: string;
  score: number;
  street: string;
  type: string;
  x: number;
  y: number;
};

describe('httpClient with axios concrete adapter', (): void => {
  const validAddressSearchUrlMaker = (params: { query: string }): Url =>
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURI(params.query)}&limit=1`;

  // eslint-disable-next-line complexity
  const apiAdresseFCTypeguard = (data: unknown): data is ApiAdresseFeatureCollection =>
    data != null &&
    typeof data === 'object' &&
    'city' in data &&
    'citycode' in data &&
    'context' in data &&
    'housenumber' in data &&
    'id' in data &&
    'importance' in data &&
    'label' in data &&
    'name' in data &&
    'postcode' in data &&
    'score' in data &&
    'street' in data &&
    'type' in data &&
    'x' in data &&
    'y' in data;

  const expectedData: ApiAdresseFeatureCollection = {
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
    type: 'FeatureCollection'
  };

  it('expect user defined function to produce absolute url', (): void => {
    expect(validAddressSearchUrlMaker({ query: '18 avenue des Canuts 69120' })).toBe(
      `https://api-adresse.data.gouv.fr/search/?q=18%20avenue%20des%20Canuts%2069120&limit=1`
    );
  });

  it('should call API Adresse and return 200 with data', async (): Promise<void> => {
    type Target = 'ADRESSE_API_FORWARD_GEOCODING';
    const addresseApiTarget: Targets<Target> = {
      ADRESSE_API_FORWARD_GEOCODING: {
        adapterConfig: { method: 'get' },
        makeUrl: validAddressSearchUrlMaker,
        externalContractTypeguard: apiAdresseFCTypeguard
      }
    };

    const httpClient: HttpClient<Target> = new ManagedAxios(addresseApiTarget);

    const response: HttpResponse<ApiAdresseFeatureCollection> = await httpClient.execute<ApiAdresseFeatureCollection>({
      target: 'ADRESSE_API_FORWARD_GEOCODING',
      urlParams: { query: '18 avenue des Canuts 69120' }
    });

    expect(response.data).toMatchObject(expectedData);
  });

  it('should call API Adresse with invalid endpoint that throw HttpClientError', async (): Promise<void> => {
    type Target = 'ADRESSE_API_FORWARD_GEOCODING';

    const targetToInvalidSearchUrl = (): Url => `https://api-adresse.data.gouv.fr/search/?d=plop&limit=1`;

    const addresseApiTarget: Targets<Target> = {
      ADRESSE_API_FORWARD_GEOCODING: {
        adapterConfig: { method: 'get' },
        makeUrl: targetToInvalidSearchUrl,
        externalContractTypeguard: apiAdresseFCTypeguard
      }
    };

    const httpClient: HttpClient<Target> = new ManagedAxios(addresseApiTarget);

    const responsePromise: Promise<HttpResponse<ApiAdresseFeatureCollection>> = httpClient.execute<ApiAdresseFeatureCollection>(
      {
        target: 'ADRESSE_API_FORWARD_GEOCODING',
        urlParams: { query: '18 avenue des Canuts 69120' }
      }
    );

    await expect(responsePromise).rejects.toThrow(HttpClientError);
  });

  it('should call API Adresse with invalid address and throw remapped CustomError', async (): Promise<void> => {
    class CustomError extends Error {}

    type Target = 'ADRESSE_API_FORWARD_GEOCODING';

    const targetToInvalidSearchUrl = (): Url => `https://api-adresse.data.gouv.fr/search/?d=plop&limit=1`;

    const addresseApiTarget: Targets<Target> = {
      ADRESSE_API_FORWARD_GEOCODING: {
        adapterConfig: { method: 'get' },
        makeUrl: targetToInvalidSearchUrl,
        externalContractTypeguard: apiAdresseFCTypeguard
      }
    };

    const targetsErrorResponseOverrideMapper: ErrorMapper<Target> = {
      ADRESSE_API_FORWARD_GEOCODING: {
        HttpClientError: (error: Error): Error =>
          new CustomError(`You have an invalid url you dummy dum dum ! ${error.message}`),
        HttpServerError: (error: Error): Error =>
          new Error(`You have an invalid url HttpServerError you dummy dum dum ! ${error.message}`)
      }
    };

    const httpClient: HttpClient<Target> = new ManagedAxios(addresseApiTarget, targetsErrorResponseOverrideMapper);

    const responsePromise: Promise<HttpResponse<ApiAdresseFeatureCollection>> = httpClient.execute<ApiAdresseFeatureCollection>(
      {
        target: 'ADRESSE_API_FORWARD_GEOCODING',
        urlParams: { query: '18 avenue des Canuts 69120' }
      }
    );

    await expect(responsePromise).rejects.toThrow(CustomError);
  });

  it('should throw a ValidationError if the typeguard does not pass', async (): Promise<void> => {
    type Target = 'ADRESSE_API_FORWARD_GEOCODING';

    const nomanTypeguard = (data: unknown): data is ApiAdresseFeatureCollection => false;

    const addresseApiTarget: Targets<Target> = {
      ADRESSE_API_FORWARD_GEOCODING: {
        adapterConfig: { method: 'get' },
        makeUrl: validAddressSearchUrlMaker,
        externalContractTypeguard: nomanTypeguard
      }
    };

    const httpClient: HttpClient<Target> = new ManagedAxios(addresseApiTarget);

    const responsePromise: Promise<HttpResponse<ApiAdresseFeatureCollection>> = httpClient.execute<ApiAdresseFeatureCollection>(
      {
        target: 'ADRESSE_API_FORWARD_GEOCODING',
        urlParams: { query: '18 avenue des Canuts 69120' }
      }
    );

    await expect(responsePromise).rejects.toThrow(TypeguardError);
  });
});
