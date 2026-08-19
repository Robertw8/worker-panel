export interface User {
  id: string;
  telegramId: string;
  username?: string;
}

export interface AuthUser {
  telegramId: string;
  telegramNumericId?: string;
  name?: string;
  username?: string;
  photoUrl?: string;
}
