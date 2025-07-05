import { retryWithBackoff, chunkArray, cleanSizeValue   } from "../src/utils/helper";

// 👇 This mocks sleep so there's no real wait
jest.mock('../src/utils/helper', () => {
  const original = jest.requireActual('../src/utils/helper');
  return {
    ...original,
    sleep: jest.fn(() => Promise.resolve()),
  };
});

describe('retryWithBackoff', () => {
  it('returns result if first attempt succeeds', async () => {
    const fn = jest.fn().mockResolvedValue('done');
    const result = await retryWithBackoff(fn);
    expect(result).toBe('done');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries if first attempt fails and then succeeds', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('done');

    const result = await retryWithBackoff(fn, 3, 10);
    expect(result).toBe('done');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws if all retries fail', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fail'));

    await expect(retryWithBackoff(fn, 3, 10)).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});




describe('chunkArray', () => {
  it('splits array into equal chunks', () => {
    const result = chunkArray([1, 2, 3, 4], 2);
    expect(result).toEqual([[1, 2], [3, 4]]);
  });

  it('last chunk can be smaller', () => {
    const result = chunkArray([1, 2, 3, 4, 5], 2);
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns empty array if input is empty', () => {
    const result = chunkArray([], 2);
    expect(result).toEqual([]);
  });

  it('returns the whole array if chunk size is bigger than array', () => {
    const result = chunkArray([1, 2], 5);
    expect(result).toEqual([[1, 2]]);
  });
});



describe('cleanSizeValue', () => {
  it('cleans and removes duplicates', () => {
    const result = cleanSizeValue('M M L XL XL');
    expect(result).toBe('M L XL');
  });

  it('removes special characters and lowercases', () => {
    const result = cleanSizeValue('m, l / xl!');
    expect(result).toBe('M L XL');
  });

  it('handles extra spaces and mixed casing', () => {
    const result = cleanSizeValue('  xs  S s  M  ');
    expect(result).toBe('XS S M');
  });

  it('returns empty string if input is empty', () => {
    const result = cleanSizeValue('');
    expect(result).toBe('');
  });
});