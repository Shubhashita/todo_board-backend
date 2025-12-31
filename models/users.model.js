const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'blocked', 'deleted'],
        default: 'active'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    isDeleted: {
        type: Boolean,
        default: false
    },
},
    { timestamps: true }
);


// 🔑 Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
