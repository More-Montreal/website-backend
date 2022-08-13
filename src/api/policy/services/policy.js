'use strict';

/**
 * policy service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::policy.policy');
