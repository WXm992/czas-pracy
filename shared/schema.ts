import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  date,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Manager project assignments table
export const managerProjectAssignments = pgTable("manager_project_assignments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  managerId: text("manager_id").notNull(),
  projectId: text("project_id").notNull(),
  assignedDate: timestamp("assigned_date", { withTimezone: true }).notNull().default(sql`now()`),
  isActive: boolean("is_active").notNull().default(true),
});

// Equipment table
export const equipment = pgTable("equipment", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  brand: text("brand"),
  model: text("model"),
  serialNumber: text("serial_number").unique(),
  purchaseDate: date("purchase_date"),
  condition: text("condition").notNull().default("good"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
  // Inspection fields
  inspectionFrom: date("inspection_from"),
  inspectionTo: date("inspection_to"),
  // Insurance fields
  insuranceCompany: text("insurance_company"),
  insurancePolicyNumber: text("insurance_policy_number"),
  insuranceOc: boolean("insurance_oc").default(false),
  insuranceAc: boolean("insurance_ac").default(false),
  insuranceAssistance: boolean("insurance_assistance").default(false),
  insuranceFrom: date("insurance_from"),
  insuranceTo: date("insurance_to"),
  // Lease fields
  leaseCompany: text("lease_company"),
  leaseFrom: date("lease_from"),
  leaseTo: date("lease_to"),
});

// Equipment project assignments table
export const equipmentProjectAssignments = pgTable("equipment_project_assignments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  equipmentId: uuid("equipment_id").notNull().references(() => equipment.id, { onDelete: "cascade" }),
  projectId: text("project_id").notNull(),
  assignedDate: timestamp("assigned_date", { withTimezone: true }).notNull().default(sql`now()`),
  returnedDate: timestamp("returned_date", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
});

// System users table
export const systemUsers = pgTable("system_users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("employee"),
  permissions: jsonb("permissions").default(sql`'{}'`),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
});