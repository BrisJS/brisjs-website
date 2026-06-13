'use strict';

/**
 * Public-role permission bootstrap (feature 003 — Roles, Permissions & Tokens).
 *
 * Reproducibly grants the Public (unauthenticated) role read-only access to the
 * public content types and explicitly DENIES create/update/delete. This runs on
 * every boot so the permission state lives in code, not in manual admin clicks.
 *
 * Public types get `find` + `findOne`. Single types only expose `find`.
 * Draft & publish is enabled on every type (see each schema.json), so the public
 * REST API returns published entries only.
 */

// Collection types exposed read-only to the public.
const PUBLIC_COLLECTION_TYPES = [
  'api::talk.talk',
  'api::speaker.speaker',
  'api::event.event',
  'api::job-posting.job-posting',
  'api::talk-request.talk-request',
  'api::organizer.organizer',
];

// Single types exposed read-only to the public.
const PUBLIC_SINGLE_TYPES = [
  'api::home-page.home-page',
  'api::code-of-conduct.code-of-conduct',
  'api::find-us.find-us',
];

// Actions we explicitly want denied for the Public role (never write).
const WRITE_ACTIONS = ['create', 'update', 'delete'];

async function setPublicPermissions(strapi) {
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    strapi.log.warn('[bootstrap] Public role not found; skipping permission setup.');
    return;
  }

  // Map of "<subject>.<action>" -> enabled?
  const desired = {};

  for (const uid of PUBLIC_COLLECTION_TYPES) {
    desired[`${uid}.find`] = true;
    desired[`${uid}.findOne`] = true;
    for (const action of WRITE_ACTIONS) {
      desired[`${uid}.${action}`] = false;
    }
  }

  for (const uid of PUBLIC_SINGLE_TYPES) {
    desired[`${uid}.find`] = true;
    // Single types have no findOne; writes stay denied.
    for (const action of WRITE_ACTIONS) {
      desired[`${uid}.${action}`] = false;
    }
  }

  for (const [permissionAction, enabled] of Object.entries(desired)) {
    const existing = await strapi
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action: permissionAction, role: publicRole.id } });

    if (enabled) {
      if (!existing) {
        await strapi.query('plugin::users-permissions.permission').create({
          data: { action: permissionAction, role: publicRole.id },
        });
        strapi.log.info(`[bootstrap] Public: granted ${permissionAction}`);
      }
    } else if (existing) {
      // Ensure writes are denied even if previously enabled.
      await strapi
        .query('plugin::users-permissions.permission')
        .delete({ where: { id: existing.id } });
      strapi.log.info(`[bootstrap] Public: revoked ${permissionAction}`);
    }
  }
}

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/* { strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  async bootstrap({ strapi }) {
    await setPublicPermissions(strapi);
  },
};
