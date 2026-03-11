"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-xl font-bold text-red-500">Algo ha salido mal</h2>
      <p className="text-gray-600">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
      >
        Reintentar
      </button>
    </div>
  );
}
