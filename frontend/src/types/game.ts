export type PlayerFieldKey = "playerId" | "serverId" | "playerName";

export interface PlayerField {
  key: PlayerFieldKey;
  label: string;
  placeholder: string | null;
  helpText: string | null;
  required: boolean;
  ruleType: "digits" | "alphanumeric" | "text";
  minLength: number;
  maxLength: number;
}

export interface GameListItem {
  id: string;
  name: string;
  slug: string;
  publisher: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  acceptingOrders: boolean;
}

export interface GameDetail extends GameListItem {
  description: string | null;
  instructions: string | null;
  fulfilmentType: "uid_topup";
  playerFields: PlayerField[];
  lookup: { enabled: boolean };
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
}

export interface GamesResult {
  games: GameListItem[];
  meta: PageMeta;
}
