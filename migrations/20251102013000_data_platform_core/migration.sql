CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE "InstitutionReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED');
CREATE TYPE "AffiliationType" AS ENUM ('STUDENT', 'ALUMNI', 'FACULTY', 'STAFF', 'MENTOR', 'PARTNER', 'OTHER');
CREATE TYPE "AffiliationStatus" AS ENUM ('REQUESTED', 'ACTIVE', 'INACTIVE', 'REJECTED');
CREATE TYPE "BadgeVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED');
CREATE TYPE "TagVersionEvent" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'RESTORED');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'Role' AND e.enumlabel = 'STAFF'
  ) THEN
    ALTER TYPE "Role" ADD VALUE 'STAFF';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'Role' AND e.enumlabel = 'REVIEWER'
  ) THEN
    ALTER TYPE "Role" ADD VALUE 'REVIEWER';
  END IF;
END $$;

-- Rename University table to Institution and add new metadata columns
ALTER TABLE "University" RENAME TO "Institution";

ALTER TABLE "Institution"
  ADD COLUMN "region" TEXT,
  ADD COLUMN "websiteUrl" TEXT,
  ADD COLUMN "logoUrl" TEXT,
  ADD COLUMN "establishedYear" INTEGER,
  ADD COLUMN "rankingScore" INTEGER,
  ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "reviewStatus" "InstitutionReviewStatus" DEFAULT 'PENDING',
  ADD COLUMN "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "archivedAt" TIMESTAMP(3);

-- Ensure existing createdAt has default
ALTER TABLE "Institution"
  ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Institution"
  ALTER COLUMN "tags" SET NOT NULL,
  ALTER COLUMN "reviewStatus" SET NOT NULL,
  ALTER COLUMN "updatedAt" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "Institution_slug_idx" ON "Institution" ("slug");
CREATE INDEX IF NOT EXISTS "Institution_country_region_idx" ON "Institution" ("country", "region");
CREATE INDEX IF NOT EXISTS "Institution_reviewStatus_idx" ON "Institution" ("reviewStatus");

-- Re-wire foreign keys referencing Institution
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_universityId_fkey";
ALTER TABLE "Story" DROP CONSTRAINT IF EXISTS "Story_universityId_fkey";
ALTER TABLE "Project" DROP CONSTRAINT IF EXISTS "Project_universityId_fkey";

ALTER TABLE "User"
  ADD COLUMN "handle" TEXT,
  ADD COLUMN "handleCanonical" TEXT,
  ADD CONSTRAINT "User_handle_key" UNIQUE ("handle"),
  ADD CONSTRAINT "User_handleCanonical_key" UNIQUE ("handleCanonical"),
  ADD CONSTRAINT "User_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Story"
  ADD CONSTRAINT "Story_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Project"
  ADD CONSTRAINT "Project_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create user handle history table
CREATE TABLE "UserHandleHistory" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" TEXT NOT NULL,
  "handle" TEXT NOT NULL,
  "handleCanonical" TEXT NOT NULL,
  "reason" TEXT,
  "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "releasedAt" TIMESTAMP(3),
  CONSTRAINT "UserHandleHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "UserHandleHistory_handleCanonical_releasedAt_key" ON "UserHandleHistory" ("handleCanonical", COALESCE("releasedAt", 'infinity'::timestamp));
CREATE INDEX "UserHandleHistory_userId_activatedAt_idx" ON "UserHandleHistory" ("userId", "activatedAt");

-- Create user role table
CREATE TABLE "UserRole" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "grantedById" TEXT,
  "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "reason" TEXT,
  "scope" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "UserRole_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX "UserRole_userId_role_deletedAt_idx" ON "UserRole" ("userId", "role", "deletedAt");
CREATE INDEX "UserRole_role_createdAt_idx" ON "UserRole" ("role", "createdAt");

-- Create user institution table
CREATE TABLE "UserInstitution" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" TEXT NOT NULL,
  "institutionId" TEXT NOT NULL,
  "type" "AffiliationType" NOT NULL,
  "status" "AffiliationStatus" NOT NULL DEFAULT 'REQUESTED',
  "isPrimary" BOOLEAN NOT NULL DEFAULT FALSE,
  "title" TEXT,
  "department" TEXT,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "metadata" JSONB,
  "requestedById" TEXT,
  "approvedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "UserInstitution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "UserInstitution_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE,
  CONSTRAINT "UserInstitution_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL,
  CONSTRAINT "UserInstitution_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX "UserInstitution_userId_institutionId_deletedAt_key" ON "UserInstitution" ("userId", "institutionId", COALESCE("deletedAt", 'infinity'::timestamp));
