let db = {
  users: [
    {
      userId: "",
      email: "",
      handle: "",
      createdAt: "",
      imageUrl: "",
      bio: "",
      website: "",
      location: ""
    }
  ],
  screams: [
    {
      userHandle: "user",
      body: "this is a scream",
      createdAt: "2019-08-05T22:27:33.206Z",
      likeCount: 5,
      commentCount: 2
    }
  ]
};

const userDetails = {
  //Redux data
  credentials: [
    {
      userId: "",
      email: "",
      handle: "",
      createdAt: "",
      imageUrl: "",
      bio: "",
      website: "",
      location: ""
    }
  ],
  likes: [
    {
      userHandle: "user",
      screamId: ""
    },
    {
      userHandle: "user",
      screamId: ""
    }
  ]
};
