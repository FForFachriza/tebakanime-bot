import axios from "axios";
import { env } from "bun";
import { Bot } from "grammy";
import type { ResponseTypes } from "./types/animefetch.type";
axios.defaults.headers.common["Accept-Encoding"] = "gzip";

const bot = new Bot(env.TELEGRAM_API || "");

bot.command("start", (ctx) =>
  ctx.reply(`<b>Hi! Selamat Datang Di Bot Anime Apatuh!</b> \n\nSilahkan Kirim Foto Scene Anime Untuk Melanjutkan`, {
    parse_mode: "HTML",
    reply_parameters: { message_id: ctx.msg.message_id },
  })
);

bot.on("message:photo", async (ctx) => {
  const picture = ctx.msg.photo;

  const file = await ctx.getFile();
  const path = file.file_path;

  if (!path) {
    return ctx.reply("Error File Tidak Ditemui");
  }

  await imageDownloader(path);

  try {
    const getImage = Bun.file(path);
    const imageBuffer = await getImage.arrayBuffer();

    const { data }: { data: ResponseTypes } = await axios.post("https://api.trace.moe/search", imageBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
      },
    });

    const sortByHighestPercent = data.result.sort((a, b) => b.similarity - a.similarity);

    for (const result of sortByHighestPercent) {
      ctx.replyWithVideo(result.video, {
        caption: `
        <b>${result.filename}</b> \nFrom ${timeFormatter(result.from)} To ${timeFormatter(result.to)} \nSimilarity ${(
          result.similarity * 100
        ).toFixed(2)}%`,
        reply_parameters: { message_id: ctx.msg.message_id },
        parse_mode: "HTML",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

async function imageDownloader(path: string) {
  try {
    const result = await fetch(`https://api.telegram.org/file/bot${env.TELEGRAM_API}/${path}`);
    const pathOutput = `./${path}`;
    await Bun.write(pathOutput, result);
  } catch (error) {
    console.log(error);
  }
}

function timeFormatter(time: number): string {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const remainingSeconds = Math.floor(time % 60);

  const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;

  return formattedTime;
}

bot.start();
