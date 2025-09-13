import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['system', 'sales', 'management', 'support'],
        default: 'sales'
    },
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isSystem: {
        type: Boolean,
        default: false
    },
    level: {
        type: Number,
        default: 1, // 1=Basic, 2=Intermediate, 3=Advanced, 4=Admin, 5=Super
        min: 1,
        max: 5
    }
}, { timestamps: true });

export default mongoose.model('Role', roleSchema);
