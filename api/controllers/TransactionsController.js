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
			name: req.param('name'),
			// lastName: req.param('lastName'),
			uin: req.param('uin'),
			phone: req.param('phone'),
			email: req.param('email'),
			items: req.param('items'),
			endDate: req.param('endDate'),
			checkedOutBy: req.param('checkedOutBy'),
			itemsCheckedOut: req.param('itemsCheckedOut'),
			itemsCheckedIn: req.param('itemsCheckedIn')
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
	},
	updateTransaction: function(req, res) {
		Transactions.update( {id: req.param('id')}, req.param('updatedData')).exec(function afterwards(err, updated){
			if (err) {
				console.log(err);
				return;
			}
			// console.log('Updated ID: ' + req.param('id'));
			// console.log(req.param('updatedData'));
			Transactions.find({}).exec(function (err, data){
			  if (err) {
			    return res.serverError(err);
			  }
				sails.sockets.broadcast('app','newTransaction',data );
				return res.ok();

			});
		});
	}
};

