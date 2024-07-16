import prisma from "../utils/prisma.js";
import { userDto, usersDto } from "../dto/userDto.js";
class UserRepo {
  //get all users
  userSelectData = {
    id: true,
    user_id: true,
    user_name: true,
    email: true,
    avatar_id: true,
    createdAt: true,
    updatedAt: true,
  };
  async getAll(cursor, take) {
    return new Promise(async (resolve, reject) => {
      try {
        const query = {
          orderBy: {
            id: "asc",
          },
          select: this.userSelectData,
        };
        if (Number(take) > 0) {
          query.take = Number(take);
        }
        if (cursor > 0) {
          query.cursor = {
            id: cursor,
          };
          query.skip = 1;
        }

        const users = await prisma.user.findMany(query);
        if (users?.length <= 0) {
          reject(new Error("No users found!"));
        }
        resolve(usersDto(users));
        return;
      } catch (error) {
        reject(error);
        return;
      }
    });
  }

  //Get user
  async getByUserId(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await prisma.user.findUnique({
          where: { user_id: userId },
          select: this.userSelectData,
        });

        if (!user?.id) {
          reject(new Error("User not found!"));
        }
        resolve(userDto(user));
        return;
      } catch (error) {
        reject(error);
        return;
      }
    });
  }

  async update({ userId, userName }) {
    return new Promise(async (resolve, reject) => {
      try {
        const update = await prisma.user.update({
          where: { user_id: userId },
          data: { user_name: userName },
        });

        if (!update?.id) {
          reject(new Error("Failed to update user!"));
          return;
        }
        resolve({ id: update?.id });
        return;
      } catch (error) {
        reject(error);
        return;
      }
    });
  }
  async deleteUser(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await this.getByUserId(userId);

        if (!user?.id) {
          reject(new Error("User not found!"));
          return;
        }

        const deletedUser = await prisma.user.delete({
          where: { user_id: userId },
        });

        if (!deletedUser?.id) {
          reject(new Error("Failed to delete user!"));
          return;
        }
        resolve({ id: user?.id });
        return;
      } catch (error) {
        reject(error);
        return;
      }
    });
  }
}

export default new UserRepo();
