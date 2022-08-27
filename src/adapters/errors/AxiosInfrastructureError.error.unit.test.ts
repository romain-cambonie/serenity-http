import {
  AxiosInfrastructureErrorCodes,
  isAxiosInfrastructureError,
  isTCPWrapperConnectionRefusedError,
  isTCPWrapperConnectionResetError,
  TCPWrapperErrorCodes
} from './AxiosInfrastructureError.error';

describe('AxiosInfrastructureError', () => {
  it.each([
    [{ code: 'ECONNREFUSED' as const }, true],
    [{ code: 'ECONNRESET' as const }, false],
    [{ code: 'ERR_BAD_OPTION_VALUE' as const }, false],
    [{ code: 'ERR_BAD_OPTION' as const }, false],
    [{ code: 'ECONNABORTED' as const }, false],
    [{ code: 'ETIMEDOUT' as const }, false],
    [{ code: 'ERR_NETWORK' as const }, false],
    [{ code: 'ERR_FR_TOO_MANY_REDIRECTS' as const }, false],
    [{ code: 'ERR_DEPRECATED' as const }, false],
    [{ code: 'ERR_BAD_RESPONSE' as const }, false],
    [{ code: 'ERR_BAD_REQUEST' as const }, false],
    [{ code: 'ERR_CANCELED' as const }, false],
    [{ code: 'ERR_NOT_SUPPORT' as const }, false],
    [{ code: 'ERR_INVALID_URL' as const }, false]
  ])(
    'Error is TCP Wrapper Connection Refused, expect: (%s to be %s)',
    (
      code: { code: TCPWrapperErrorCodes | AxiosInfrastructureErrorCodes },
      expected: boolean
    ) => {
      expect(isTCPWrapperConnectionRefusedError(code)).toBe(expected);
    }
  );

  it.each([
    [{ code: 'ECONNREFUSED' as const }, false],
    [{ code: 'ECONNRESET' as const }, true],
    [{ code: 'ERR_BAD_OPTION_VALUE' as const }, false],
    [{ code: 'ERR_BAD_OPTION' as const }, false],
    [{ code: 'ECONNABORTED' as const }, false],
    [{ code: 'ETIMEDOUT' as const }, false],
    [{ code: 'ERR_NETWORK' as const }, false],
    [{ code: 'ERR_FR_TOO_MANY_REDIRECTS' as const }, false],
    [{ code: 'ERR_DEPRECATED' as const }, false],
    [{ code: 'ERR_BAD_RESPONSE' as const }, false],
    [{ code: 'ERR_BAD_REQUEST' as const }, false],
    [{ code: 'ERR_CANCELED' as const }, false],
    [{ code: 'ERR_NOT_SUPPORT' as const }, false],
    [{ code: 'ERR_INVALID_URL' as const }, false]
  ])(
    'Error is TCP Wrapper Connection reset, expect: (%s to be %s)',
    (
      error: { code: TCPWrapperErrorCodes | AxiosInfrastructureErrorCodes },
      expected: boolean
    ) => {
      expect(isTCPWrapperConnectionResetError(error)).toBe(expected);
    }
  );

  it.each([
    [{ code: 'ECONNREFUSED' as const }, false],
    [{ code: 'ECONNRESET' as const }, false],
    [{ code: 'ERR_BAD_OPTION_VALUE' as const }, true],
    [{ code: 'ERR_BAD_OPTION' as const }, true],
    [{ code: 'ECONNABORTED' as const }, true],
    [{ code: 'ETIMEDOUT' as const }, true],
    [{ code: 'ERR_NETWORK' as const }, true],
    [{ code: 'ERR_FR_TOO_MANY_REDIRECTS' as const }, true],
    [{ code: 'ERR_DEPRECATED' as const }, true],
    [{ code: 'ERR_BAD_RESPONSE' as const }, true],
    [{ code: 'ERR_BAD_REQUEST' as const }, true],
    [{ code: 'ERR_CANCELED' as const }, true],
    [{ code: 'ERR_NOT_SUPPORT' as const }, true],
    [{ code: 'ERR_INVALID_URL' as const }, true]
  ])(
    'Error is Axios Infrastructure Error expect: (%s to be %s)',
    (
      code: { code: TCPWrapperErrorCodes | AxiosInfrastructureErrorCodes },
      expected: boolean
    ) => {
      expect(isAxiosInfrastructureError(code)).toBe(expected);
    }
  );
});
