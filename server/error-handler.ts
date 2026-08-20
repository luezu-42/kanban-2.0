export default function errorHandler(error: unknown) {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error("[nitro]", err);
  return new Response(
    JSON.stringify(
      {
        error: true,
        status: 500,
        message: err.message,
        cause: err.cause instanceof Error ? err.cause.message : err.cause,
        stack: err.stack,
      },
      null,
      2,
    ),
    {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    },
  );
}
