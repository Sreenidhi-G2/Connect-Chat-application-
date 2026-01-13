const Profile = require("../models/Profile");
const User  = require("../models/User");

exports.createOrUpdateProfile = async (req,res) =>
{
    try {

        const userId = req.user.id;
        const {name,bio, intrests,hobbies,profileImage} = req.body;

        if(!name || !intrests || !hobbies)
        {
            return res.status(400).json({message:"Required Fields missing"});
        }

        
        let profile = await Profile.findOne({userId});

        if(profile)
        {
            profile.name = name;
            profile.bio = bio;
            profile.interests = intrests;
            profile.hobbies = hobbies;
            profile.profileImage = profileImage;
            await profile.save();
        }
        else 
        {
            profile = await Profile.create({
                userId,
                name,
                bio,
                intrests,
                hobbies,
                profileImage

            });
        }

        await User.findByIdAndUpdate(userId, {
            profileCompleted : true
        });

        res.status(200).json(profile);


    }catch(error)
    {
        console.error(error);
        res.status(500).json({message : "Server error"});

    }
};

exports.getMyProfile = async (req, res ) =>{
    try 
    {
        const profile = await Profile.findOne({userId : req.user.id });

        if(!profile)
        {
            return res.status(404).json({message :"Profile not found"});
        }

        res.status(200).json(profile);

    }
    catch(error)
    {
        res.status(500).json({message : "Server Error"})
    }
}