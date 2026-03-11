const BASE_URL = "https://pokeapi.co/api/v2";

// Cargamos las 3 primeras generaciones (386 Pokémon). Ampliar el límite es trivial,
// pero implica más tiempo de carga inicial — un tradeoff conscientemente asumido.
export async function getPokemonList(): Promise<
  { id: number; name: string }[]
> {
  // next: { revalidate } extiende el fetch nativo de Next.js para cachear la respuesta
  // en el servidor durante 24h. Los datos de PokéAPI no cambian, así que es seguro
  // cachear agresivamente y evitar requests repetidas.
  const res = await fetch(`${BASE_URL}/pokemon?limit=386`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`Error al obtener la lista de Pokemon: ${res.status}`);
  }

  const data = await res.json();

  // La API solo devuelve nombre y URL — extraemos el ID del índice, que coincide
  // con el orden de la API (siempre ordenada por ID ascendente).
  return data.results.map((pokemon: { name: string }, index: number) => ({
    id: index + 1,
    name: pokemon.name,
  }));
}

export async function getPokemonDetail(id: number) {
  // Promise.all lanza ambas requests en paralelo en lugar de secuencialmente,
  // reduciendo el tiempo de carga a la mitad por Pokémon.
  // /pokemon/{id} → tipos, stats, imagen
  // /pokemon-species/{id} → generación + URL de la cadena de evoluciones
  const [pokemonRes, speciesRes] = await Promise.all([
    fetch(`${BASE_URL}/pokemon/${id}`, { next: { revalidate: 86400 } }),
    fetch(`${BASE_URL}/pokemon-species/${id}`, { next: { revalidate: 86400 } }),
  ]);

  if (!pokemonRes.ok || !speciesRes.ok) {
    throw new Error(
      `Error al obtener los detalles del Pokemon ${id}: ${pokemonRes.status} ${speciesRes.status}`
    );
  }

  const pokemon = await pokemonRes.json();
  const species = await speciesRes.json();

  return {
    id,
    name: pokemon.name,
    // La API devuelve [{slot, type: {name}}] — mapeamos a string[] para simplicidad
    types: pokemon.types.map((t: { type: { name: string } }) => t.type.name),
    // La API devuelve "generation-i" — convertimos a número para facilitar filtrado y presentación
    generation: parseGeneration(species.generation.name),
    image: pokemon.sprites.front_default,
    stats: pokemon.stats.map(
      (s: { stat: { name: string }; base_stat: number }) => ({
        name: s.stat.name,
        value: s.base_stat,
      })
    ),
    // Guardamos la URL de la cadena de evoluciones para obtenerla bajo demanda
    // (en el detalle y en el buscador), evitando cargarla para todos los Pokémon del listado.
    evolutionChainUrl: species.evolution_chain.url,
  };
}

function parseGeneration(generationName: string): number {
  const map: Record<string, number> = {
    "generation-i": 1,
    "generation-ii": 2,
    "generation-iii": 3,
    "generation-iv": 4,
    "generation-v": 5,
    "generation-vi": 6,
    "generation-vii": 7,
    "generation-viii": 8,
    "generation-ix": 9,
  };
  return map[generationName] ?? 1;
}

export async function getEvolutionChain(
  url: string
): Promise<{ name: string; id: number }[]> {
  const res = await fetch(url, { next: { revalidate: 86400 } });

  if (!res.ok) {
    throw new Error(`Error al obtener la cadena de evolución: ${res.status}`);
  }

  const data = await res.json();
  const members: { name: string; id: number }[] = [];

  // La cadena de evoluciones es un árbol recursivo (un Pokémon puede tener múltiples
  // ramificaciones, como Eevee con 8 evoluciones). traverse recorre el árbol completo.
  // El ID se extrae de la URL de la species: ".../pokemon-species/25/" → 25
  function traverse(node: {
    species: { name: string; url: string };
    evolves_to: unknown[];
  }) {
    const id = Number(node.species.url.split("/").filter(Boolean).pop());
    members.push({ name: node.species.name, id });
    node.evolves_to.forEach((next) =>
      traverse(
        next as {
          species: { name: string; url: string };
          evolves_to: unknown[];
        }
      )
    );
  }

  traverse(data.chain);
  return members;
}
