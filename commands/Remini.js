import fs from "fs";
import axios from "axios";

export default {
    name: "remini",
    description: "Meningkatkan kualitas gambar menggunakan Remini",
    async execute(bot, msg, args) {
        if (!msg.hasMedia) {
            return bot.sendMessage(msg.from, { text: "Kirim gambar terlebih dahulu!" });
        }

        try {
            // Download gambar dari WhatsApp
            const buffer = await msg.downloadMedia();
            const inputFile = `./tmp/input_${Date.now()}.jpg`;
            const outputFile = `./tmp/output_${Date.now()}.jpg`;
            fs.writeFileSync(inputFile, buffer);

            // Contoh request ke API Remini (sesuaikan dengan API asli)
            const formData = new FormData();
            formData.append("image", fs.createReadStream(inputFile));

            const response = await axios.post("https://api.remini.ai/enhance", formData, {
                headers: formData.getHeaders()
            });

            const imgBuffer = Buffer.from(response.data, "base64");
            fs.writeFileSync(outputFile, imgBuffer);

            // Kirim hasil ke WhatsApp
            await bot.sendMessage(msg.from, {
                image: fs.readFileSync(outputFile),
                caption: "Berhasil meningkatkan kualitas gambar!"
            });

            fs.unlinkSync(inputFile);
            fs.unlinkSync(outputFile);

        } catch (error) {
            console.error(error);
            bot.sendMessage(msg.from, { text: "Gagal memproses gambar!" });
        }
    }
};
