/********************************************************************************
 * WEB322 – Assignment 04
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Ji Ho Nam Student ID: 139817217 Date: Nov 13, 2023
 *
 * Published URL: https://teal-energetic-sea-urchin.cyclic.app
 *
 ********************************************************************************/
const path = require("path");
const legoData = require("./modules/legoSets");
const express = require("express");
const app = express();
const port = 8080;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); // Add urlencoded middleware

legoData.Initialize().then(() => {
  app.get("/", (req, res) => {
    res.render("home");
  });

  // GET /lego/addSet
  app.get("/lego/addSet", (req, res) => {
    legoData
      .getAllThemes()
      .then((themes) => {
        res.render("addSet", { themes: themes });
      })
      .catch((error) => {
        res.status(500).render("500", {
          message: `I'm sorry, but we have encountered the following error: ${error}`,
        });
      });
  });

  // POST /lego/addSet
  app.post("/lego/addSet", (req, res) => {
    const setData = req.body;
    legoData
      .addSet(setData)
      .then(() => {
        res.redirect("/lego/sets");
      })
      .catch((error) => {
        res.status(500).render("500", {
          message: `I'm sorry, but we have encountered the following error: ${error}`,
        });
      });
  });

  // GET "/lego/editSet/:num"
  app.get("/lego/editSet/:num", (req, res) => {
    const setNum = req.params.num;

    // Make requests to Promise-based functions
    Promise.all([legoData.getSetByNum(setNum), legoData.getAllThemes()])
      .then(([setData, themeData]) => {
        // Render the "edit" view with theme and set data
        res.render("editSet", { themes: themeData, set: setData });
      })
      .catch((err) => {
        // Render the "404" view with an appropriate message if there's an error
        res.status(404).render("404", { message: err });
      });
  });

  // POST "/lego/editSet"
  app.post("/lego/editSet", (req, res) => {
    const { set_num, ...setData } = req.body;

    // Make request to Promise-based "editSet" function
    legoData
      .editSet(set_num, setData)
      .then(() => {
        // Redirect the user to "/lego/sets" on success
        res.redirect("/lego/sets");
      })
      .catch((err) => {
        // Render the "500" view with an appropriate message if there's an error
        res.status(500).render("500", {
          message: `I'm sorry, but we have encountered the following error: ${err}`,
        });
      });
  });

  // GET "/lego/deleteSet/:num"
  //delete
  app.get("/lego/deleteSet/:num", async (req, res) => {
    try {
      const setNum = req.params.num;
      await legoData.deleteSet(setNum);
      res.redirect("/lego/sets");
    } catch (error) {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${
          error.message || "Unknown error"
        }`,
      });
    }
  });

  app.get("/lego/sets", (req, res) => {
    const theme = req.query.theme;

    if (theme) {
      legoData
        .getSetsByTheme(theme)
        .then((sets) => {
          res.render("sets", { sets });
        })
        .catch((error) => {
          res.status(404).json({ error });
        });
    } else {
      legoData
        .getAllSets()
        .then((sets) => {
          res.render("sets", { sets });
        })
        .catch((error) => {
          res.status(404).json({ error });
        });
    }
  });

  app.get("/lego/sets/:setNum", (req, res) => {
    const setNum = req.params.setNum;
    legoData
      .getSetByNum(setNum)
      .then((set) => {
        if (set) {
          res.render("set", { set: set });
        } else {
          res.status(404).render("404");
        }
      })
      .catch((error) => {
        res.status(404).render("404");
      });
  });

  app.get("/about", (req, res) => {
    res.render("about");
  });

  app.use((req, res) => {
    res.status(404).render("404", {
      message: "I'm sorry, we're unable to find what you're looking for",
    });
  });

  app.get("/", (req, res) => {
    res.render("home");
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
