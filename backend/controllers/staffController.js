const User = require("../models/user");

// List employees (staff) with joined date derived from ObjectId timestamp
exports.listStaff = async (req, res) => {
  try {
    const employees = await User.aggregate([
      { $match: { role: "employee" } },
      {
        $addFields: {
          joinedDate: { $toDate: "$_id" }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          joinedDate: 1
        }
      },
      { $sort: { joinedDate: -1 } }
    ]);

    res.json(employees);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


