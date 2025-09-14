export default {
  name: ".ai",
  description: "AI chat",
  async execute(sock, msg, args) {
    const reply = args.join(" ") || "Tulis pertanyaan AI!";
    await sock.sendMessage(msg.key.remoteJid, { text: `AI says: ${reply}` });
  }
};
