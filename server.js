'use strict';

/**
 * Module dependencies.
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var app = require('./config/lib/app');
var server = app.start();
