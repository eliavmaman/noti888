'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Cid Schema
 */
var ScanSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    text: {
        type: String,
        default: '',
        trim: true
    }
});

mongoose.model('Scan', ScanSchema);
