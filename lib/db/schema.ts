import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone"),
  emailVerifiedAt: integer("email_verified_at"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at").notNull(),
    expiresAt: integer("expires_at").notNull(),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)]
);

export const emailCodes = sqliteTable(
  "email_codes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: integer("expires_at").notNull(),
    consumedAt: integer("consumed_at"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("email_codes_user_id_idx").on(table.userId)]
);

export const profiles = sqliteTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull().default("Nigeria"),
  occupation: text("occupation").notNull().default(""),
  education: text("education").notNull().default(""),
  languages: text("languages").notNull().default("[]"),
  maritalStatus: text("marital_status").notNull().default(""),
  kids: text("kids").notNull().default(""),
  relocate: text("relocate").notNull().default(""),
  alcohol: text("alcohol").notNull().default(""),
  smoking: text("smoking").notNull().default(""),
  careerAmbition: text("career_ambition").notNull().default(""),
  familyInvolvement: text("family_involvement").notNull().default(""),
  bio: text("bio").notNull().default(""),
  verse: text("verse").notNull().default(""),
  intent: text("intent").notNull().default(""),
  denomination: text("denomination").notNull().default(""),
  churchName: text("church_name").notNull().default(""),
  churchCity: text("church_city").notNull().default(""),
  attendance: text("attendance").notNull().default(""),
  bornAgain: text("born_again").notNull().default(""),
  practices: text("practices").notNull().default("[]"),
  courtshipViews: text("courtship_views").notNull().default(""),
  denominationImportance: text("denomination_importance").notNull().default(""),
  hideChurch: integer("hide_church", { mode: "boolean" }).notNull().default(false),
  hideCity: integer("hide_city", { mode: "boolean" }).notNull().default(false),
  hideEmployer: integer("hide_employer", { mode: "boolean" }).notNull().default(false),
  photo: text("photo"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
