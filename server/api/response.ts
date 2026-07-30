export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ data }, { status });
}

export function apiError(
  code: string,
  message: string,
  statusCode: number,
  details?: unknown,
) {
  return Response.json(
    { error: { code, message, details } },
    { status: statusCode },
  );
}

export async function withErrorHandler(
  handler: () => Promise<Response>,
): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof ApiError) {
      return apiError(error.code, error.message, error.statusCode, error.details);
    }
    console.error("Unhandled API error:", error);
    return apiError("INTERNAL_ERROR", "Something went wrong", 500);
  }
}
