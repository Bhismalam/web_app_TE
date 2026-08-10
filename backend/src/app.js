const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/athletes", require("./routes/athlete.routes"));
app.use("/api/events", require("./routes/event.routes"));
app.use("/api/time-trials", require("./routes/timeTrial.routes"));

module.exports = app;
