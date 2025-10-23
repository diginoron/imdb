
export interface CastMember {
  actor: string;
  character: string;
}

export interface MovieDetails {
  title?: string;
  year?: number;
  length?: string;
  rating?: number;
  poster?: string;
  plot?: string;
  cast?: CastMember[];
}
