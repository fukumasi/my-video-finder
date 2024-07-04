const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = new User({ username, email, password });
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  try {
    console.log(`Reset password request received for email: ${email}`);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User with given email does not exist');
      return res.status(400).send('User with given email does not exist');
    }

    const token = jwt.sign({ _id: user._id }, process.env.RESET_PASSWORD_KEY, { expiresIn: '20m' });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Password Reset Link',
      html: `<h2>Please click on the given link to reset your password</h2>
             <p>${process.env.CLIENT_URL}/reset-password/${token}</p>`
    };

    console.log(`Sending email to ${email} with reset link`);
    await user.updateOne({ resetLink: token });
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        return res.status(400).send('Error sending email');
      } else {
        console.log('Email sent successfully');
        return res.status(200).send('Email has been sent');
      }
    });
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).send('Server error');
  }
});

router.put('/reset-password/:token', async (req, res) => {
  const { newPassword } = req.body;
  const resetLink = req.params.token;

  if (resetLink) {
    jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, async (err, decodedData) => {
      if (err) {
        console.log('Incorrect token or it is expired');
        return res.status(401).send('Incorrect token or it is expired');
      }
      try {
        const user = await User.findOne({ resetLink });
        if (!user) {
          console.log('User with this token does not exist');
          return res.status(400).send('User with this token does not exist');
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetLink = '';
        await user.save();
        console.log('Password has been changed successfully');
        res.status(200).send('Your password has been changed');
      } catch (error) {
        console.log('Server error:', error);
        res.status(500).send('Server error');
      }
    });
  } else {
    console.log('Authentication error!');
    return res.status(401).send('Authentication error!');
  }
});

module.exports = router;
