const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({
                    error: 'Invalid Email address'
                })
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    block: [{
        email: {
            type: String
        }
    }],
    like: [{
        email: {
            type: String
        }
    }],
    superlike: [{
        email: {
            type: String
        }
    }],
    imagePath: {
        type: String,
        required: true
    },
    img: 
      { data: Buffer, contentType: String }
})

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({
        _id: user._id
    }, process.env.JWT_KEY)
    user.tokens = user.tokens.concat({
        token
    })
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({
        email
    })
    if (!user) {
        throw new Error({
            error: 'Invalid login credentials'
        })
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error({
            error: 'Invalid login credentials'
        })
    }
    return user
}

userSchema.statics.like = async (email, likeemail) => {
    // Search for a user by email and password.
    const user = await User.findOne({
        email
    })

    user.like = user.like.concat({
        email: likeemail
    });
    await user.save();

    return user
}

userSchema.statics.superLike = async (email, superlikeemail) => {
    // Search for a user by email and password.
    const user = await User.findOne({
        email
    })

    user.superlike = user.superlike.concat({
        email: superlikeemail
    });
    await user.save();

    return user
}

userSchema.statics.block = async (email, blockemail) => {
    // Search for a user by email and password.
    const user = await User.findOne({
        email
    })

    user.block = user.block.concat({
        email: blockemail
    });
    await user.save();

    return user
}
userSchema.statics.clients = async () => {
    // Search for a user by email and password.
    const user = await User.find()

    clients = user;
    // console.log("CLIENTS "+JSON.stringify(user));

    return user
}

const User = mongoose.model('User', userSchema);

// let clients = User.find();

module.exports = User