export interface PlayerLookupInput {
  providerGameCode: string;
  playerId: string;
  serverId?: string;
}

export interface PlayerLookupResult {
  playerName: string;
  level: number | null;
  region: string | null;
}

export interface PlayerLookupProvider {
  readonly name: string;
  lookup(input: PlayerLookupInput): Promise<PlayerLookupResult>;
}

export type LookupErrorKind = "not_found" | "invalid_input" | "unavailable";

export class LookupError extends Error {
  public readonly kind: LookupErrorKind;

  constructor(kind: LookupErrorKind, message?: string) {
    super(message ?? kind);
    this.kind = kind;
  }
}
