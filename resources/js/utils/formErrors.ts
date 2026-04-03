import type { AxiosError } from 'axios';

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function extractFieldErrors(error: unknown): Record<string, string> {
  const axiosError = error as AxiosError<{ errors?: Record<string, string[]> }>;
  if (axiosError?.response?.status === 422 && axiosError.response.data?.errors) {
    const raw = axiosError.response.data.errors;
    return Object.fromEntries(
      Object.entries(raw).map(([key, messages]) => [snakeToCamel(key), messages[0]])
    );
  }
  return {};
}
