import asyncHandler from "express-async-handler";
import prisma from "../utils/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const audience = process.env.CLIENT_URL;
const issuer = process.env.BASE_URL;
const appName = process.env.APP_NAME;

//TODO fix cookie bugs
const signIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email | !password) {
    return res.status(400).json({ error: "Please provide all fields" });
  }

  try {
    const foundUser = await prisma.user.findUnique({ where: { email } });

    if (!foundUser?.id) {
      return res.status(401).json({ error: "Invalid login credintials" });
    }

    const isCorrectPass = await bcrypt.compare(password, foundUser?.password);

    if (!isCorrectPass) {
      return res.status(401).json({ error: "Invalid login credintials" });
    }

    const accessToken = jwt.sign(
      {
        User: {
          email: email,
          userName: foundUser?.user_name,
          userId: foundUser?.user_id,
        },
        aud: `${audience}`,
        iss: `${issuer}`,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    const refreshToken = jwt.sign(
      {
        userId: foundUser?.user_id,
        aud: `${audience}`,
        iss: `${issuer}`,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.cookie("c_rtoken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ accessToken });
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

const refresh = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  console.log("Cookie: ", JSON.stringify(cookies));
  if (!cookies?.c_rtoken) {
    return res.status(401).json({ error: "Unauthorized!" });
  }
  try {
    const refreshToken = cookies.c_rtoken;
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (error, decoded) => {
        if (error) {
          return res.status(403).json({ error: "Forbidden!" });
        }
        const userId = decoded.userId;
        if (!userId) {
          return res.status(401).json({ error: "Unauthorized!" });
        }
        const foundUser = await prisma.user.findUnique({
          where: { user_id: userId },
        });
        if (!foundUser?.id) {
          res.clearCookie("c_rtoken", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
          });
          return res.status(401).json({ error: "Cookie cleared!" });
        }

        const accessToken = jwt.sign(
          {
            User: {
              email: foundUser?.email,
              userName: foundUser?.user_name,
              userId: foundUser?.user_id,
            },
            aud: `${audience}`,
            iss: `${issuer}`,
          },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "1d",
          }
        );
        return res.status(200).json({ accessToken });
      }
    );
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

const signOut = asyncHandler(async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.sendStatus(204);
    }
    res.clearCookie("c_rtoken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });
    return res.json({ message: "Cookie cleared!" });
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export { signIn, refresh, signOut };
