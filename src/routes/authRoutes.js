const express = require('express');
const router = express.Router();
const { register, login, changePassword } = require('../controllers/authController');
const { authGuard } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.put('/change-password', authGuard, changePassword);

module.exports = router;
