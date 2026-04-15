import { mysqlTable, varchar, text, int, timestamp, boolean, float, mysqlEnum, json } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  plan: mysqlEnum('plan', ['free','starter','pro','enterprise']).default('free'),
  credits: int('credits').default(10),
  company: varchar('company', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

export const projects = mysqlTable('projects', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  address: varchar('address', { length: 500 }),
  areaM2: float('area_m2'),
  houseModel: varchar('house_model', { length: 255 }),
  houseStyle: varchar('house_style', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
})

export const videos = mysqlTable('videos', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  projectId: varchar('project_id', { length: 36 }),
  title: varchar('title', { length: 255 }).notNull(),
  engine: mysqlEnum('engine', ['runway','kling','veo3','auto']).default('runway'),
  style: varchar('style', { length: 100 }),
  prompt: text('prompt'),
  duration: int('duration').default(10),
  resolution: mysqlEnum('resolution', ['720p','1080p','4k']).default('1080p'),
  scenes: json('scenes'),
  status: mysqlEnum('status', ['pending','queued','processing','completed','failed']).default('pending'),
  progress: int('progress').default(0),
  errorMsg: text('error_msg'),
  sourceImageUrl: varchar('source_image_url', { length: 1000 }),
  outputUrl: varchar('output_url', { length: 1000 }),
  thumbnailUrl: varchar('thumbnail_url', { length: 1000 }),
  externalJobId: varchar('external_job_id', { length: 255 }),
  creditsUsed: int('credits_used').default(0),
  sentToCrm: boolean('sent_to_crm').default(false),
  hasSubtitle: boolean('has_subtitle').default(false),
  hasLogo: boolean('has_logo').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

export const scenes = mysqlTable('scenes', {
  id: varchar('id', { length: 36 }).primaryKey(),
  videoId: varchar('video_id', { length: 36 }).notNull(),
  order: int('order').notNull(),
  type: mysqlEnum('type', ['terrain_delimitation','explosion_clearing','foundation','structure_rising','roofing_finishing','house_model_overlay','final_reveal','custom']).notNull(),
  prompt: text('prompt').notNull(),
  engine: varchar('engine', { length: 50 }).default('runway'),
  status: mysqlEnum('status', ['pending','processing','completed','failed']).default('pending'),
  outputUrl: varchar('output_url', { length: 1000 }),
  externalJobId: varchar('external_job_id', { length: 255 }),
  durationSecs: float('duration_secs'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const creditTransactions = mysqlTable('credit_transactions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  type: mysqlEnum('type', ['purchase','usage','bonus','refund']).notNull(),
  amount: int('amount').notNull(),
  description: varchar('description', { length: 500 }),
  videoId: varchar('video_id', { length: 36 }),
  createdAt: timestamp('created_at').defaultNow(),
})

export const usersRelations = relations(users, ({ many }) => ({
  videos: many(videos), projects: many(projects), creditTransactions: many(creditTransactions),
}))
export const videosRelations = relations(videos, ({ one, many }) => ({
  user: one(users, { fields: [videos.userId], references: [users.id] }),
  project: one(projects, { fields: [videos.projectId], references: [projects.id] }),
  scenes: many(scenes),
}))
export const scenesRelations = relations(scenes, ({ one }) => ({
  video: one(videos, { fields: [scenes.videoId], references: [videos.id] }),
}))
