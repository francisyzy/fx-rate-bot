import { PrismaClient } from "@prisma/client";
import bot from "../lib/bot";
import { parseNumber } from "../utils/parseNum";
import { getMaster, getUnion } from "../utils/pullRates";
import { toEscapeMsg } from "../utils/messageHandler";
import { getBotCommands } from "../utils/botCommands";

const prisma = new PrismaClient();

const catchNumber = () => {
  try {
    bot.command("start", (ctx) => {
      ctx.setMyCommands(getBotCommands());
      return ctx.reply(
        "Hi, this bot converts numbers in KRW to SGD. \n\n/set_0.00103627 to set ur rate. If you have your number in 965 format, do quick math 1/965 = 0.00103627 to get the rate this bot needs. \n\nThen just insert numbers and it will get you the current rates. No visa because they are a PITA dont let me scrape their website and their API is like 50 step process. \n\n no gurantees on the rates the 3 appended is * 1.0325 bank rate(idk what ur bank charges but i just presume is 3.25% max). https://www.perplexity.ai/search/DBS-union-pay-Ofr6kjw8QfW3B0jvyKyMnw?s=c \nRates sources:\nVisa: https://www.visa.com.sg/support/consumer/travel-support/exchange-rate-calculator.html\nMaster: https://www.mastercard.us/en-us/personal/get-support/convert-currency.html\nUnion: https://www.unionpayintl.com/en/rate/\n\n/start to see this again if u want",
        { disable_web_page_preview: true },
      );
    });
    bot.hears(/\/set_(.+)/, async (ctx) => {
      const rate = Number(ctx.match[1]);
      await prisma.user.upsert({
        where: { telegramId: ctx.from.id },
        update: { setFx: rate },
        create: {
          telegramId: ctx.from.id,
          name: ctx.from.first_name,
          setFx: rate,
        },
      });
      return ctx.reply(
        "Set the exchange rate of 1 KWR to " + rate + " SGD",
      );
    });
    bot.on("text", async (ctx) => {
      const input = parseNumber(ctx.message.text);
      if (Number.isNaN(input)) {
        return ctx.reply(
          "You didn't give a number. I will take the first number",
        );
      }
      const user = await prisma.user.findUnique({
        where: { telegramId: ctx.from.id },
      });
      if (user) {
        const userRate = user.setFx * input;
        const allUnionRates = await getUnion();
        // console.log(allUnionRates);
        const unionRates = allUnionRates.exchangeRateJson.find(
          (item: any) =>
            item.transCur === "KRW" && item.baseCur === "SGD",
        );
        const masterRates = await getMaster();
        // console.log(masterRates);
        // console.log(unionRates);

        const masterRate0 = masterRates.data.conversionRate * input;
        const masterRate3 = masterRate0 * 1.0325;

        const unionRate0 = unionRates.rateData * input;
        const unionRate3 = unionRate0 * 1.0325;

        const output = `${input} KWR
\`Your    Rate\`: ${toEscapeMsg(userRate.toFixed(4))} SGD
\`Master  Date\`: _${toEscapeMsg(masterRates.date)}_
\`Master  Rate\`: ${toEscapeMsg(masterRate0.toFixed(4))} SGD
\`Master3 Rate\`: ${toEscapeMsg(masterRate3.toFixed(4))} SGD
\`Union   Date\`: _${toEscapeMsg(allUnionRates.curDate)}_
\`Union   Rate\`: ${toEscapeMsg(unionRate0.toFixed(4))} SGD
\`Union3  Rate\`: ${toEscapeMsg(unionRate3.toFixed(4))} SGD
        `;
        return ctx.replyWithMarkdownV2(output);
      }
    });
  } catch (error) {
    console.log(error);
  }
  bot.action("delete", (ctx) => ctx.deleteMessage());
};

export default catchNumber;
