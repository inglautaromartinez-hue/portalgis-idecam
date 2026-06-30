import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { APP_AUTHOR, SEED_DATA } from '@portalgis/shared';

dotenv.config({ path: '../../.env' });
dotenv.config();

const prisma = new PrismaClient();


function toPrismaJson(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  return value === null || value === undefined ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
}

function slug(value: string): string {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();

  return normalized || 'root';
}

function connectionIdFromUrl(url: string): string {
  if (url.includes('wms.ign.gob.ar')) return 'conn_ign';
  if (url.includes('geonode-cam.marketsis.com.ar')) return 'conn_idecam';
  return `conn_${slug(url)}`;
}

function connectionNameFromUrl(url: string): string {
  if (url.includes('wms.ign.gob.ar')) return 'IGN WFS';
  if (url.includes('geonode-cam.marketsis.com.ar')) return 'IDECAM GeoNode WFS';
  return new URL(url).hostname;
}

function groupIdFromPath(path: string): string | null {
  if (!path) return null;
  return `group_${slug(path)}`;
}

async function main(): Promise<void> {
  console.log(`Seed PORTALGIS IDECAM · autor: ${APP_AUTHOR}`);
  console.log(`Capas extraídas: ${SEED_DATA.layers.length}`);
  console.log(`Grupos extraídos: ${SEED_DATA.groups.length}`);

  if (SEED_DATA.layers.length !== 46) {
    throw new Error(`Seed inválido: se esperaban 46 capas y hay ${SEED_DATA.layers.length}.`);
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@idecam.local';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Cambiar_Esta_Clave_123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'admin' },
    create: {
      email: adminEmail,
      passwordHash,
      role: 'admin',
      createdBy: APP_AUTHOR,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'seed:start',
      entity: 'system',
      details: { author: APP_AUTHOR, layers: SEED_DATA.layers.length, groups: SEED_DATA.groups.length },
      createdBy: APP_AUTHOR,
    },
  });

  await prisma.appSetting.upsert({
    where: { key: 'app_metadata' },
    update: { value: { author: APP_AUTHOR, name: 'PORTALGIS - IDECAM' } },
    create: { key: 'app_metadata', value: { author: APP_AUTHOR, name: 'PORTALGIS - IDECAM' }, createdBy: APP_AUTHOR },
  });

  await prisma.appSetting.upsert({
    where: { key: 'project_crs' },
    update: { value: toPrismaJson(SEED_DATA.projectCrs) },
    create: { key: 'project_crs', value: toPrismaJson(SEED_DATA.projectCrs), createdBy: APP_AUTHOR },
  });

  await prisma.appSetting.upsert({
    where: { key: 'initial_extent' },
    update: { value: toPrismaJson(SEED_DATA.initialExtent) },
    create: { key: 'initial_extent', value: toPrismaJson(SEED_DATA.initialExtent), createdBy: APP_AUTHOR },
  });

  await prisma.appSetting.upsert({
    where: { key: 'laugis_plugin_spec' },
    update: { value: toPrismaJson(SEED_DATA.pluginSpec) },
    create: { key: 'laugis_plugin_spec', value: toPrismaJson(SEED_DATA.pluginSpec), createdBy: APP_AUTHOR },
  });

  const endpointUrls = Array.from(
    new Set(
      SEED_DATA.layers
        .filter((layer) => layer.provider === 'WFS' && layer.typename)
        .map((layer) => layer.endpointUrl)
        .filter((url): url is string => Boolean(url)),
    ),
  );

  for (const url of endpointUrls) {
    const versions = SEED_DATA.layers
      .filter((layer) => layer.endpointUrl === url)
      .map((layer) => layer.version)
      .filter((version): version is string => Boolean(version));

    await prisma.wfsConnection.upsert({
      where: { id: connectionIdFromUrl(url) },
      update: {
        name: connectionNameFromUrl(url),
        url,
        version: versions[0] ?? null,
        isActive: true,
      },
      create: {
        id: connectionIdFromUrl(url),
        name: connectionNameFromUrl(url),
        url,
        version: versions[0] ?? null,
        isActive: true,
        createdBy: APP_AUTHOR,
      },
    });
  }

  for (const group of SEED_DATA.groups) {
    await prisma.layerGroup.upsert({
      where: { id: group.id },
      update: {
        name: group.name,
        path: group.path,
        parentPath: group.parentPath || null,
        checked: group.checked,
        expanded: group.expanded,
        depth: group.depth,
        treeOrder: group.treeOrder,
      },
      create: {
        id: group.id,
        name: group.name,
        path: group.path,
        parentPath: group.parentPath || null,
        checked: group.checked,
        expanded: group.expanded,
        depth: group.depth,
        treeOrder: group.treeOrder,
        createdBy: APP_AUTHOR,
      },
    });
  }

  for (const group of SEED_DATA.groups) {
    const parentId = groupIdFromPath(group.parentPath);
    if (parentId) {
      await prisma.layerGroup.update({
        where: { id: group.id },
        data: { parentId },
      });
    }
  }

  for (const layer of SEED_DATA.layers) {
    const groupId = groupIdFromPath(layer.groupPath);
    const connectionId = layer.provider === 'WFS' && layer.endpointUrl ? connectionIdFromUrl(layer.endpointUrl) : null;

    await prisma.layer.upsert({
      where: { id: layer.id },
      update: {
        name: layer.name,
        groupPath: layer.groupPath,
        checked: layer.checked,
        visibleInitial: layer.visibleInitial,
        provider: layer.provider,
        qgisType: layer.qgisType,
        geometry: layer.geometry,
        wkbType: layer.wkbType,
        authid: layer.authid,
        srsNameFromUri: layer.srsNameFromUri,
        effectiveSrs: layer.effectiveSrs,
        typename: layer.typename,
        endpointUrl: layer.endpointUrl,
        version: layer.version,
        restrictToRequestBBOX: layer.restrictToRequestBBOX,
        datasourceRaw: layer.datasourceRaw,
        fields: layer.fields,
        style: toPrismaJson(layer.style),
        labeling: toPrismaJson(layer.labeling),
        layerOpacity: layer.layerOpacity,
        treeOrder: layer.treeOrder,
        drawOrder: layer.drawOrder,
        groupId,
        connectionId,
      },
      create: {
        id: layer.id,
        name: layer.name,
        groupPath: layer.groupPath,
        checked: layer.checked,
        visibleInitial: layer.visibleInitial,
        provider: layer.provider,
        qgisType: layer.qgisType,
        geometry: layer.geometry,
        wkbType: layer.wkbType,
        authid: layer.authid,
        srsNameFromUri: layer.srsNameFromUri,
        effectiveSrs: layer.effectiveSrs,
        typename: layer.typename,
        endpointUrl: layer.endpointUrl,
        version: layer.version,
        restrictToRequestBBOX: layer.restrictToRequestBBOX,
        datasourceRaw: layer.datasourceRaw,
        fields: layer.fields,
        style: toPrismaJson(layer.style),
        labeling: toPrismaJson(layer.labeling),
        layerOpacity: layer.layerOpacity,
        treeOrder: layer.treeOrder,
        drawOrder: layer.drawOrder,
        groupId,
        connectionId,
        createdBy: APP_AUTHOR,
      },
    });

    await prisma.layerStyle.upsert({
      where: { layerId: layer.id },
      update: {
        style: toPrismaJson(layer.style),
        labeling: toPrismaJson(layer.labeling),
        opacity: layer.layerOpacity,
      },
      create: {
        layerId: layer.id,
        style: toPrismaJson(layer.style),
        labeling: toPrismaJson(layer.labeling),
        opacity: layer.layerOpacity,
        createdBy: APP_AUTHOR,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'seed:complete',
      entity: 'system',
      details: { author: APP_AUTHOR, layers: SEED_DATA.layers.length, groups: SEED_DATA.groups.length },
      createdBy: APP_AUTHOR,
    },
  });

  console.log('Seed finalizado correctamente.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
