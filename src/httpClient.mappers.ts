import { UnhandledError } from './errors';
import type { ErrorMapper } from './httpClient';

// TODO is there a way to handle abstract classe and inheritance ?
export const toMappedErrorMaker =
  <T extends string>(target: T, errorMapper: ErrorMapper<T> = {}) =>
  (error: Error): Error => {
    const errorByName: Partial<Record<T, (error: Error) => Error>> | undefined = errorMapper[target];
    if (errorByName === undefined) return error;

    const newErrorMaker: ((error: Error) => Error) | undefined = errorByName[error.name as T];

    if (newErrorMaker === undefined) return error;

    return newErrorMaker(error);
  };

export const toUnhandledError = (details: string, error: Error): Error =>
  new UnhandledError(`${details} - JSON Stringify tentative result -> ${extractErrorInfo(error)}`, error);

const extractErrorInfo = (error: Error): string => {
  try {
    return JSON.stringify(error);
  } catch (stringifyError: unknown) {
    const keys: string[] = Object.keys(error);
    return `Failed to JSON.stringify the error due to : ${(stringifyError as { message?: string }).message}. 
    Raw object keys : ${keys.length > 0 ? keys.join('\n') : 'Object.keys(error) returned an empty array'}`;
  }
};
