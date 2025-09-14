import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import fs from "fs";
import path from "path";

// Load commands dynamically
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commandFiles = fs.readdirSync(path.join(__dirname, "commands")).filter(file => file.endsWith(".js"));
const commands = {};

for (const file of commandFiles) {
  const cmd = await import(`./commands/${file}`);
  commands[cmd.default.name] = cmd.default;
}

// MultiFileAuthState
const { state, saveCreds } = await useMultiFileAuthState("auth_info");

async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    version
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async m => {
    if (!m.messages) return;
    const msg = m.messages[0];
    if (!msg.message || !msg.key.fromMe) return;

    const text = msg.message.conversation || "";
    const args = text.split(" ");
    const cmdName = args.shift().toLowerCase();

    if (commands[cmdName]) {
      try {
        await commands[cmdName].execute(sock, msg, args);
      } catch (err) {
        console.error(err);
      }
    }
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if(connection === "close") {
      if((lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
        startBot(); // reconnect 24 jam
      }
    }
  });
}

startBot();
