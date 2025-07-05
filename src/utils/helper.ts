/**
 * 
 * @param ms the number of milliseconds to sleep
 * @returns A promise that resolves after the specified time. 
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * 
 * @param fn the function to retry
 * @param retries the number of retries
 * @param initialDelay the initial delay in milliseconds
 * @returns A promise that resolves with the result of the function or rejects after max retries.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  initialDelay = 1000
): Promise<T> {
  let delay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`Retrying after ${delay}ms...`);
      await sleep(delay);
      delay *= 2; // exponential backoff
    }
  }
  throw new Error("Max retries reached");
}


/**
 * 
 * @param value the size value to parse
 * @returns A string if only one size is present, or an object with inch and cm values if both are found.
 */
export function parseSizeValue(value: string): string | { inch: string, cm: string } {
  // Remove unwanted characters and normalize
  value = value.replace(/\s+/g, " ").trim().toLowerCase();

  // If both inch and cm are present, try to separate
  const regex = /(\d{2,3})\s?(\d{2,3})/g;
  const match = regex.exec(value);

  if (match) {
    const [_, v1, v2] = match;

    const n1 = parseInt(v1);
    const n2 = parseInt(v2);

    const inch = (n1 <= 50) ? v1 : (n2 <= 50) ? v2 : null;
    const cm = (n1 > 50) ? v1 : (n2 > 50) ? v2 : null;

    if (inch && cm) {
      return { inch, cm };
    }
  }

  return value; // fallback as string
}


/**
 * 
 * @param arr the array to chunk
 * @param size size of each chunk
 * @template T The desired size of each chunk.
 * @returns  An array of chunks, where each chunk is an array of type T.
 */
export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}



/**
 * 
 * @param raw the raw size value to clean
 * @returns A cleaned size value string with duplicates removed. 
 */
export function cleanSizeValue(raw: string): string {
  const parts = raw
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "") // remove weird chars
    .split(/\s+/)
    .filter(Boolean);

  const unique = Array.from(new Set(parts));
  return unique.join(" ");
}


