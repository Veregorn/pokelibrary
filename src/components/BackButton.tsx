"use client";

// Client Component separado exclusivamente para usar useRouter.
// router.back() en lugar de href="/" preserva la URL anterior con filtros y búsqueda activos.
// Si usáramos href="/", siempre navegaría a la raíz perdiendo el estado.

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="text-blue-500 hover:underline mb-4 inline-block"
    >
      &larr; Volver al listado
    </button>
  );
}
