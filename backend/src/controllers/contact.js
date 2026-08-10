const Contact = require('../models/Contact');
const { sendContactEmail } = require('../utils/mailer');

async function getContacts(req, res, next) {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const [contacts, total] = await Promise.all([
            Contact.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
            Contact.countDocuments(),
        ]);

        res.status(200).json({
            data: contacts,
            page,
            pages: Math.ceil(total / limit),
            total,
        });
    } catch (err) {
        next(err);
    }
}

async function createContact(req, res, next) {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'Please fill out all required fields.' });
        }

        const contactEntry = await Contact.create({
            name,
            email,
            subject,
            message,
        });

        await sendContactEmail({ name, email, subject, message });

        res.status(201).json({
            message: 'Your message has been sent successfully! We will get back to you soon.',
            contact: contactEntry,
        });
    } catch (err) {
        next(err);
    }
}

async function updateContactStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedContact = await Contact.findByIdAndUpdate(
            id,
            { ...(status && { status }) },
            { new: true, runValidators: true }
        );

        if (!updatedContact) {
            return res.status(404).json({ error: 'Contact message not found' });
        }

        res.status(200).json({
            message: 'Contact status updated successfully',
            contact: updatedContact,
        });
    } catch (err) {
        next(err);
    }
}

async function deleteContact(req, res, next) {
    try {
        const { id } = req.params;

        const deletedContact = await Contact.findByIdAndDelete(id);
        if (!deletedContact) {
            return res.status(404).json({ error: 'Contact message not found' });
        }

        res.status(200).json({
            message: 'Contact message deleted successfully',
            id,
        });
    } catch (err) {
        next(err);
    }
}

async function bulkDeleteContacts(req, res, next) {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Please provide an array of contact IDs' });
        }

        const result = await Contact.deleteMany({ _id: { $in: ids } });

        res.status(200).json({
            message: `Successfully deleted ${result.deletedCount} contact message(s)`,
            deletedCount: result.deletedCount,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getContacts,
    createContact,
    updateContactStatus,
    deleteContact,
    bulkDeleteContacts,
};