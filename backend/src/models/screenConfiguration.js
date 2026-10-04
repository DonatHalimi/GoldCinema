const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const screenConfigurationSchema = new Schema(
    {
        screen: { type: Schema.Types.ObjectId, ref: 'Screen', required: true, unique: true, index: true, },
        screenType: { type: String, enum: ['standard', 'imax', '4dx', 'screenx', 'dolby'], default: 'standard', },
        soundSystem: { type: String, default: null, },
        projectorType: { type: String, default: null, },
        screenWidth: { type: Number, default: null, },
        screenHeight: { type: Number, default: null, },
        has3D: { type: Boolean, default: false, },
        hasHFR: { type: Boolean, default: false, },
        notes: { type: String, default: null, },
    },
    { timestamps: true }
);

module.exports = mongoose.models.ScreenConfiguration || model('ScreenConfiguration', screenConfigurationSchema);