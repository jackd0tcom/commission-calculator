import { describe, expect, it } from "vitest";
import reducer from "./reducer";

const loggedInPayload = {
  userId: 3,
  firstName: "Ada",
  lastName: "Lovelace",
  profilePic: "https://example.com/ada.png",
  isAllowed: true,
  isAdmin: true,
  isSales: true,
};

describe("user reducer", () => {
  it("starts logged out without isSales", () => {
    const state = reducer(undefined, { type: "@@INIT" });
    expect(state.user).toEqual({
      userId: null,
      firstName: null,
      lastName: null,
      profilePic: null,
      isAllowed: false,
      isAdmin: false,
    });
    expect(state.user).not.toHaveProperty("isSales");
  });

  it("LOGIN copies admin, sales, and allowed flags", () => {
    const state = reducer(undefined, {
      type: "LOGIN",
      payload: loggedInPayload,
    });
    expect(state.user).toEqual(loggedInPayload);
  });

  it("LOGOUT clears ids and flags including isSales", () => {
    const loggedIn = reducer(undefined, {
      type: "LOGIN",
      payload: loggedInPayload,
    });
    const state = reducer(loggedIn, { type: "LOGOUT" });
    expect(state.user).toEqual({
      userId: null,
      firstName: null,
      lastName: null,
      profilePic: null,
      isAllowed: false,
      isAdmin: false,
      isSales: false,
    });
  });

  it("returns the same state for unknown actions", () => {
    const current = reducer(undefined, {
      type: "LOGIN",
      payload: loggedInPayload,
    });
    const next = reducer(current, { type: "NOPE" });
    expect(next).toBe(current);
  });
});
