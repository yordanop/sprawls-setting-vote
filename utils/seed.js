const connection = require('../config/connection');
const { Thought, User } = require('../models');
const { getRandomName, getRandomThoughts } = require('./data');

connection.on('error', (err) => err);

connection.once('open', async () => {
  console.log('connected');
    // Delete the collections if they exist
    let thoughtCheck = await connection.db.listCollections({ name: 'thoughts' }).toArray();
    if (thoughtCheck.length) {
      await connection.dropCollection('thoughts');
    }

    let usersCheck = await connection.db.listCollections({ name: 'users' }).toArray();
    if (usersCheck.length) {
      await connection.dropCollection('users');
    }
  // Create empty array to hold the users
  const users = [];
  const friends = [];

  // Loop 20 times -- add students to the students array
  for (let i = 0; i < 20; i++) {
    // Get some random assignment objects using a helper function that we imported from ./data
    const thoughts = getRandomThoughts(20);

    const fullName = getRandomName();
    const username = fullName;
    const first = fullName.split(' ')[0];
    const email = `${first}${Math.floor(Math.random() * (99 - 18 + 1) + 18)}@gmail.com`;

    users.push({
      username,
      email,
      thoughts,
      friends : []
    });
  }

  // Function to get a random list of indices for friends
  function getFriendIndices(sameUserIndex, length, totalFriends) {
    const friendIndices = [];
    while (indices.size < totalFriends) {
      const friendIndex = Math.floor(Math.random() * length);
      if (friendIndex !== sameUserIndex) {
        friendIndices.push(friendIndex);
      }
    }
    return [...friendIndices];
  }

  // Assign friends to each user
  users.forEach((user, userIndex) => {
    const friendsArray = getFriendIndices(userIndex, users.length, 5);
    user.friends = friendsArray.map(friendIndex => users[friendIndex]);
  });


  // Add users to the collection and await the results
  await Student.create(users);

  // Log out the seed data to indicate what should appear in the database
  console.table(users);
  console.info('Seeding complete! 🌱');
  process.exit(0);
});
