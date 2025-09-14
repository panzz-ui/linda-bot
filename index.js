import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import fs from "fs";
import fetch from "node-fetch";

// ====== CONFIG ======
const BOT_NAME = "Linda Bot";
const CUSTOM_CMD_FILE = "./customcmd.json";

// ====== FOLDER ======
if (!fs.existsSync("./downloads")) fs.mkdirSync("./downloads");
if (!fs.existsSync(CUSTOM_CMD_FILE)) fs.writeFileSync(CUSTOM_CMD_FILE, JSON.stringify({}));

// ====== HELPER FUNCTIONS ======
async function sendText(sock, jid, text) {
    await sock.sendMessage(jid, { text });
}

// Add custom command
async function addCmdCommand(sock, msg, text) {
    const parts = text.split(" ");
    if (parts.length < 3) return sendText(sock, msg.key.remoteJid, "Format: /addcmd <keyword> <response>");
    const keyword = parts[1];
    const response = parts.slice(2).join(" ");
    const data = JSON.parse(fs.readFileSync(CUSTOM_CMD_FILE));
    data[keyword] = response;
    fs.writeFileSync(CUSTOM_CMD_FILE, JSON.stringify(data, null, 2));
    sendText(sock, msg.key.remoteJid, `✅ Command '${keyword}' berhasil ditambahkan!`);
}

// AI dummy
async function aiCommand(sock, msg, text) {
    const query = text.replace("/ai ", "");
    sendText(sock, msg.key.remoteJid, `🤖 AI menjawab: "${query}" (dummy response)`);
}

// Game dummy
async function gameCommand(sock, msg) {
    sendText(sock, msg.key.remoteJid, "🎮 Game feature placeholder!");
}

// Sticker dummy
async function stickerCommand(sock, msg) {
    sendText(sock, msg.key.remoteJid, "🖼️ Sticker feature placeholder!");
}

// Remini dummy
async function reminiCommand(sock, msg, text) {
    const parts = text.split(" ");
    if (parts.length < 2) return sendText(sock, msg.key.remoteJid, "Format: /remini <url gambar>");
    const imageUrl = parts[1];
    sendText(sock, msg.key.remoteJid, `🖼️ Memperbaiki gambar: ${imageUrl} (dummy)`);
}

// Downloader
async function downloadCommand(sock, msg, text) {
    const parts = text.split(" ");
    if (parts.length < 2) return sendText(sock, msg.key.remoteJid, "Format: /download <url>");
    const url = parts[1];
    try {
        const res = await fetch(url);
        const buffer = await res.arrayBuffer();
        const fileName = url.split("/").pop() || "downloaded_file";
        fs.writeFileSync(`./downloads/${fileName}`, Buffer.from(buffer));
        sendText(sock, msg.key.remoteJid, `✅ File berhasil di-download: ${fileName}`);
    } catch (e) {
        sendText(sock, msg.key.remoteJid, `❌ Gagal download: ${e.message}`);
    }
}

// Menu
async function menuCommand(sock, msg) {
    const menuText = `
👋 Halo! Saya ${BOT_NAME}
📜 Daftar Perintah:

/ai <query> - Gunakan AI
/game - Mainkan game
/sticker - Buat sticker
/remini <url> - Perbaiki gambar
/download <url> - Download file
/addcmd <keyword> <response> - Tambah custom command
/menu - Tampilkan menu ini
`;
    sendText(sock, msg.key.remoteJid, menuText);
}

// ====== CONNECTION ======
const { state, saveCreds } = await useMultiFileAuthState("auth_info");
const sock = makeWASocket({ auth: state, printQRInTerminal: true });

sock.ev.on("creds.update", saveCreds);

// ====== MESSAGE HANDLER ======
sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    const msg = messages[0];
    if (!msg.message) return;
    const text = msg.message.conversation || msg.message?.extendedTextMessage?.text || "";
    if (!text) return;

    // Custom commands
    const data = JSON.parse(fs.readFileSync(CUSTOM_CMD_FILE));
    if (data[text]) {
        sendText(sock, msg.key.remoteJid, data[text]);
        return;
    }

    // Built-in commands
    if (text.startsWith("/ai")) await aiCommand(sock, msg, text);
    else if (text.startsWith("/game")) await gameCommand(sock, msg);
    else if (text.startsWith("/sticker")) await stickerCommand(sock, msg);
    else if (text.startsWith("/remini")) await reminiCommand(sock, msg, text);
    else if (text.startsWith("/download")) await downloadCommand(sock, msg, text);
    else if (text.startsWith("/addcmd")) await addCmdCommand(sock, msg, text);
    else if (text.startsWith("/menu")) await menuCommand(sock, msg);
});
