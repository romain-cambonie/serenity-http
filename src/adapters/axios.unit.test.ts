import axios from 'axios';

describe('Error Response format', (): void => {
  it.each([
    [{ response: {} }, false],
    [
      {
        isAxiosError: false
      },
      false
    ],
    [
      {
        isAxiosError: true
      },
      true
    ],
    [
      {
        response: {
          status: 400
        },
        isAxiosError: true
      },
      true
    ]
  ])(
    'isAxiosError should detect if the response has a valid format, expect: (%s to be %s)',
    (raw: object, expected: boolean): void => {
      expect(axios.isAxiosError(raw)).toBe(expected);
    }
  );
});
