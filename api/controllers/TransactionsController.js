/**
 * TransactionsController
 *
 * @description :: Server-side logic for managing Transactions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	subscribe: function(req, res) {
		if (!req.isSocket) {
			return res.badRequest();
		}

		var roomName = 'app';
		sails.sockets.join(req, roomName, function(err) {
			if (err) {
				return res.serverError(err);
			}

			return res.json({
				message: 'Subscribed to a fun room called '+roomName+'!'
			});
		});
	},
	newTransaction: function (req, res) {
		Transactions.create({
			firstName: req.param('firstName'),
			lastName: req.param('lastName'),
			uin: req.param('uin'),
			phone: req.param('phone'),
			email: req.param('email'),
			items: req.param('items'),
			endDate: req.param('endDate'),
			checkedOutBy: req.param('checkedOutBy')
		}).exec(function (err, transaction){
			if (err) { return res.serverError(err); }

			Transactions.find({}).exec(function (err, data){
			  if (err) {
			    return res.serverError(err);
			  }
				 sails.sockets.broadcast('app','newTransaction',data );
				sails.log('New transaction id is:', transaction.id);
				return res.ok();

			});


		});
	},
	getAllTransactions: function(req, res) {
		Transactions.find({}).exec(function (err, data){
			  if (err) {
			    return res.serverError(err);
			  }
				return res.json(data);

			});
	}
};

