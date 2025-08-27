//Local Modules
const Expense = require("../models/expense");
const User = require("../models/user");
const Friend = require("../models/friend");
const FriendGrp = require("../models/friendGrp");
const friend = require("../models/friend");

exports.getIndex = (req, res, next) => {
  res.render("home", { isLogged: req.session.isLogged });
};
exports.getExpenses = (req, res, next) => {
  Expense.find({ userId: req.user }).then((expenses) => {
    res.render("yourExpenses", {
      expenses: expenses.sort((a, b) => b.date.getTime() - a.date.getTime()),
      isLogged: req.session.isLogged,
      user: req.user.userName,
    });
  });
};
exports.getDues = (req, res, next) => {
  Friend.find({
    $or: [{ friend1: req.user.userName }, { friend2: req.user.userName }],
  })
    .then((friends) => {
      res.render("dues", {
        isLogged: req.session.isLogged,
        friends: friends,
        userName: req.user.userName,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getAddExpenses = (req, res, next) => {
  Friend.find({
    $or: [{ friend1: req.user.userName }, { friend2: req.user.userName }],
  })
    .then((friends) => {
      friends.push({
        friend1: req.user.userName,
        friend2: req.user.userName,
      });

      res.render("addExpense", {
        isLogged: req.session.isLogged,
        friends: friends,
        userName: req.user.userName,
        groups: req.user.groups,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postAddExpense = (req, res, next) => {
  const expenseType = req.body.expenseType;
  if (expenseType === "self") {
    const amount = +req.body.selfCost;
    const expense = new Expense({
      userId: req.user,
      name: req.body.expenseName,
      description: req.body.expenseDescription,
      amount: amount,
      date: req.body.expenseDate,
      paidBy: req.user.userName,
    });
    expense.save().then(() => {
      res.redirect("/addexpense");
    });
  } else {
    let friends = [];
    let nvCost;
    let vgCost;
    if (expenseType === "friends") {
      if (!Array.isArray(req.body.friend)) {
        friends.push(req.body.friend);
      } else {
        friends = req.body.friend;
      }
      nvCost = +req.body.nvCostInput;
      vgCost = +req.body.vgCostInput;
    } else {
      if (!Array.isArray(req.body.Grpfriend)) {
        friends.push(req.body.Grpfriend);
      } else {
        friends = req.body.Grpfriend;
      }
      nvCost = +req.body.nvGroupCostInput;
      vgCost = +req.body.vgGroupCostInput;
    }
    const nv = [];
    const vg = [];
    friends.forEach((frnd) => {
      if (req.body[frnd] === "vg") {
        vg.push(frnd);
      } else {
        nv.push(frnd);
      }
    });
    const nvPerPerson = nvCost / nv.length;
    const vgPerPerson = vgCost / vg.length;
    console.log(nvPerPerson, vgPerPerson);
    User.find({ userName: { $in: friends } })
      .then((selectedUsers) => {
        selectedUsers.forEach((user) => {
          let amount;
          if (req.body[user.userName] === "vg") {
            amount = vgPerPerson;
          } else {
            amount = nvPerPerson;
          }
          const expense = new Expense({
            userId: user._id,
            name: req.body.expenseName,
            description: req.body.expenseDescription,
            amount: amount,
            date: req.body.expenseDate,
            paidBy: req.user.userName,
          });
          expense.save().then((expens) => {
            if (user.userName !== expens.paidBy) {
              Friend.findOne({
                $or: [
                  { friend1: user.userName, friend2: expens.paidBy },
                  { friend1: expens.paidBy, friend2: user.userName },
                ],
              }).then((friendship) => {
                if (!friendship) {
                  const friendColl = new Friend({
                    friend1: user.userName,
                    friend2: friend.userName,
                    due: 0,
                  });
                  return friendColl.save();
                } else {
                  let du = +friendship.due;
                  if (friendship.friend1 === req.user.userName) {
                    du += amount;
                  } else {
                    du -= amount;
                  }
                  return Friend.findByIdAndUpdate(friendship._id, {
                    due: du,
                  });
                }
              });
            }
          });
        });
      })
      .then(() => {
        return res.redirect("/yourExpenses");
      });
  }
};

exports.getFriendGrp = (req, res, next) => {
  let friendmessage = req.flash("frienderror");
  if (friendmessage.length > 0) {
    friendmessage = friendmessage[0];
  } else {
    friendmessage = null;
  }
  let grpmessage = req.flash("grperror");
  if (grpmessage.length > 0) {
    grpmessage = grpmessage[0];
  } else {
    grpmessage = null;
  }

  Friend.find({
    $or: [{ friend1: req.user.userName }, { friend2: req.user.userName }],
  })
    .then((friends) => {
      res.render("friendGRP", {
        isLogged: req.session.isLogged,
        friends: friends,
        userName: req.user.userName,
        groups: req.user.groups,
        frienderror: friendmessage,
        grperror: grpmessage,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddFriend = (req, res, next) => {
  const friendUserName = req.body.userName;
  if (friendUserName === req.user.userName) {
    req.flash("frienderror", "Can't add yourself in friends");
    return req.session.save((err) => {
      res.redirect("/friendGrp");
    });
  }
  User.findOne({ userName: friendUserName })
    .then((friend) => {
      if (friend) {
        Friend.findOne({
          $or: [
            { friend1: req.user.userName, friend2: friendUserName },
            { friend2: req.user.userName, friend1: friendUserName },
          ],
        }).then((frienddoc) => {
          if (frienddoc) {
            res.redirect("/friendGrp");
          } else {
            const user = req.user;
            const friendColl = new Friend({
              friend1: user.userName,
              friend2: friend.userName,
              due: 0,
              requests: [],
            });
            friendColl.save().then(() => {
              res.redirect("/friendGrp");
            });
          }
        });
      } else {
        req.flash("frienderror", "User with this userName doesn't exist");
        return req.session.save((err) => {
          res.redirect("/friendGrp");
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddGrp = (req, res, next) => {
  if (req.body.friends.length <= 2) {
    req.flash("grperror", "Add atleast one Friend");
    return req.session.save((err) => {
      res.redirect("/friendGrp");
    });
  } else {
    let flag = false;
    req.user.groups.forEach((grouped) => {
      if (grouped.group.Name === req.body.groupName) {
        flag = true;
        req.flash("grperror", "A group with this name already exists.");
        return req.session.save((err) => {
          res.redirect("/friendGrp");
        });
      }
    });
    if (!flag && req.body.friends.length > 2) {
      const grpfriends = req.body.friends;
      const groupName = req.body.groupName;
      User.find({ userName: { $in: grpfriends } })
        .then((frnds) => {
          const friends = [];
          frnds.forEach((friend) => {
            friends.push({
              userName: friend.userName,
              friendId: friend._id,
            });
          });
          const friendGrp = new FriendGrp({
            Name: groupName,
            friends: friends,
          });
          return friendGrp.save().then((result) => {
            frnds.forEach((friend) => {
              friend.groups.push({
                group: friendGrp,
              });
              friend.save();
            });
          });
        })
        .then((result) => {
          res.redirect("/friendGrp");
        });
    }
  }
};

exports.postCreditAmount = (req, res, next) => {
  const friend = req.body.friend;
  const user = req.body.user;
  const amount = req.body.creditAmount;
  console.log(req.body);
  Friend.findOne({
    $or: [
      { friend1: user, friend2: friend },
      { friend1: friend, friend2: user },
    ],
  }).then((friendShip) => {
    console.log(friendShip);
    const request = [...friendShip.requests];
    request.push({
      sender: user,
      reciever: friend,
      amount: amount,
      status: "pending",
    });
    Friend.findOneAndUpdate({ _id: friendShip._id }, { requests: request })
      .then((result) => {
        res.redirect("/dues");
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.postApproveRequest = (req, res, next) => {
  const user = req.user.userName;
  const friend = req.body.friend;
  Friend.findOne({
    $or: [
      { friend1: user, friend2: friend },
      { friend1: friend, friend2: user },
    ],
  })
    .then((friendship) => {
      const friendId = req.params.requestId;
      const rqst = friendship.requests.find((rqst) => {
        return rqst._id.toString() === friendId.toString();
      });
      friendship.requests.map((rqst) => {
        if (rqst._id.toString() === friendId.toString()) {
          rqst.status = "approved";
          return rqst;
        } else {
          return rqst;
        }
      });
      let change;
      if (friendship.friend1 == user) {
        change = rqst.amount;
      } else {
        change = rqst.amount * -1;
      }
      return Friend.findOneAndUpdate(
        { _id: friendship._id },
        { due: friendship.due - change, requests: friendship.requests }
      );
    })
    .then(() => {
      res.redirect("/dues");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postRejectRequest = (req, res, next) => {
  const user = req.user.userName;
  const friend = req.body.friend;
  Friend.findOne({
    $or: [
      { friend1: user, friend2: friend },
      { friend1: friend, friend2: user },
    ],
  })
    .then((friendship) => {
      const friendId = req.params.requestId;
      friendship.requests.map((rqst) => {
        if (rqst._id.toString() === friendId.toString()) {
          rqst.status = "rejected";
          return rqst;
        } else {
          return rqst;
        }
      });
      return Friend.findOneAndUpdate(
        { _id: friendship._id },
        { requests: friendship.requests }
      );
    })
    .then(() => {
      res.redirect("/dues");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postClearRequest = (req, res, next) => {
  const user = req.user.userName;
  const friend = req.body.friend;
  Friend.findOne({
    $or: [
      { friend1: user, friend2: friend },
      { friend1: friend, friend2: user },
    ],
  })
    .then((friendship) => {
      const friendId = req.params.requestId;
      const requests = friendship.requests.filter((rqst) => {
        return rqst._id.toString() !== friendId.toString();
      });
      return Friend.findOneAndUpdate(
        { _id: friendship._id },
        { requests: requests }
      );
    })
    .then(() => {
      res.redirect("/dues");
    })
    .catch((err) => {
      console.log(err);
    });
};
