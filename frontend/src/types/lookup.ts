export interface LookupResponse {
  playerName: string;
  level: number | null;
  region: string | null;
  lookupToken: string;
  expiresAt: string;
}

export interface CheckedPlayer extends LookupResponse {
  playerId: string;
  serverId: string;
}