CREATE INDEX "UserInstitution_institutionId_status_idx" ON "UserInstitution" ("institutionId", "status");
CREATE INDEX "UserInstitution_userId_isPrimary_idx" ON "UserInstitution" ("userId", "isPrimary");

-- Create Cohort tables
CREATE TABLE "Cohort" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "institutionId" TEXT,
  "slug" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "archivedAt" TIMESTAMP(3),
  CONSTRAINT "Cohort_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL,
  CONSTRAINT "Cohort_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX "Cohort_institutionId_startDate_idx" ON "Cohort" ("institutionId", "startDate");
CREATE INDEX "Cohort_archivedAt_idx" ON "Cohort" ("archivedAt");

CREATE TABLE "CohortMember" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "cohortId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "userInstitutionId" TEXT,
  "role" TEXT,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leftAt" TIMESTAMP(3),
  "metadata" JSONB,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "CohortMember_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE CASCADE,
  CONSTRAINT "CohortMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "CohortMember_userInstitutionId_fkey" FOREIGN KEY ("userInstitutionId") REFERENCES "UserInstitution"("id") ON DELETE SET NULL
);

CREATE INDEX "CohortMember_cohortId_deletedAt_idx" ON "CohortMember" ("cohortId", "deletedAt");
CREATE INDEX "CohortMember_userId_deletedAt_idx" ON "CohortMember" ("userId", "deletedAt");

-- Badge models
CREATE TABLE "Badge" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "slug" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "iconUrl" TEXT,
  "visibility" "BadgeVisibility" NOT NULL DEFAULT 'PUBLIC',
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Badge_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX "Badge_visibility_idx" ON "Badge" ("visibility");
CREATE INDEX "Badge_deletedAt_idx" ON "Badge" ("deletedAt");

CREATE TABLE "BadgeVersion" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "badgeId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "data" JSONB,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BadgeVersion_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE,
  CONSTRAINT "BadgeVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX "BadgeVersion_badgeId_version_key" ON "BadgeVersion" ("badgeId", "version");
CREATE INDEX "BadgeVersion_createdAt_idx" ON "BadgeVersion" ("createdAt");

CREATE TABLE "UserBadgeGrant" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" TEXT NOT NULL,
  "badgeId" TEXT NOT NULL,
  "badgeVersionId" TEXT,
  "grantedById" TEXT,
  "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reason" TEXT,
  "metadata" JSONB,
  "revokedAt" TIMESTAMP(3),
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "UserBadgeGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "UserBadgeGrant_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE,
  CONSTRAINT "UserBadgeGrant_badgeVersionId_fkey" FOREIGN KEY ("badgeVersionId") REFERENCES "BadgeVersion"("id") ON DELETE SET NULL,
  CONSTRAINT "UserBadgeGrant_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX "UserBadgeGrant_userId_grantedAt_idx" ON "UserBadgeGrant" ("userId", "grantedAt");
CREATE INDEX "UserBadgeGrant_badgeId_grantedAt_idx" ON "UserBadgeGrant" ("badgeId", "grantedAt");

-- Tag versioning upgrades
ALTER TABLE "Tag"
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "description" TEXT,
  ADD COLUMN "color" TEXT,
  ADD COLUMN "createdById" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "deletedAt" TIMESTAMP(3);

ALTER TABLE "Tag"
  ADD CONSTRAINT "Tag_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL;

CREATE UNIQUE INDEX "Tag_domain_slug_unique" ON "Tag" ("domain", "slug");
CREATE INDEX "Tag_slug_idx" ON "Tag" ("slug");
CREATE INDEX "Tag_deletedAt_idx" ON "Tag" ("deletedAt");

CREATE TABLE "TagVersion" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tagId" TEXT NOT NULL,
  "event" "TagVersionEvent" NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT,
  "payload" JSONB,
  "actorId" TEXT,
  "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TagVersion_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE,
  CONSTRAINT "TagVersion_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX "TagVersion_tagId_appliedAt_idx" ON "TagVersion" ("tagId", "appliedAt");
CREATE INDEX "TagVersion_actorId_appliedAt_idx" ON "TagVersion" ("actorId", "appliedAt");

-- Backfill helpers (run separately during deployment)
-- 1. Populate User.handle and User.handleCanonical using existing usernames/emails.
-- 2. Insert rows into UserHandleHistory for each user.
-- 3. Create UserInstitution entries from existing user.universityId values.
