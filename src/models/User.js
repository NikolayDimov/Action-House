const { Schema, model, Types: { ObjectId } } = require('mongoose');

const EMAIL_PATTERN = /^([a-zA-Z]+)@([a-zA-Z]+)\.([a-zA-Z]+)$/; 

// TODO add User properties and validation according to assignment 
const userSchema = new Schema({
    email: { 
        type: String, 
        required: true, 
        validate: {
            validator(value) {
                return EMAIL_PATTERN.test(value);
            },
        message: 'Email must be valid'}, 
        minlength: [10, 'Username must be at least 10 characters long'] },
    firstName: { type: String, required: true, match: [/^[A-Za-z0-9]+$/, 'firstName must ne alphanumeric'], minlength: [1, 'firstName must be at least 1 characters long'] },
    lastName: { type: String, required: true, match: [/^[A-Za-z0-9]+$/, 'lastName must ne alphanumeric'], minlength: [1, 'lastName must be at least 1 characters long'] },
    hashedPassword: { type: String, required: true },
});

// Index
userSchema.index({ email: 1 }, {
    unique: true,
    collation: {
        locale: 'en',
        strength: 2
    }
});

const User = model('User', userSchema);

module.exports = User;