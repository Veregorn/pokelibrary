export interface PokemonStat {
  name: string;
  value: number;
}

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  generation: number;
  image: string;
  stats: PokemonStat[];
  evolutionChainUrl: string;
}
