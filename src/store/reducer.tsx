const initialState = {
  user: {
    userId: null,
    firstName: null,
    lastName: null,
    profilePic: null,
    isAllowed: false,
    isAdmin: false,
  },
};

const LOGIN = "LOGIN";
const LOGOUT = "LOGOUT";

const reducer = (state = initialState, action: any) => {

  switch (action.type) {
    case LOGIN:
      return {
        user: {
          userId: action.payload.userId,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          profilePic: action.payload.profilePic,
          isAllowed: action.payload.isAllowed,
          isAdmin: action.payload.isAdmin ? "admin" : false,
        },
      };
    case LOGOUT:
      return {
        user: {
          userId: null,
          firstName: null,
          lastName: null,
          profilePic: null,
          isAllowed: false,
          isAdmin: false,
        },
      };
    default:
      return state;
  }
};

export default reducer;
