let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors')
let { Notification, User, Post, MentionNotification } = require('../models')

router.all('*', (req, res, next) => {
	if(req.session.loggedIn) {
		next()
	} else {
		res.status(401)
		res.json({
			errors: [Errors.requestNotAuthorized]
		})
	}
})

router.get('/', async (req, res) => {
	try {
		let Notifications = await Notification.findAll({
			where: {
				'UserId': req.session.UserId
			},
			include: [{
				model: MentionNotification,
				include: [Post, { model: User, attributes: ['createdAt', 'username', 'color'] }]
			}]
		})

		let unreadCount = Notifications.reduce((acc, val) => {
			return val.read ? acc : acc+1
		}, 0)

		res.json({ Notifications, unreadCount })

	} catch (e) {
		console.log(e)

		res.status(500)
		res.json({
			errors: [Errors.unknown]
		})
	}
	
})

router.put('/', async (req, res) => {
	try {
		await Notification.update({ read: true }, {
			where: {
				'UserId': req.session.UserId,
				'read': false
			}
		})

		res.json({ success: true })

	} catch (e) {
		console.log(e)

		res.status(500)
		res.json({
			errors: [Errors.unknown]
		})
	}
	
})

module.exports = router