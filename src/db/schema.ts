import { text, integer, uuid, timestamp, pgTable } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  magicToken: text("magic_token"),
  magicTokenExpiresAt: timestamp("magic_token_expires_at"),
  magicTokenUsed: integer("magic_token_used").default(0),
});
