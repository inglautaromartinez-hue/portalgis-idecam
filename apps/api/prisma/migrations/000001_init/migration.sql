CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "User" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'admin',
  "createdBy" TEXT NOT NULL DEFAULT 'laugis',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "WfsConnection" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "version" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdBy" TEXT NOT NULL DEFAULT 'laugis',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WfsConnection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WfsConnection_url_key" ON "WfsConnection"("url");

CREATE TABLE "LayerGroup" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "parentPath" TEXT,
  "checked" TEXT NOT NULL,
  "expanded" BOOLEAN NOT NULL DEFAULT true,
  "depth" INTEGER NOT NULL DEFAULT 1,
  "treeOrder" INTEGER NOT NULL DEFAULT 0,
  "createdBy" TEXT NOT NULL DEFAULT 'laugis',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "parentId" TEXT,
  CONSTRAINT "LayerGroup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LayerGroup_path_key" ON "LayerGroup"("path");

CREATE TABLE "Layer" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "groupPath" TEXT NOT NULL,
  "checked" TEXT NOT NULL,
  "visibleInitial" BOOLEAN NOT NULL DEFAULT false,
  "provider" TEXT NOT NULL,
  "qgisType" TEXT NOT NULL,
  "geometry" TEXT,
  "wkbType" TEXT,
  "authid" TEXT,
  "srsNameFromUri" TEXT,
  "effectiveSrs" TEXT,
  "typename" TEXT,
  "endpointUrl" TEXT,
  "version" TEXT,
  "restrictToRequestBBOX" TEXT,
  "datasourceRaw" TEXT,
  "fields" JSONB NOT NULL DEFAULT '[]',
  "style" JSONB,
  "labeling" JSONB,
  "layerOpacity" DOUBLE PRECISION,
  "treeOrder" INTEGER NOT NULL,
  "drawOrder" INTEGER NOT NULL,
  "createdBy" TEXT NOT NULL DEFAULT 'laugis',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "groupId" TEXT,
  "connectionId" TEXT,
  CONSTRAINT "Layer_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Layer_groupPath_idx" ON "Layer"("groupPath");
CREATE INDEX "Layer_typename_idx" ON "Layer"("typename");
CREATE INDEX "Layer_provider_idx" ON "Layer"("provider");
CREATE INDEX "Layer_treeOrder_idx" ON "Layer"("treeOrder");
CREATE INDEX "Layer_drawOrder_idx" ON "Layer"("drawOrder");

CREATE TABLE "LayerStyle" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "layerId" TEXT NOT NULL,
  "style" JSONB,
  "labeling" JSONB,
  "opacity" DOUBLE PRECISION,
  "createdBy" TEXT NOT NULL DEFAULT 'laugis',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LayerStyle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LayerStyle_layerId_key" ON "LayerStyle"("layerId");

CREATE TABLE "SavedFilter" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "layerId" TEXT NOT NULL,
  "cql" TEXT NOT NULL,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "createdBy" TEXT NOT NULL DEFAULT 'laugis',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SavedFilter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT,
  "entityId" TEXT,
  "details" JSONB,
  "createdBy" TEXT NOT NULL DEFAULT 'laugis',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AppSetting" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "createdBy" TEXT NOT NULL DEFAULT 'laugis',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AppSetting_key_key" ON "AppSetting"("key");

ALTER TABLE "LayerGroup"
  ADD CONSTRAINT "LayerGroup_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "LayerGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Layer"
  ADD CONSTRAINT "Layer_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "LayerGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Layer"
  ADD CONSTRAINT "Layer_connectionId_fkey"
  FOREIGN KEY ("connectionId") REFERENCES "WfsConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LayerStyle"
  ADD CONSTRAINT "LayerStyle_layerId_fkey"
  FOREIGN KEY ("layerId") REFERENCES "Layer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SavedFilter"
  ADD CONSTRAINT "SavedFilter_layerId_fkey"
  FOREIGN KEY ("layerId") REFERENCES "Layer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
