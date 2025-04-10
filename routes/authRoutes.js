const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/keyboard-cat-zone-login', authController.renderLogin);
router.post('/keyboard-cat-zone-login', authController.handleLogin);
router.get('/logout', authController.logout);

module.exports = router;