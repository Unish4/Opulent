export type PlayerFieldKey = "playerId" | "serverId" | "playerName" | "email";
export type FieldRuleType = "digits" | "alphanumeric" | "text" | "email";

export interface PlayerField {
  key: PlayerFieldKey;
  label: string;
  placeholder: string | null;
  helpText: string | null;
  required: boolean;
  ruleType: FieldRuleType;
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

export interface AdminGame extends GameDetail {
  aliases: string[];
  imagePublicId: string | null;
  lookup: { enabled: boolean; providerGameCode: string | null };
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface GamePayload {
  name: string;
  slug?: string;
  aliases: string[];
  publisher: string;
  description: string;
  instructions: string;
  playerFields: {
    key: PlayerFieldKey;
    label: string;
    placeholder: string;
    helpText: string;
    required: boolean;
    ruleType: FieldRuleType;
    minLength: number;
    maxLength: number;
  }[];
  lookup: { enabled: boolean; providerGameCode: string };
  imageUrl?: string;
  imagePublicId?: string;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
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
