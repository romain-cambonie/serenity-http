/* eslint-disable @typescript-eslint/no-magic-numbers */

import {
  ValidUrl,
  getTargetFromPredicate,
  isHttpClientError,
  isHttpServerError,
  Targets,
  ResolvedUrl,
  getFullyQualifiedUrl
} from './httpClient';

describe('Http Client Errors', (): void => {
  it.each([
    [100, false],
    [308, false],
    [399, false],
    [400, true],
    [451, true],
    [499, true],
    [500, false],
    [502, false]
  ])(
    'isHttpClientErrorStatus should detect HttpClient 4XX errors, expect: (%i to be %s)',
    (httpStatusCode: number, expected: boolean): void => {
      expect(isHttpClientError(httpStatusCode)).toBe(expected);
    }
  );
});

describe('Http Server Errors', (): void => {
  it.each([
    [100, false],
    [308, false],
    [399, false],
    [400, false],
    [451, false],
    [499, false],
    [500, true],
    [502, true],
    [511, true],
    [600, false]
  ])(
    'isHttpServerErrorStatus should detect Http Server 5XX errors, expect: (%i to be %s)',
    (httpStatusCode: number, expected: boolean): void => {
      expect(isHttpServerError(httpStatusCode)).toBe(expected);
    }
  );
});

describe('return valid url from string or callback', (): void => {
  it('should return the url as a valid url from target configuration and target kind', (): void => {
    const apiAdresseSearchUrl: ResolvedUrl<string> = (rawQueryString: string): ValidUrl =>
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURI(rawQueryString)}&limit=1`;

    const apiAdresseSearchRandom: ResolvedUrl = (): ValidUrl =>
      `https://api-adresse.data.gouv.fr/search/?q=${Math.random()}&limit=1`;

    const apiGeoListCommunesUrl: ResolvedUrl = `https://geo.api.gouv.fr/communes`;

    expect(getFullyQualifiedUrl(apiGeoListCommunesUrl)).toBe('https://geo.api.gouv.fr/communes');
    expect(getFullyQualifiedUrl(apiAdresseSearchUrl, '8 chemin du Ban, 69120')).toBe(
      'https://api-adresse.data.gouv.fr/search/?q=8+chemin+du+Ban,+69120&limit=1'
    );
    expect(getFullyQualifiedUrl(apiAdresseSearchRandom)).toBe(
      'https://api-adresse.data.gouv.fr/search/?q=8+chemin+du+Ban,+69120&limit=1'
    );
  });
});

describe('find target from callback', (): void => {
  it('getTargetFromPredicate should return', (): void => {
    type TargetUrls = 'ADDRESS_API_SEARCH' | 'GEO_API_COMMUNES';

    const apiAdresseSearchUrl: ResolvedUrl<string> = (rawQueryString: string): ValidUrl =>
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURI(rawQueryString)}&limit=1`;

    const apiGeoListCommunesUrl: ValidUrl = `https://geo.api.gouv.fr/communes`;

    const targetUrls: Targets<TargetUrls> = {
      ADDRESS_API_SEARCH: { url: apiAdresseSearchUrl },
      GEO_API_COMMUNES: { url: apiGeoListCommunesUrl }
    };

    expect(getTargetFromPredicate(apiAdresseSearchUrl, targetUrls)).toBe('ADDRESS_API_SEARCH');

    expect(getTargetFromPredicate(apiGeoListCommunesUrl, targetUrls)).toBe('ADDRESS_API_GEOLOCATE');
  });
});
