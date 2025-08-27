const { request } = require("express");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const friendSchema = new Schema({
  friend1: {
    type: String,
    required: true,
  },
  friend2: {
    type: String,
    required: true,
  },
  due: {
    type: Number,
    required: true,
  },
  requests: [
    {
      sender: {
        type: String,
        required: true,
      },
      reciever: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("friend", friendSchema);
