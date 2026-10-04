const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const maintenanceLogSchema = new Schema(
    {
        equipment: { type: Schema.Types.ObjectId, ref: 'Equipment', required: true, index: true, },
        maintenanceType: { type: String, enum: ['routine', 'repair', 'inspection', 'emergency'], default: 'routine', },
        description: { type: String, required: true, trim: true, },
        cost: { type: Number, min: 0, default: 0, },
        performedBy: { type: String, default: null, },
        performedAt: { type: Date, default: Date.now, index: true, },
        nextDueAt: { type: Date, default: null, },
        notes: { type: String, default: null, },
    },
    { timestamps: true }
);

maintenanceLogSchema.index({ equipment: 1, performedAt: -1 });

module.exports =
    mongoose.models.MaintenanceLog ||
    model('MaintenanceLog', maintenanceLogSchema);