const User = require('../models/user');
const bcrypt = require('bcryptjs');

async function getUsers(req, res, next) {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
            User.countDocuments(),
        ]);

        res.status(200).json({
            data: users,
            page,
            pages: Math.ceil(total / limit),
            total,
        });
    } catch (err) {
        next(err);
    }
}

async function createUser(req, res, next) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) return res.status(400).json({ error: 'Please fill out all required fields (name, email, password).' });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ error: 'Email is already in use.' });

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const userEntry = await User.create({
            name,
            email,
            passwordHash,
        });

        res.status(201).json({
            message: 'User created successfully!',
            user: userEntry.toPublicJSON ? userEntry.toPublicJSON() : userEntry,
        });
    } catch (err) {
        next(err);
    }
}

async function updateUserStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { isActive, name } = req.body;

        const updateData = {};
        if (isActive !== undefined) updateData.isActive = isActive;
        if (name) updateData.name = name;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedUser) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser.toPublicJSON ? updatedUser.toPublicJSON() : updatedUser,
        });
    } catch (err) {
        next(err);
    }
}

async function deleteUser(req, res, next) {
    try {
        const { id } = req.params;

        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ message: 'User deleted successfully', id, });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getUsers,
    createUser,
    updateUserStatus,
    deleteUser,
};