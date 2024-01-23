const express = require("express");
const { Client, RemoteAuth } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
const cors = require("cors");

const qrcode = require("qrcode-terminal");
const databaseURI =
  "mongodb+srv://nsi:berasputih@total-transaksi.ratthxt.mongodb.net/db_whatsapp";
let client;
let store;

const app = express();
const port = 2222; // Anda bisa memilih port lain

app.use(cors());
app.use(express.json());

mongoose.connect(databaseURI).then(() => {
  store = new MongoStore({ mongoose: mongoose });
  console.log("connect to database");
});

const createWhatsapp = (id) => {
  client = new Client({
    puppeteer: {
      headless: false,
    },
    authStrategy: new RemoteAuth({
      clientId: id,
      store: store,
      backupSyncIntervalMs: 300000,
    }),
  });

  client.on("qr", (qr) => {
    console.log("QR received!");
    //   qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("Client is ready!");
  });

  client.on("remote_session_saved", async () => {
    console.log("session saved");
  });

  client.on("disconnected", (reason) => {
    console.log("Client is disconnected:", reason);
  });

  client.initialize();
};

const getWhatsappSession = (id) => {
  client = new Client({
    puppeteer: {
      headless: false,
    },
    authStrategy: new RemoteAuth({
      clientId: id,
      store: store,
      backupSyncIntervalMs: 300000,
    }),
  });

  client.on("qr", (qr) => {
    console.log("QR received!");
    //   qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("Client is ready!");
  });

  client.initialize();
};

app.get("/create", async (req, res) => {
  try {
    const result = createWhatsapp(req.query.id);
    res.status(201).json({
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

app.get("/session", async (req, res) => {
  try {
    const result = getWhatsappSession(req.query.id);
    res.status(200).json({ message: "Session initialized successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

app.post("/send-message", (req, res) => {
  const number = req.body.number;
  const message = req.body.message;

  if (!number || !message) {
    return res
      .status(400)
      .send({ status: "error", message: "Number and message are required" });
  }

  client
    .sendMessage(number + "@c.us", message)
    .then((response) => {
      res.send({ status: "success", response });
    })
    .catch((err) => {
      res.status(500).send({ status: "error", message: err.toString() });
    });
});

app.listen(port, () => {
  console.log(`WhatsApp API server running on port ${port}`);
});
