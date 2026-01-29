const Profile = require("../models/Profile");
const { extractKeywords } = require("../utils/KeyWordExtractor");

exports.getMatches = async (req, res) => {
  try {
    const myProfile = await Profile.findOne({ userId: req.user.id });

    if (!myProfile) {
      return res.status(400).json({ message: "Complete profile first" });
    }

    const myBioKeywords = extractKeywords(myProfile.bio || "");

    const matches = await Profile.aggregate([
      {
        $match: {
          userId: { $ne: myProfile.userId }
        }
      },
      {
        $addFields: {
          interestScore: {
            $size: { $setIntersection: ["$interests", myProfile.interests] }
          },
          hobbyScore: {
            $size: { $setIntersection: ["$hobbies", myProfile.hobbies] }
          },
          professionScore: {
            $size: { $setIntersection: ["$Profession", myProfile.Profession] }
          },
          bioScore: {
            $size: {
              $setIntersection: [
                { $split: [{ $toLower: "$bio" }, " "] },
                myBioKeywords
              ]
            }
          }
        }
      },
      {
        $addFields: {
          score: {
            $add: [
              "$interestScore",
              "$hobbyScore",
              "$professionScore",
              { $multiply: ["$bioScore", 0.5] }
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
