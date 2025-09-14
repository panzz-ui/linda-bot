export default {
  name: ".game",
  description: "Main game",
  async execute(sock, msg, args) {
    await sock.sendMessage(msg.key.remoteJid, { text: "Kamu memenangkan 10 poin!" });
  }
};
