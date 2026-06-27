const express = require("express");
const { getSystemLogs, getSystemLogStats } = require("../controller/systemLog.controller");
const authGuard = require("../guards/auth.guard");

const router = express.Router();

router.use(authGuard);

// Only ADMIN_MANAGER can access
router.use((req, res, next) => {
    if (req.user && req.user.role === 'ADMIN_MANAGER') {
        next();
    } else {
        res.status(403).json({ success: false, error: 'Forbidden' });
    }
});

router.get("/stats", getSystemLogStats);
router.get("/", getSystemLogs);

module.exports = router;
