import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  boolean,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const eventStatusEnum = pgEnum("event_status", [
  "upcoming",
  "live",
  "completed",
]);

export const genderEnum = pgEnum("gender", ["male", "female"]);

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  dateStart: timestamp("date_start").notNull(),
  dateEnd: timestamp("date_end").notNull(),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  status: eventStatusEnum("status").notNull().default("upcoming"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clubs = pgTable("clubs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const athletes = pgTable("athletes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  gender: genderEnum("gender").notNull(),
  ageGroup: text("age_group"),
  clubId: text("club_id").references(() => clubs.id),
});

export const results = pgTable("results", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .references(() => events.id)
    .notNull(),
  category: text("category").notNull(),
  athleteId: text("athlete_id").references(() => athletes.id),
  athleteName: text("athlete_name").notNull(),
  club: text("club"),
  rank: integer("rank").notNull(),
  time: real("time").notNull(),
  splits: jsonb("splits").$type<Record<string, number>>(),
  gender: genderEnum("gender").notNull(),
  ageGroup: text("age_group"),
  stroke: text("stroke"),
  distance: integer("distance"),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  imageUrl: text("image_url"),
  category: text("category"),
  inStock: boolean("in_stock").default(true),
});

export const analyticsSessions = pgTable("analytics_sessions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  config: jsonb("config"),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow(),
});
