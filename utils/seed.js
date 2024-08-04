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
  // Create empty array to hold the users and thoughts
  const users = [];
  const thoughts = [];

  // Loop 20 times -- add students to the students array
  for (let i = 0; i < 20; i++) {
    const fullName = getRandomName();
    const username = fullName;
    const first = fullName.split(' ')[0];
    const email = `${first}${Math.floor(Math.random() * (99 - 18 + 1) + 18)}@gmail.com`;

    users.push({
      username,
      email,
      thoughts: [],
      friends : []
    });
  }

  // Add users to the collection and await the results
  const createdUsers = await User.create(users);

  // Map usernames to user IDs
  const userMap = createdUsers.reduce((acc, user) => {
    acc[user.username] = user._id;
    return acc;
  }, {});

  for (let i = 0; i < 50; i++) {
    thoughts.push({
      thoughtText: getRandomThoughts(),
      username: createdUsers[Math.floor(Math.random() * createdUsers.length)].username  // Associate with the user's username
    });
  }

  // Insert thoughts into the collection
  const createdThoughts = await Thought.create(thoughts);
  // Map thought IDs to users
  const thoughtMap = createdThoughts.reduce((acc, thought) => {
  const userId = userMap[thought.username];
  if (userId) {
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(thought._id);
  }
    return acc;
  }, {});

  // Update users with their thoughts
  await Promise.all(createdUsers.map(user =>
    User.updateOne({ _id: user._id }, { $set: { thoughts: thoughtMap[user._id] || [] } })
  ));

  // Function to get a random list of indices for friends
  function getFriendIndices(sameUserIndex, length, totalFriends) {
    const friendIndices = new Set();
    while (friendIndices.size < totalFriends) {
      const friendIndex = Math.floor(Math.random() * length);
      if (friendIndex !== sameUserIndex) {
        friendIndices.add(friendIndex);
      }
    }
    return [...friendIndices];
  }

  
  // Assign friends to each user
  createdUsers.forEach((user, userIndex) => {
    const friendsArray = getFriendIndices(userIndex, createdUsers.length, 5);
    user.friends = friendsArray.map(friendIndex => {
      return createdUsers[friendIndex]._id;
    });
  });

// Update users with their friends
  await Promise.all(createdUsers.map(user =>
    User.updateOne(
      { _id: user._id },
      { $set: { friends: user.friends } }
    )
  ));


  console.table(users);

  // Log out the seed data to indicate what should appear in the database
  console.info('Seeding complete! 🌱');
  process.exit(0);

});
