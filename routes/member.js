const router = require('express').Router()
const cloudinary = require('cloudinary')
const multer = require('multer')
const streamifier = require('streamifier')

const MemberController = require('../controllers/member')
const UserController = require('../controllers/user')

const upload = multer({})

router.get('/', MemberController.getMembersPage)

router.get('/new', MemberController.createMemberPage)

router.post('/new', upload.single('photo'), MemberController.createMember)

router.get('/profile/:serial_number', MemberController.getMemberProfilePage)

router.get('/remove/:member_id', UserController.hasAdminAuthorization, MemberController.removeMember)

module.exports = router