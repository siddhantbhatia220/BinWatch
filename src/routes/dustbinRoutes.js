const express = require('express');
const router = express.Router();
const { 
    getDustbins, 
    getDustbinById, 
    createDustbin, 
    updateDustbinHardware,
    getAllDustbinsAdmin,
    getAllUsersAdmin
} = require('../controllers/dustbinController');
const { authGuard, adminGuard } = require('../middleware/authMiddleware');

// User routes
router.get('/', authGuard, getDustbins);
router.get('/:id', authGuard, getDustbinById);
router.post('/', authGuard, createDustbin);

router.post('/hardware/update', updateDustbinHardware);

// Admin routes
router.get('/admin/all', authGuard, adminGuard, getAllDustbinsAdmin);
router.get('/admin/users', authGuard, adminGuard, getAllUsersAdmin);

module.exports = router;
