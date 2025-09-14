import fs from "fs";
import axios from "axios";

export default {
    name: "download",
    description: "Download file dari URL",
    async execute(bot, msg, args) {
        if (!args[0]) {
            return bot.sendMessage(msg.from, { text: "Kirim link yang ingin di-download!" });
        }

        const url = args[0];
        const fileName = `./tmp/download_${Date.now()}`;

        try {
            const response = await axios({ url, method: "GET", responseType: "arraybuffer" });
            fs.writeFileSync(fileName, response.data);

            await bot.sendMessage(msg.from, {
                document: fs.readFileSync(fileName),
                fileName: url.split("/").pop() || "file_download"
            });

            fs.unlinkSync(fileName); // Hapus file sementara
        } catch (error) {
            console.error(error);
            bot.sendMessage(msg.from, { text: "Gagal mendownload file!" });
        }
    }
};
