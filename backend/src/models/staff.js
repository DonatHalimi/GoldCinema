const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const staffSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true, },
        employeeId: { type: String, required: true, unique: true, trim: true, },
        position: { type: String, enum: ['usher', 'cashier', 'projectionist', 'manager', 'cleaner'], default: 'usher', },
        cinema: { type: Schema.Types.ObjectId, ref: 'Cinema', required: true, index: true, },
        hireDate: { type: Date, default: Date.now, },
        hourlyRate: { type: Number, min: 0, default: 0, },
        isActive: { type: Boolean, default: true, index: true, },
        notes: { type: String, default: null, },
    },
    { timestamps: true }
);

staffSchema.index({ cinema: 1, position: 1 });
staffSchema.index({ cinema: 1, isActive: 1 });

module.exports = mongoose.models.Staff || model('Staff', staffSchema);