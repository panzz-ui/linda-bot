export default {
  name: ".sticker",
  description: "Buat stiker dari gambar",
  async execute(sock, msg, args) {
    await sock.sendMessage(msg.key.remoteJid, { text: "Fitur stiker belum diaktifkan." });
  }
};
