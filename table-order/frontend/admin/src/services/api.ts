import type { ApiError } from '@/types';

const BASE_URL = '/api';

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public errorBody: ApiError
  ) {
    super(errorBody.message);
    this.name = 'HttpError';
  }
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('admin_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
      throw new HttpError(401, {
        error: 'Unauthorized',
        message: '세션이 만료되었습니다. 다시 로그인해 주세요.',
        statusCode: 401,
      });
    }

    let errorBody: ApiError;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = {
        error: 'Unknown',
        message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        statusCode: response.status,
      };
    }
    throw new HttpError(response.status, errorBody);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
