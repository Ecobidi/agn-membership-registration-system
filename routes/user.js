const router = require('express').Router()
// const { body } = require('express-validator')
const UserController = require('../controllers/user')

router.get('/', UserController.getAllUsersPage)

router.get('/new', UserController.hasAdminAuthorization, UserController.createUserPage)

router.post('/new', UserController.hasAdminAuthorization, UserController.createUser)

router.get('/profile/:serial_number', UserController.getProfilePage)

router.get('/remove/:serial_number', UserController.hasAdminAuthorization, UserController.removeUser)

module.exports = router