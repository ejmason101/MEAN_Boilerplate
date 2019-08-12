const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");


var userSchema = mongoose.Schema({
        firstname: String,
        lastname: String,
        studentID: String,
        phone: String,
        email: { type: String, require: true, unique: true},
        password: String,
        userLevel: String,
        laserInUse: Boolean,
        history: [
            {
                type: { type: String },
                dates: String,
                fileName: String,
                machineID: String,
                price: Number,
                created_at: {type: Date, required: true, default: Date}
            }
        ],
        laserLab01: Boolean,
        laserLab02: Boolean,
        woodShop01: Boolean,
        woodShop02: Boolean,
        woodShop03: Boolean,
        plotters: Boolean,
        projectors: Boolean

});

userSchema.plugin(uniqueValidator);

userSchema.method('toClient', function() {
    var obj = this.toObject();
    console.log('UserSchema toClient method running...');
    // console.log('Before: ');
    // console.log(obj);
    // Rename the Fields
  
    // Rename the DeptInfo id
    obj.id = obj._id;
    delete obj._id;

    return obj;
  
  
  })
module.exports = mongoose.model("User", userSchema);