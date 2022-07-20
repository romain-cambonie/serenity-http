import axios from "axios";
import { AbsoluteUrl } from "../httpClient";
import { isValidAxiosErrorResponse } from "./axios.port";

describe("Error Response format", () => {
  it.each([
    [{ response: {} }, false],
    [
      {
        isAxiosError: false,
      },
      false,
    ],
    [
      {
        isAxiosError: true,
      },
      true,
    ],
    [
      {
        response: {
          status: 400,
        },
        isAxiosError: true,
      },
      true,
    ],
  ])(
    "isAxiosError should detect if the response has a valid format, expect: (%s to be %s)",
    (raw: any, expected: boolean) => {
      expect(axios.isAxiosError(raw)).toBe(expected);
    },
  );

  it.each([
    [null, false],
    ["plop", false],
    [{}, false],
    [
      {
        request: { status: "plop" },
      },
      false,
    ],
    [[], false],
    [[{}], false],
    [{}, false],
    [
      {
        data: "",
        status: 400,
      },
      true,
    ],
    [
      {
        data: "plop",
        status: 400,
      },
      true,
    ],
    [
      {
        data: {
          prop: "A nested property",
        },
        status: 400,
      },
      true,
    ],
  ])(
    "isAxiosResponse should detect if the response has a valid response structure code, expect: (%s to be %s)",
    (raw: any, expected: boolean) => {
      expect(isValidAxiosErrorResponse(raw)).toBe(expected);
    },
  );
});

/*describe("find target from callback, gear 2", () => {
  it("getTargetFromPredicate should return", () => {
    type TargetUrls = "ADDRESS_API_SEARCH" | "ADDRESS_API_GEOLOCATE";

    const targetToValidSearchUrl = (rawQueryString: string): AbsoluteUrl =>
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURI(
        rawQueryString,
      )}&limit=1`;

    const targetToGeolocateUrl = (): AbsoluteUrl =>
      `https://geo.api.gouv.fr/communes`;

    const targetUrls: TargetUrlsMapper<TargetUrls> = {
      ADDRESS_API_SEARCH: targetToValidSearchUrl,
      ADDRESS_API_GEOLOCATE: targetToGeolocateUrl,
    };

    expect(getTargetFromPredicate(targetToValidSearchUrl, targetUrls)).toBe(
      "ADDRESS_API_SEARCH",
    );

    expect(getTargetFromPredicate(targetToGeolocateUrl, targetUrls)).toBe(
      "ADDRESS_API_GEOLOCATE",
    );
  });
});*/
