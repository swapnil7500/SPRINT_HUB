import mongoose from "mongoose";

const project = new mongoose.Schema({
    title: {
        type: String,
    },
    description: String,
    // ✅ Added: owner field links every project to the user who created it
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    task: [
        {
            id: Number,
            title: String,
            description: String,
            order: Number,
            stage: String,
            index: Number,
            attachment: [
                { type: String, url: String }
            ],
            created_at: { type: Date, default: Date.now },
            updated_at: { type: Date, default: Date.now },
        }
    ]
}, { timestamps: true })

// ✅ Unique title per user (not globally unique)
project.index({ title: 1, owner: 1 }, { unique: true })

export default mongoose.model('Project', project);