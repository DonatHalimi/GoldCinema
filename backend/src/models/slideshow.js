import mongoose from "mongoose";

const slideshowSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, },
        description: { type: String, default: "", },
        imageUrl: { type: String, required: true, },
        buttonText: { type: String, default: "Book Now", },
        buttonLink: { type: String, default: "/", },
        order: { type: Number, default: 0, },
        isActive: { type: Boolean, default: true, },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Slideshow", slideshowSchema);