const curr = new Date();
console.log(curr);
const first = curr.getDate() - curr.getDay() + 1;
const last = first + 6;
console.log(first, last);
