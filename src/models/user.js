const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Task = require('./task');

const userSchema = new mongoose.Schema({ username: {
    type: String,
    required: true,
    trim : true,
},
email:{
    type: String,
    required: true,
    trim : true,
    unique: true,
    validate(value) {
        if (!validator.isEmail(value)) {
            throw new Error('Invalid email address');
        }
    }
},
password: {
    type: String,
    required: true,
    trim : true,
    minlength: 6,
},
age: {
    type: Number,
    required: true,
    trim : true,
    default : 0,
},
tokens : [{
    token :{
        type: String,
        required: true,
    }
}],avatar:
{
    type : Buffer,
    
}
},{
    timestamps: true
});

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner',
})

userSchema.methods.toJSON = function(){
    return {
        username : this.username,
        email : this.email,
        age : this.age,
        createdAt : this.createdAt,
        updatedAt : this.updatedAt,
    }
}





userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id : user._id.toString()},'task-app');
    user.tokens = user.tokens.concat({token})
    await user.save();  
    return token;
}


userSchema.statics.findByCredentials = async (email, password) => {
    
    const user = await User.findOne({ email });
    
    if (!user) {
        throw new Error('User not found');
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw new Error('Invalid password');
    }
    return user;
}


userSchema.pre('save',async function(next) {
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

//delete user task when user is removed
userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({owner: user._id});
    next();
})



const User = mongoose.model('User', userSchema);
   

module.exports = User;