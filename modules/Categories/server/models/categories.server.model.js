'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Article Schema
 */
var CategorySchema = new Schema({
        created: {
            type: Date,
            default: Date.now
        },
        name: {
            type: String,
            default: '',
            trim: true
        },
        tags: [
            {
                name: 'String',
                category:'String',
                messages: [{
                    text: 'String',
                    user: {
                        type: Schema.ObjectId,
                        ref: 'User'
                    }
                }]
            }
        ],
//tags: [
//    {
//        name: 'String',
//        category: 'String'
//    }
//],
        user: {
            type: Schema.ObjectId,
            ref: 'User'
        }
    })
    ;

mongoose.model('Category', CategorySchema);
