import { Suspense } from "react";
import PokemonList from "@/components/PokemonList";
import { getPokemonList, getPokemonDetail } from "@/lib/api";

// Server Component: hace el fetch de todos los Pokémon en el servidor antes de renderizar.
// Los datos quedan cacheados (next: { revalidate }) — la primera carga es lenta (386 requests
// a PokéAPI) pero las siguientes son instantáneas desde caché.
//
// searchParams se lee aquí (servidor) para type y gen: al navegar atrás, Next.js
// re-renderiza este componente con los params correctos de la URL, garantizando
// que los filtros se restauren sin depender del estado del cliente.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; gen?: string }>;
}) {
  const { type, gen } = await searchParams;
  const list = await getPokemonList();

  // Procesamos en lotes de 20 para evitar rate limiting de PokéAPI y timeouts
  // en producción. Con caché de 24h, este coste solo se paga una vez.
  const BATCH_SIZE = 20;
  const pokemon = [];
  for (let i = 0; i < list.length; i += BATCH_SIZE) {
    const batch = list.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map((p) => getPokemonDetail(p.id)));
    pokemon.push(...results);
  }

  return (
    // Suspense requerido por Next.js App Router cuando el hijo usa useSearchParams
    <Suspense fallback={<div>Cargando...</div>}>
      <PokemonList
        pokemon={pokemon}
        selectedType={type ?? null}
        selectedGen={gen ? Number(gen) : null}
      />
    </Suspense>
  );
}
