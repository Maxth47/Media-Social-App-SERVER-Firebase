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
      userHandle: "",
      body: "",
      createdAt: "",
      likeCount: 0,
      commentCount: 0
    }
  ],
  comments: [
    {
      userHandle: "",
      screamId: "",
      body: "",
      createdAt: ""
    }
  ],
  notifications: [
    {
      recipient: "",
      sender: "",
      read: "",
      screamId: "",
      type: "",
      createdAt: ""
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
      userHandle: "",
      screamId: ""
    },
    {
      userHandle: "",
      screamId: ""
    }
  ]
};
