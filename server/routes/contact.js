const express = require('express');
const router =  express.Router();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
// Middleware untuk mem-parsing form data
router.use(bodyParser.urlencoded({ extended: true }));

// Serve halaman indeks
router.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle pengiriman email saat formulir dikirim
router.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  // Konfigurasi transporter untuk Gmail
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'notelyyapp@gmail.com',
        pass: 'rvfd fenj yccz dkpd',
    },
  });

  // Konfigurasi email
  let mailOptions = {
    from: email , // Alamat email pengirim
    to: 'notelyyapp@gmail.com', // Alamat email penerima
    subject: 'Feedback from ' + name,
    text: 'Name: ' + name + '\nEmail: ' + email + '\nMessage: ' + message
  };

  // Kirim email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Email sent: ' + info.response);
      res.redirect('/'); // Redirect kembali ke halaman indeks setelah pengiriman berhasil
    }
  });
});

module.exports = router;

