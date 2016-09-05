/**
 * Transactions.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
	connection: 'mysql',
    tableName: 'Transactions',
    attributes: {
    	firstName: {
    		type: 'string',
    		required: true
    	},
    	lastName: {
    		type: 'string',
    		required: true
    	},
    	uin: {
    		type: 'string',
    		required: true
    	},
    	phone: {
    		type: 'string',
    		required: true
    	},
    	email: {
    		type: 'string',
    		required: true
    	},
    	endDate: {
    		type: 'date',
    		required: true
    	},
    	checkedOutBy: {
    		type: 'string',
    		required: true
    	},
    }
};

