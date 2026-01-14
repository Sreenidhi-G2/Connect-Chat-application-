const Profile = require("../models/Profile");

exports.getMatches = async (req, res) => {
  try {
    const myProfile = await Profile.findOne({ userId: req.user.id });

    if (!myProfile) {
      return res.status(400).json({ message: "Complete profile first" });
    }

    const matches = await Profile.aggregate([
      {
        $match: {
          userId: { $ne: myProfile.userId }
        }
      },
      {
        $addFields: {
          score: {
            $add: [
              { $size: { $setIntersection: ["$interests", myProfile.interests] } },
              { $size: { $setIntersection: ["$hobbies", myProfile.hobbies] } }
            ]
          }
        }
      },
      { $sort: { score: -1 } },
      { $limit: 20 }
    ]);

    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
