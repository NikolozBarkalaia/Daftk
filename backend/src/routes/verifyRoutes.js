const jwt = require("jsonwebtoken");

router.get("/verify/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);

    console.log("VERIFIED EMAIL:", decoded.email);

    // აქ შეგიძლია DB update:
    // user.verified = true

    return res.redirect("https://daftk.ge/");
  } catch (err) {
    return res.status(400).send("Invalid or expired token");
  }
});