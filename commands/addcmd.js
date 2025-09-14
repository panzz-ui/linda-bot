import fs from "fs";
const customCmdFile = "./customcmd.json";

export default {
  name: ".addcmd",
  description: "Tambah command custom",
  async execute(sock, msg, args) {
    const [cmd, ...res] = args;
    if(!cmd) return;
    const resText = res.join(" ") || "Tidak ada balasan";

    let data = {};
    if(fs.existsSync(customCmdFile)) data = JSON.parse(fs.readFileSync(customCmdFile));

    data[cmd] = resText;
    fs.writeFileSync(customCmdFile, JSON.stringify(data, null, 2));
    await sock.sendMessage(msg.key.remoteJid, { text: `Command ${cmd} berhasil ditambahkan!` });
  }
};
