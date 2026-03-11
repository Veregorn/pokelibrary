"use client";

// Client Component: necesita useState/useEffect para manejar filtros interactivos.
// Recibe los datos ya cargados desde el Server Component (page.tsx), que es quien
// hace el fetch — separación clara entre obtención de datos y presentación.

import { useRouter, useSearchParams } from "next/navigation";
import PokemonCard from "./PokemonCard";
import { Pokemon } from "@/types/pokemon";
import { useMemo, useTransition, useState, useEffect } from "react";
import { getEvolutionChain } from "@/lib/api";

const GENERATIONS = [1, 2, 3];
const TYPES = [
  "normal",
  "fire",
  "water",
  "grass",
  "electric",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

interface Props {
  pokemon: Pokemon[];
  // selectedType y selectedGen vienen del servidor (leídos de searchParams en page.tsx),
  // lo que garantiza que se restauran correctamente al navegar atrás.
  selectedType: string | null;
  selectedGen: number | null;
}

export default function PokemonList({
  pokemon,
  selectedType,
  selectedGen,
}: Props) {
  const router = useRouter();

  // useSearchParams es reactivo a cambios de URL en el cliente.
  // Usamos para 'search' en lugar de props del servidor porque el filtrado
  // por nombre es puramente client-side — no necesita re-render del servidor.
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";

  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [evolutionNames, setEvolutionNames] = useState<string[] | null>(null);

  // Sincroniza el estado local con la URL cuando cambia (p.ej. al navegar atrás),
  // garantizando que el input refleje siempre el valor de la URL.
  useEffect(() => {
    setSearch(urlSearch);
    setDebouncedSearch(urlSearch);
  }, [urlSearch]);

  // Debounce: espera 300ms tras el último keystroke antes de filtrar y actualizar la URL.
  // Evita hacer operaciones costosas en cada tecla y acumular entradas en el historial.
  // router.replace en lugar de push: los cambios de filtro no generan entradas en el
  // historial, así que "atrás" lleva al detalle, no al estado anterior del filtro.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      const params = new URLSearchParams();
      if (selectedType) params.set("type", selectedType);
      if (selectedGen) params.set("gen", selectedGen.toString());
      if (search) params.set("search", search);
      startTransition(() => {
        router.replace(`/?${params.toString()}`);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Búsqueda con evoluciones: al buscar "pikachu", se muestran también Pichu y Raichu.
  // Estrategia: primero encontrar Pokémon cuyo nombre coincide, luego obtener sus
  // cadenas de evolución y expandir los resultados.
  // evolutionNames === null → aún cargando (mostramos resultados por nombre como fallback)
  // evolutionNames === [] → sin resultados
  // evolutionNames === [...] → resultados expandidos con evoluciones
  useEffect(() => {
    if (!debouncedSearch) {
      setEvolutionNames(null);
      return;
    }

    const matches = pokemon.filter((p) =>
      p.name.includes(debouncedSearch.toLowerCase())
    );

    if (matches.length === 0) {
      setEvolutionNames([]);
      return;
    }

    // Deduplicar URLs: Pokémon de la misma cadena comparten evolutionChainUrl,
    // evitando requests duplicadas (ej: buscar "char" no hace 3 veces la misma request).
    const uniqueUrls = [...new Set(matches.map((p) => p.evolutionChainUrl))];

    Promise.all(uniqueUrls.map((url) => getEvolutionChain(url))).then(
      (chains) => {
        setEvolutionNames([...new Set(chains.flat().map((e) => e.name))]);
      }
    );
  }, [debouncedSearch, pokemon]);

  // Filtros combinados (tipo + generación + búsqueda) memoizados para evitar
  // recalcular en cada render cuando las dependencias no han cambiado.
  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams();
    if (selectedType) params.set("type", selectedType);
    if (selectedGen) params.set("gen", selectedGen.toString());
    if (search) params.set("search", search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.replace(`/?${params.toString()}`);
    });
  }

  const filtered = useMemo(() => {
    return pokemon.filter((pokemon) => {
      const matchesType = selectedType
        ? pokemon.types.includes(selectedType)
        : true;
      const matchesGen = selectedGen
        ? pokemon.generation === selectedGen
        : true;
      const matchesSearch = debouncedSearch
        ? evolutionNames === null
          ? pokemon.name.includes(debouncedSearch.toLowerCase())
          : evolutionNames.includes(pokemon.name)
        : true;
      return matchesType && matchesGen && matchesSearch;
    });
  }, [pokemon, selectedType, selectedGen, debouncedSearch, evolutionNames]);

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="🔍 Buscar Pokémon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <select
          value={selectedType ?? ""}
          onChange={(e) => updateFilter("type", e.target.value || null)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <option value="">Todos los tipos</option>
          {TYPES.map((type) => (
            <option key={type} value={type} className="capitalize">
              {type}
            </option>
          ))}
        </select>
        <select
          value={selectedGen ?? ""}
          onChange={(e) =>
            updateFilter("gen", e.target.value ? Number(e.target.value) : null)
          }
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <option value="">Todas las generaciones</option>
          {GENERATIONS.map((gen) => (
            <option key={gen} value={gen}>
              Generación {gen}
            </option>
          ))}
        </select>
        {(selectedType || selectedGen || search) && (
          <button
            onClick={() => {
              startTransition(() => {
                setSearch("");
                router.replace("/");
              });
            }}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Limpiar
          </button>
        )}
        {/* useTransition marca la navegación como no urgente, mostrando el spinner
            sin bloquear la UI mientras el servidor procesa el nuevo render */}
        {isPending && (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 mt-16 text-lg">
          No se encontraron resultados.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      )}
    </div>
  );
}
