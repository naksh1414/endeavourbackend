import "dotenv/config";
import User from "../models/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Team from "../models/teams.js";
import { getUser, setUser } from "../service/auth.js";
import nodemailer from "nodemailer";

export async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ msg: "Invalid Credentials" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      const token = setUser(user);
      res.cookie("token", token, { httpOnly: true, secure: true });
      return res.status(200).json({
        exists: "exists",
        token: token,
        username: user.userName,
        userId: user._id.toString(),
      });
    } else {
      return res.json({ msg: "Invalid email or password" });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function handleOTPSending(req, res) {
  try {
    const { email, OTP } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json("Invalid Credentials");
    }
    const token = setUser(user);

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
    var mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Password",
      text: `Your OTP IS ${OTP}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        // console.log(error);
        return res.json(error);
      } else {
        return res.json("Success");
      }
    });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function handleForgetPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json("Invalid Credentials");
    }
    const token = setUser(user);

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
    var mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Password",
      text: `${process.env.BASE_URL_FE}/endeavour/reset-password/${user._id}/${token}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        // console.log(error);
        return res.json(error);
      } else {
        return res.json("Success");
      }
    });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function handleResetPassword(req, res) {
  try {
    const { id, token, password } = req.body;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.json("Error with token");
      } else {
        const user = await User.findOne({ _id: id });
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          return res.json("Don't use same password :]")
        }
        const salt = bcrypt.genSaltSync(11);
        const hash_password = await bcrypt.hash(password, salt);
        await User.findByIdAndUpdate({ _id: id }, { password: hash_password });
        return res.json("Successfully Changed the password");
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function handleRegister(req, res) {
  const { email, password, phoneNumber, username } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      res.json("User Already Exists");
    } else {
      const salt = bcrypt.genSaltSync(11);
      const hash_password = await bcrypt.hash(password, salt);
      const user = new User({
        userName: username,
        password: hash_password,
        email,
        phoneNumber,
      });
      user
        .save()
        .then((user) => {
          const token = setUser(user);
          res.cookie("token", token, { httpOnly: true, secure: true });
          res.json({
            msg: "User saved :)",
            token: token,
            username: user.userName,
          });
        })
        .catch((err) => {
          console.log(err);
          res.json("Error saving user :(");
        });
    }
  } catch (error) {
    res.json(error);
  }
}

export async function handleMemberSearch(req, res) {
  const { memberId, event } = req.body;
  try {
    const member = await User.find({ _id: memberId });
    if (member) {
      const alreadyInTeam = await User.find({
        $and: [{ _id: memberId }, { "events.eventId": event }],
      });
      if (alreadyInTeam.length > 0) {
        res.json("Already In A Team");
      } else {
        res.json(member[0].userName);
      }
    } else {
      res.json("User Not Exists");
    }
  } catch (error) {
    res.json("User Not Exists");
  }
}

export async function handleRegisterTeam(req, res) {
  const { filteredData, teamName, leaderName, eventId } = req.body;
  console.log(eventId);
  try {
    const user = await User.findOne({
      userName: leaderName,
    });

    if (user) {
      const leaderId = user._id;

      const team = new Team({
        leaderId,
        teamName,
        teamMembers: filteredData.map((member) => member.userId),
        eventId,
        paymentCompleted: true,
      });
      await team.save();

      const teamId = await Team.findOne({
        leaderId,
      });

      filteredData.push({ userId: leaderId });

      filteredData
        .map((member) => member.userId)
        .forEach(async (userId) => {
          try {
            await User.updateOne(
              { _id: userId },
              { $push: { events: { eventId, teamId: teamId._id } } }
            );
          } catch (error) {
            res.json("Error, Please Try again after sometime");
          }
        });

      res.json("Team Created Successfully");
    } else {
      res.json("User Not Exists");
    }
  } catch (error) {
    res.json(error);
  }
}

export async function handleGoogleLogin(req, res) {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      const token = setUser(user);
      res.cookie("token", token, { httpOnly: true, secure: true });
      return res.json({
        exists: "true",
        userName: user.userName,
        email: user.email,
        userId: user._id,
        token,
      });
    } else {
      return res.json({
        exists: "false",
      });
    }
  } catch (error) {
    // console.error("Error during Google login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function handleGoogleRegister(req, res) {
  const { email, userName } = req.body;
  try {
    const user = await User.findOne({
      $and: [{ email: email }],
    });
    if (user) {
      res.json("User Already Exists");
    } else {
      const user = new User({
        email,
        userName: userName,
      });

      user
        .save()
        .then((user) => {
          const token = setUser(user);
          console.log(token);
          res.cookie("token", token, { httpOnly: true, secure: true });
          return res.json({
            created: true,
          });
        })
        .catch((err) => {
          res.json("Error saving user:", err);
        });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
