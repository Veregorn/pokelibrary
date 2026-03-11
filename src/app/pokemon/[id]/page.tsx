// Server Component: obtiene los datos del Pokémon y su cadena de evoluciones en el servidor.
// El id viene del segmento dinámico [id] de la URL — Next.js lo inyecta via params.

import { getPokemonDetail, getEvolutionChain } from "@/lib/api";
import { TYPE_COLORS } from "@/lib/typeColors";
import BackButton from "@/components/BackButton";
import Link from "next/link";

const STAT_COLORS: Record<string, string> = {
  hp: "bg-red-400",
  attack: "bg-orange-400",
  defense: "bg-yellow-400",
  "special-attack": "bg-blue-400",
  "special-defense": "bg-green-400",
  speed: "bg-pink-400",
};

export default async function PokemonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pokemon = await getPokemonDetail(Number(id));
  const evolutions = await getEvolutionChain(pokemon.evolutionChainUrl);

  return (
    <div className="max-w-2xl mx-auto">
      <BackButton />

      {/* Tarjeta principal */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-4">
        {/* Cabecera con fondo de color del tipo principal */}
        <div className="bg-red-50 px-8 pt-8 pb-4 flex flex-col items-center gap-2">
          <div className="flex justify-between w-full items-start">
            <span className="text-sm text-gray-400 font-mono">
              #{String(pokemon.id).padStart(3, "0")}
            </span>
            <span className="text-sm text-gray-400">
              Gen {pokemon.generation}
            </span>
          </div>
          <img
            src={pokemon.image}
            alt={pokemon.name}
            width={180}
            height={180}
          />
          <h1 className="text-3xl font-bold capitalize text-gray-800">
            {pokemon.name}
          </h1>
          <div className="flex gap-2">
            {pokemon.types.map((type) => (
              <span
                key={type}
                className={`px-3 py-1 rounded-full text-sm capitalize font-medium ${TYPE_COLORS[type] ?? "bg-gray-200"}`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="px-8 py-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Stats</h2>
          <div className="space-y-3">
            {pokemon.stats.map((stat) => (
              <div key={stat.name} className="flex items-center gap-3">
                <span className="w-36 text-sm capitalize text-gray-500">
                  {stat.name.replace("-", " ")}
                </span>
                <span className="w-8 text-sm font-bold text-gray-700 text-right">
                  {stat.value}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${STAT_COLORS[stat.name] ?? "bg-gray-400"}`}
                    style={{ width: `${(stat.value / 255) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evoluciones */}
        {evolutions.length > 1 && (
          <div className="px-8 py-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-700 mb-4">
              Evoluciones
            </h2>
            <div className="flex gap-3 flex-wrap">
              {evolutions.map((evo) => {
                const isCurrent = evo.id === Number(id);
                // replace en lugar de push: navegar entre evoluciones no apila el historial,
                // así "volver al listado" lleva directamente al listado, no al Pokémon anterior
                return (
                <Link
                    key={evo.id}
                    href={`/pokemon/${evo.id}`}
                    replace
                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                      isCurrent
                        ? "border-red-400 bg-red-50"
                        : "border-transparent bg-gray-50 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`}
                      alt={evo.name}
                      width={72}
                      height={72}
                    />
                    <span className="text-xs capitalize mt-1 text-gray-600 font-medium">
                      {evo.name}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      #{String(evo.id).padStart(3, "0")}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
