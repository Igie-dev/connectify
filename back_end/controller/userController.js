import asyncHandler from "express-async-handler";
import userRepo from "../repository/userRepo.js";
const getUsers = asyncHandler(async (req, res) => {
  const cursor = Number(req.query.cursor);
  const take = req.query.take;
  try {
    const users = await userRepo.getAll(cursor, take);
    const newCursor = users[users?.length - 1]?.id;
    return res.status(200).json({ cursor: newCursor, users: users });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ error: errorMessage });
  }
});

const getUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  try {
    const foundUser = await userRepo.getByUserId(userId);
    return res.status(200).json(foundUser);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ error: errorMessage });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { userId, userName } = req.body;
  if (!userId || !userName) {
    return res.status(400).json({ error: "All field are required" });
  }
  try {
    await userRepo.update({ userId, userName });
    return res.status(200).json({ message: "Successfully updated user" });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ error: errorMessage });
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  try {
    await userRepo.deleteUser(userId);
    return res.status(200).json({ message: "Successfully deleted user" });
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return res.status(500).json({ error: errorMessage });
  }
});

export { getUsers, updateUser, deleteUser, getUser };
