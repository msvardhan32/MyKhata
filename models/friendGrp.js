const mongoose = require("mongoose");

const Friend = require("./friend");
const User = require("./user");

const Schema = mongoose.Schema;

const friendGrpSchema = new Schema({
  Name: {
    type: String,
    required: true,
  },
  friends: [
    {
      userName: {
        type: String,
        required: true,
      },
      friendId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    },
  ],
});

friendGrpSchema.methods.addToGrp = function (grpfriends, groupName) {
  return;
};

module.exports = mongoose.model("friendGrp", friendGrpSchema);
