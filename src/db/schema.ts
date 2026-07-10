import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  magicToken: text("magic_token"),
  magicTokenExpiresAt: text("magic_token_expires_at"), // ISO string
  magicTokenUsed: integer("magic_token_used").default(0),
});
