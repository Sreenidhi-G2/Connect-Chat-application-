const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    phoneNumber : {type:String , required : true , unique: true},
    otp : {type : String, required: true , unique : true },
    createdAt : {type : Date , default:Date.now , expires : 300 } 

}); 

module.exports = mongoose.model("Otp",OtpSchema);