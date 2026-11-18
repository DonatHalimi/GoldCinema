require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/user');
const Role = require('../models/role');
const Staff = require('../models/staff');

const ROLE_DEFINITIONS = [
    { name: 'super_admin', description: 'Unrestricted system owner and role administrator.' },
    { name: 'admin', description: 'GoldCinema administrator.' },
    { name: 'cinema_manager', description: 'Manages staff and shifts within an assigned cinema.' },
    { name: 'staff', description: 'Cinema employee with access to their own staff profile and shifts.' },
    { name: 'customer', description: 'Standard cinema customer.' },
];

async function migrate() {
    await connectDB();
    try {
        const roles = {};
        for (const definition of ROLE_DEFINITIONS) {
            roles[definition.name] = await Role.findOneAndUpdate(
                { name: definition.name },
                { $setOnInsert: definition },
                { upsert: true, new: true }
            );
        }

        const users = await User.find().populate('role');
        let migrated = 0;
        for (const user of users) {
            const assigned = new Map();
            const legacyName = String(user.role?.name || '').toLowerCase();
            const staffProfile = await Staff.findOne({ user: user._id, isActive: true }).select('position');
            const isDesignatedSuperAdmin = Boolean(
                process.env.MULTIROLE_SUPER_ADMIN_EMAIL &&
                user.email.toLowerCase() === process.env.MULTIROLE_SUPER_ADMIN_EMAIL.toLowerCase()
            );

            if (legacyName === 'admin' && !staffProfile) assigned.set('admin', roles.admin);
            else if (legacyName === 'customer' || !legacyName) assigned.set('customer', roles.customer);
            else if (roles[legacyName] && legacyName !== 'admin') assigned.set(legacyName, roles[legacyName]);

            if (staffProfile) {
                const operationalRole = String(staffProfile.position || '').toLowerCase() === 'manager'
                    ? 'cinema_manager'
                    : 'staff';
                assigned.set(operationalRole, roles[operationalRole]);
            }

            if (!assigned.size) assigned.set('customer', roles.customer);
            if (isDesignatedSuperAdmin) assigned.set('super_admin', roles.super_admin);

            const roleList = [...assigned.values()];
            user.roles = roleList.map((role) => role._id);
            const preferredDefaultRole = isDesignatedSuperAdmin ? roles.super_admin : roleList[0];
            if (!user.role || !roleList.some((role) => String(role._id) === String(user.role._id || user.role))) {
                user.role = preferredDefaultRole._id;
            }

            const needsSelection = roleList.length > 1 || roleList.some((role) => ['admin', 'super_admin'].includes(role.name));
            for (const session of user.refreshTokens || []) {
                if (needsSelection) {
                    session.activeRole = null;
                    session.roleSelectionComplete = false;
                } else {
                    session.activeRole = roleList[0]._id;
                    session.roleSelectionComplete = true;
                }
            }

            await user.save();
            migrated += 1;
        }

        const superAdminCount = await User.countDocuments({ roles: roles.super_admin._id, isActive: true });
        console.log(`[multi-role] Created/verified ${ROLE_DEFINITIONS.length} roles; migrated ${migrated} users.`);
        if (!superAdminCount) {
            console.warn('[multi-role] No super_admin account exists. Set MULTIROLE_SUPER_ADMIN_EMAIL to an existing trusted admin email and rerun this migration before using role assignment.');
        } else {
            console.log(`[multi-role] Active super administrators: ${superAdminCount}`);
        }
    } finally {
        await disconnectDB();
    }
}

migrate().catch(async (error) => {
    console.error('[multi-role] Migration failed:', error);
    try { await disconnectDB(); } catch (_) {}
    process.exitCode = 1;
});
