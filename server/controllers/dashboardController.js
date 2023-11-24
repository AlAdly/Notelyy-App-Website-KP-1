  // dash.js
  const Note = require("../models/Notes");
  const mongoose = require("mongoose");

  /**
   * GET /
   * Dashboard
   */
  exports.dashboard = async (req, res) => {
    let perPage = 12;
    let page = req.query.page || 1;

    const locals = {
      title: "Dashboard",
      description: "Aplikasi Catatan NodeJS Gratis.",
    };

    try {
      let filterOptions = {};

      // Handle filter abjad
      if (req.query.filterAlphabet && req.query.filterAlphabet !== 'all' && req.query.filterAlphabet !== 'alphabetical') {
        filterOptions.title = { $regex: new RegExp(`^${req.query.filterAlphabet}`, "i") };
      }

      // Handle filter tanggal
      let sortOption = { updatedAt: -1 }; // Default: Terbaru
      if (req.query.filterDate === "oldest") {
        sortOption = { updatedAt: 1 };
      }

      // Menambahkan pengurutan berdasarkan judul jika filterAlphabet=alphabetical
      let sortTitleOption = {};
      if (req.query.filterAlphabet === 'alphabetical') {
        sortTitleOption = {  title : 1 };
      }

      console.log("Filter Alphabet:", req.query.filterAlphabet);
      const notes = await Note.find({ user: new mongoose.Types.ObjectId(req.user.id), ...filterOptions })
    .sort(sortTitleOption) // Sort berdasarkan judul jika filterAlphabet=alphabetical
    .sort(sortOption)      // Sort berdasarkan tanggal (atau yang lainnya)
    .skip(perPage * page - perPage)
    .limit(perPage)
    .lean();


      const count = await Note.countDocuments({ user: req.user.id, ...filterOptions });

      res.render('dashboard/index', {
        userName: req.user.firstName,
        locals,
        notes,
        layout: "../views/layouts/dashboard",
        current: page,
        pages: Math.ceil(count / perPage),
      });
    } catch (error) {
      console.log(error);
      res.status(500).send('Kesalahan Server Internal');
    }
  };

  /**
   * GET /
   * View Specific Note
   */
  exports.dashboardViewNote = async (req, res) => {
    const note = await Note.findById({ _id: req.params.id })
      .where({ user: req.user.id })
      .lean();

    if (note) {
      res.render("dashboard/view-note", {
        noteID: req.params.id,
        note,
        layout: "../views/layouts/dashboard",
      });
    } else {
      res.send("Something went wrong.");
    }
  };

  /**
   * PUT /
   * Update Specific Note
   */
  const moment = require('moment');

  exports.dashboardUpdateNote = async (req, res) => {
    try {
      const updatedNote = await Note.findOneAndUpdate(
        { _id: req.params.id },
        { title: req.body.title, body: req.body.body, updatedAt: Date.now() },
        { new: true }
      ).where({ user: req.user.id });

      // Format tanggal dan waktu menggunakan moment
      const formattedDateTime = moment(updatedNote.updatedAt).format(' h:mm A | D MMMM, YYYY');

      // Update catatan dengan informasi tanggal dan waktu
      await Note.findByIdAndUpdate(updatedNote._id, { formattedDate: formattedDateTime });

      res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * DELETE /
   * Delete Note
   */
  exports.dashboardDeleteNote = async (req, res) => {
    try {
      await Note.deleteOne({ _id: req.params.id }).where({ user: req.user.id });
      res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };



  /**
   * GET /
   * Add Notes
   */
  exports.dashboardAddNote = async (req, res) => {
    res.render("dashboard/add", {
      layout: "../views/layouts/dashboard",
    });
  };

  /**
   * POST /
   * Add Notes
   */

  exports.dashboardAddNoteSubmit = async (req, res) => {
    try {
      req.body.user = req.user.id;
      const newNote = await Note.create(req.body);

      // Format tanggal dan waktu menggunakan moment
      const formattedDateTime = moment(newNote.createdAt).format(' h:mm A | D MMMM, YYYY');

      // Update catatan dengan informasi tanggal dan waktu
      await Note.findByIdAndUpdate(newNote._id, { formattedDate: formattedDateTime });

      res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };






  /**
   * GET /
   * Search
   */
  exports.dashboardSearch = async (req, res) => {
    try {
      res.render("dashboard/search", {
        searchResults: "",
        layout: "../views/layouts/dashboard",
      });
    } catch (error) {}
  };

  /**
   * POST /
   * Search For Notes
   */
  exports.dashboardSearchSubmit = async (req, res) => {
    try {
      let searchTerm = req.body.searchTerm;
      const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

      const searchResults = await Note.find({
        $or: [
          { title: { $regex: new RegExp(searchNoSpecialChars, "i") } },
          { body: { $regex: new RegExp(searchNoSpecialChars, "i") } },
        ],
      }).where({ user: req.user.id });

      res.render("dashboard/search", {
        searchResults,
        layout: "../views/layouts/dashboard",
      });
    } catch (error) {
      console.log(error);
    }
  };

  

