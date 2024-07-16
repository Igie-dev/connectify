import asyncHandler from "express-async-handler";
import prisma from "../utils/prisma.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { dateNow, formatDate } from "../utils/dateUtil.js";
import otpEmail from "../utils/otpMailer.js";
const saltRounds = Number(process.env.SALTROUND);

const requestVerifyEmail = asyncHandler(async (req, res) => {
  const { userName, email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "All field are required!" });
  }
  try {
    const foundDuplicateEmail = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
      },
    });

    const foundDuplicateUserName = await prisma.user.findUnique({
      where: {
        user_name: userName,
      },
      select: {
        id: true,
      },
    });

    if (foundDuplicateEmail?.id || foundDuplicateUserName?.id) {
      return res
        .status(409)
        .json({ error: "Email or User name already exist!" });
    }

    const foundOtpExist = await prisma.otp.findUnique({ where: { email } });

    if (foundOtpExist?.id) {
      await prisma.otp.delete({ where: { email } });
    }

    const generateOtp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(generateOtp, saltRounds);
    const createOtp = await prisma.otp.create({
      data: {
        otp: hashedOtp,
        email,
      },
    });

    //send email
    await otpEmail(createOtp?.email, generateOtp);

    return res.status(200).json({
      email,
      message: "Otp sent",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

const register = asyncHandler(async (req, res) => {
  const { userName, email, password, otp } = req.body;

  if (!userName || !email || !password || !otp) {
    return res.status(400).json({ error: "All field are required!" });
  }
  try {
    const foundDuplicateEmail = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
      },
    });

    const foundDuplicateUserName = await prisma.user.findUnique({
      where: {
        user_name: userName,
      },
      select: {
        id: true,
      },
    });

    if (foundDuplicateEmail?.id || foundDuplicateUserName?.id) {
      return res
        .status(409)
        .json({ error: "Email or User name already exist!" });
    }

    const foundOtpExist = await prisma.otp.findUnique({ where: { email } });

    if (!foundOtpExist?.id) {
      return res.status(400).json({ error: "Invalid provided otp" });
    }

    const compareOtp = await bcrypt.compare(otp, foundOtpExist?.otp);

    if (!compareOtp) {
      return res.status(400).json({ error: "Invalid Otp!" });
    }

    const today = dateNow();
    const otpDate = formatDate(foundOtpExist?.createdAt);

    const isExpired =
      (today.getDate() !== otpDate.getDate()) |
      (today.getMinutes() > otpDate.getMinutes() + 5);

    if (isExpired) {
      return res.status(400).json({ error: "Otp expired! Please try again!" });
    }

    const decriptPass = await bcrypt.hash(password, Number(saltRounds));

    const generatedRandomId = `${crypto
      .randomInt(100000, 999999)
      .toString()}${userName.slice(0, 2).toUpperCase()}${Math.floor(
      Math.random() * 100000
    )}`;

    const data = {
      user_id: generatedRandomId,
      user_name: userName,
      email,
      password: decriptPass,
    };
    const createUser = await prisma.user.create({
      data,
    });

    if (!createUser?.id) {
      return res.status(500).json({ error: "Something went wrong" });
    }

    await prisma.otp.delete({ where: { email } });
    return res.status(201).json({ email, message: "Registered" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export { requestVerifyEmail, register };
