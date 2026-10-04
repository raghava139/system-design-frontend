const users = [
  {
    name: "Raghavendra",
    age: 28,
  },
  {
    name: "Rajesh",
    age: 30,
  },
  {
    name: "Naresh",
    age: 12,
  },
  {
    name: "Dinesh",
    age: 50,
  },
  {
    name: "Mahesh",
    age: 8,
  },
];

function sortingByAge() {
  const data = users.sort((a, b) => a.age - b.age);
    return data;
}

console.log(sortingByAge());

module.exports = sortingByAge;