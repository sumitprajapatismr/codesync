const Problem = require("../models/Problem");

const getProblems = async (req, res, next) => {
  try {
    const search = req.query.search || "";

    let query = {};

    if (search.trim()) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } }
        ]
      };
    }

    const problems = await Problem.find(query).limit(50);

    res.json({
      success: true,
      data: problems
    });

  } catch (err) {
    next(err);
  }
};

module.exports = { getProblems };