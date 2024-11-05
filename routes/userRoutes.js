const router = require('express').Router()
const { login, register, updateUser, deleteUser, registerWithSSO, loginWithSSO } = require('../controller/userController')

router.post('/login', login)

router.post('/register', register)

router.post('/sso-login', login)

router.post('/sso-register', register)

router.put('/:id', updateUser)

router.delete(':id', deleteUser)

module.exports = router 