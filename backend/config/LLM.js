const Replicate = require("replicate");

const token = process.env.REPLICATE_API_TOKEN;
console.log("Replicate Token:", token);
const  replicate = new Replicate({
    auth : token
});


module.exports = replicate;