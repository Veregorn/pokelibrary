import { Pokemon } from "@/types/pokemon";
import Link from "next/link";
import { TYPE_COLORS } from "@/lib/typeColors";

export default function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
  return (
    <Link href={`/pokemon/${pokemon.id}`}>
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 p-4 flex flex-col items-center gap-2 cursor-pointer">
        <span className="self-end text-xs text-gray-400 font-mono">
          #{String(pokemon.id).padStart(3, "0")}
        </span>
        <img src={pokemon.image} alt={pokemon.name} width={96} height={96} />
        <span className="font-bold capitalize text-gray-800">{pokemon.name}</span>
        <span className="text-xs text-gray-400">Gen {pokemon.generation}</span>
        <div className="flex gap-1 flex-wrap justify-center">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${TYPE_COLORS[type] ?? "bg-gray-200"}`}
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
