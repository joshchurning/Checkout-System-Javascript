/**
 * EmailController
 *
 * @description :: Server-side logic for managing Emails
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	sendEmail: function(req, res) {
		// sails.hooks.email.send(template, data, options, cb)
		sails.hooks.email.send(
		  "testEmail",
		  {
		    fullName: req.param('fullName'),
		    endDate: req.param('endDate'),
		    items: req.param('items'),
		    senderEmail: "joshchurning@gmai.com"
		  },
		  {
		    from: "PerfTech <joshchurning@gmai.com>",
		    to: "joshchurning@tamu.edu",
		    subject: "SailsJS email test"
		  },
		  function(err) {console.log(err || "Email is sent");}
		)		
		
		return res.send('Email Test');
	}
};

