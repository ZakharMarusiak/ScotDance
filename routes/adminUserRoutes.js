const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');

router.get('/', adminUserController.listOrganisers);
router.post('/add', adminUserController.addOrganiser);
router.post('/delete/:id', adminUserController.deleteOrganiser);

module.exports = router;