-- DropForeignKey
ALTER TABLE "public"."Badge" DROP CONSTRAINT "Badge_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."BadgeVersion" DROP CONSTRAINT "BadgeVersion_badgeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BadgeVersion" DROP CONSTRAINT "BadgeVersion_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Cohort" DROP CONSTRAINT "Cohort_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Cohort" DROP CONSTRAINT "Cohort_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CohortMember" DROP CONSTRAINT "CohortMember_cohortId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CohortMember" DROP CONSTRAINT "CohortMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CohortMember" DROP CONSTRAINT "CohortMember_userInstitutionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Tag" DROP CONSTRAINT "Tag_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."TagVersion" DROP CONSTRAINT "TagVersion_actorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TagVersion" DROP CONSTRAINT "TagVersion_tagId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserBadgeGrant" DROP CONSTRAINT "UserBadgeGrant_badgeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserBadgeGrant" DROP CONSTRAINT "UserBadgeGrant_badgeVersionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserBadgeGrant" DROP CONSTRAINT "UserBadgeGrant_grantedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserBadgeGrant" DROP CONSTRAINT "UserBadgeGrant_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserHandleHistory" DROP CONSTRAINT "UserHandleHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserInstitution" DROP CONSTRAINT "UserInstitution_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserInstitution" DROP CONSTRAINT "UserInstitution_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserInstitution" DROP CONSTRAINT "UserInstitution_requestedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserInstitution" DROP CONSTRAINT "UserInstitution_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserRole" DROP CONSTRAINT "UserRole_grantedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserRole" DROP CONSTRAINT "UserRole_userId_fkey";

-- AlterTable
ALTER TABLE "Badge" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "BadgeVersion" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Cohort" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "CohortMember" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Institution"
ALTER COLUMN "tags" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TagVersion" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UserBadgeGrant" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UserHandleHistory" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UserInstitution" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UserRole" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "UserHandleHistory" ADD CONSTRAINT "UserHandleHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInstitution" ADD CONSTRAINT "UserInstitution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInstitution" ADD CONSTRAINT "UserInstitution_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInstitution" ADD CONSTRAINT "UserInstitution_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInstitution" ADD CONSTRAINT "UserInstitution_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BadgeVersion" ADD CONSTRAINT "BadgeVersion_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BadgeVersion" ADD CONSTRAINT "BadgeVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadgeGrant" ADD CONSTRAINT "UserBadgeGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadgeGrant" ADD CONSTRAINT "UserBadgeGrant_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadgeGrant" ADD CONSTRAINT "UserBadgeGrant_badgeVersionId_fkey" FOREIGN KEY ("badgeVersionId") REFERENCES "BadgeVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadgeGrant" ADD CONSTRAINT "UserBadgeGrant_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagVersion" ADD CONSTRAINT "TagVersion_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagVersion" ADD CONSTRAINT "TagVersion_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cohort" ADD CONSTRAINT "Cohort_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cohort" ADD CONSTRAINT "Cohort_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortMember" ADD CONSTRAINT "CohortMember_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortMember" ADD CONSTRAINT "CohortMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortMember" ADD CONSTRAINT "CohortMember_userInstitutionId_fkey" FOREIGN KEY ("userInstitutionId") REFERENCES "UserInstitution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "University_name_key" RENAME TO "Institution_name_key";

-- RenameIndex
ALTER INDEX "University_slug_key" RENAME TO "Institution_slug_key";

-- RenameIndex
ALTER INDEX "Tag_domain_slug_unique" RENAME TO "domain_slug_unique";
