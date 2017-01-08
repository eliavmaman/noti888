'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Cid Schema
 */
var CidSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  cid: {
    type: String,
    default: '',
    trim: true,
    required: 'CID cannot be blank'
  },
  category: {
    type: String,
    default: '',
    trim: true
  },
  env: {
    type: String,
    default: '',
    trim: true
  }
});

mongoose.model('Cid', CidSchema);
