const expenseType = document.getElementById("expenseType");
const selfExpense = document.getElementById("selfExpense");
const friendsExpense = document.getElementById("friendsExpense");
const friendGroupExpense = document.getElementById("friendGroupExpense");
const groupMembers = document.getElementById("groupMembers");
const nvCostInput = document.getElementById("nvCostInput");
const vgCostInput = document.getElementById("vgCostInput");
const nvGroupCostInput = document.getElementById("nvGroupCostInput");
const vgGroupCostInput = document.getElementById("vgGroupCostInput");
const nvCost = document.getElementById("nvCost");
const vgCost = document.getElementById("vgCost");
const nvGroupCost = document.getElementById("nvGroupCost");
const vgGroupCost = document.getElementById("vgGroupCost");

expenseType.addEventListener("change", function () {
  selfExpense.classList.add("hidden");
  friendsExpense.classList.add("hidden");
  friendGroupExpense.classList.add("hidden");

  if (this.value === "self") {
    selfExpense.classList.remove("hidden");
  } else if (this.value === "friends") {
    friendsExpense.classList.remove("hidden");
  } else if (this.value === "friendGroup") {
    friendGroupExpense.classList.remove("hidden");
  }
});

document.getElementById("groupSelect").addEventListener("change", function () {
  let children = groupMembers.querySelectorAll(".groupfriendslist");
  console.log(children);
  children.forEach((group) => {
    console.log(group);
    if (group.id === this.value) {
      group.classList.remove("hidden");
    } else {
      group.classList.add("hidden");
    }
  });
});
