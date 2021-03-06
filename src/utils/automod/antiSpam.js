/*
  Attempts to detect message spam and punishes spammy members.
*/

const punish = require("./punishments");

module.exports = async (msg, bot, cfg) => {
  const spam = bot.antiSpam.filter(s => s.guild === msg.channel.guild.id && s.id === msg.author.id && new Date().getTime() - s.date < 2500);
  if (!cfg.spamThreshold) cfg.spamThreshold = 7;

  // If the spam threshold is met
  if (spam.length >= cfg.spamThreshold) {
    cfg.spamPunishments.forEach(async punishment => {
      if (punishment === "Mute") punish.mute(msg, bot, cfg, spam);
      if (punishment === "Purge") punish.purge(msg, bot.antiSpam.filter(s => s.guild === msg.channel.guild.id && s.id === msg.author.id &&
        new Date().getTime() - s.date < 10000).map(s => s.msgid)).catch(() => {});
      if (punishment === "Warn") punish.warn(msg, bot, "Spam (Automod)");
      // Sends a message if msgOnPunishment is enabled
      if (cfg.msgOnPunishment) {
        const pmsg = await msg.channel.createMessage(bot.embed(
          `🔨 ${msg.author.username} ha sido ${cfg.spamPunishments.map(p => `${p.toLowerCase()}ed`).filter(p => p !== "purged").join(" y ")} por spam.`,
          null, "error"));
        setTimeout(() => pmsg.delete("AutoMod borró el mensaje").catch(() => {}), 3000);
      }
    });

    bot.antiSpam.forEach(a => {
      if (a.id !== msg.author.id) return;
      if (a.guild !== msg.channel.guild.id) return;
      bot.antiSpam.splice(bot.antiSpam.indexOf(a), 1);
    });
  }

  bot.antiSpam.push({
    date: new Date().getTime(),
    id: msg.author.id,
    guild: msg.channel.guild.id,
    content: msg.content,
    msgid: msg.id,
  });
};
