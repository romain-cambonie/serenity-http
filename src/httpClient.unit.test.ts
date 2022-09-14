/* eslint-disable @typescript-eslint/no-magic-numbers */

import { getTargetFromPredicate, isHttpClientError, isHttpServerError, Targets, Url, UrlMaker } from './httpClient';

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

describe('find target from callback', (): void => {
  it('getTargetFromPredicate should return', (): void => {
    type Target = 'ADDRESS_API_GEOLOCATE' | 'ADDRESS_API_SEARCH';

    const targetToValidSearchUrl: UrlMaker = (params: { query: string }): Url =>
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURI(params.query)}&limit=1`;

    const targetToGeolocateUrl = (): Url => `https://geo.api.gouv.fr/communes`;

    const targetUrls: Targets<Target> = {
      ADDRESS_API_SEARCH: { makeUrl: targetToValidSearchUrl },
      ADDRESS_API_GEOLOCATE: { makeUrl: targetToGeolocateUrl }
    };

    expect(getTargetFromPredicate(targetUrls.ADDRESS_API_SEARCH.makeUrl, targetUrls)).toBe('ADDRESS_API_SEARCH');

    expect(getTargetFromPredicate(targetUrls.ADDRESS_API_GEOLOCATE.makeUrl, targetUrls)).toBe('ADDRESS_API_GEOLOCATE');
  });
});
