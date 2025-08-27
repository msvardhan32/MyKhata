const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    required: true,
    type: String,
  },
  amount: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  paidBy: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Expense", expenseSchema);
