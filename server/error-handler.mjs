export default function errorHandler(error) {
  try {
    const message =
      error && typeof error === "object" && "message" in error
        ? String(error.message)
        : String(error);
    const stack =
      error && typeof error === "object" && "stack" in error
        ? String(error.stack)
        : undefined;
    return new Response(
      JSON.stringify({ error: true, status: 500, message, stack }, null, 2),
      {
        status: 500,
        headers: { "content-type": "application/json; charset=utf-8" },
      },
    );
  } catch (fallback) {
    return new Response(
      JSON.stringify({
        error: true,
        status: 500,
        message: "error-handler failed",
        fallback: String(fallback),
      }),
      {
        status: 500,
        headers: { "content-type": "application/json; charset=utf-8" },
      },
    );
  }
}
