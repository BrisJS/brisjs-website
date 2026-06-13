'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::talk-request.talk-request');
