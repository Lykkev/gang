/**
 * @fileoverview Bot guild update logger
 * @description Logs when the bot is added or removed from a guild
 * @module logger/botGuildUpdate
 */

const format = require("../utils/format");

module.exports = bot => {
  // Logs when added to a server
  if (!bot.config.logchannel) return;
  bot.on("guildCreate", async guild => {
    // Uncached guilds
    if (typeof guild !== "object" || !guild || !guild.name) return;
    const bots = guild.members.filter(m => m.bot).length;
    const owner = guild.members.get(guild.ownerID);
    bot.createMessage(bot.config.logchannel, {
      embed: {
        color: bot.embed.color("success"),
        author: {
          name: `Añadido a ${guild.name}`,
          icon_url: guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
        },
        thumbnail: {
          url: guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
        },
        fields: [{
          name: "ID",
          value: guild.id,
        }, {
          name: "Creado",
          value: format.date(guild.createdAt),
        }, {
          name: "Owner",
          value: `${bot.tag(owner)} (${owner.id})`,
        }, {
          name: "Miembros",
          value: `${guild.memberCount - bots} miembros, ${bots} bots`,
          inline: true,
        }, {
          name: "Region",
          value: format.region(guild.region),
          inline: true,
        }],
      },
    }).catch(() => {});
  });

  // Logs when removed from a server
  bot.on("guildDelete", async guild => {
    if (!bot.config.logchannel) return;
    // Uncached guilds
    if (typeof guild !== "object" || !guild || !guild.name) return;
    const bots = guild.members.filter(m => m.bot).length;
    const owner = guild.members.get(guild.ownerID);
    bot.createMessage(bot.config.logchannel, {
      embed: {
        color: bot.embed.color("error"),
        author: {
          name: `Eliminado de ${guild.name}`,
          icon_url: guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
        },
        thumbnail: {
          url: guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
        },
        fields: [{
          name: "ID",
          value: guild.id,
        }, {
          name: "Creado",
          value: format.date(guild.createdAt),
        }, {
          name: "Owner",
          value: `${bot.tag(owner)} (${owner.id})`,
        }, {
          name: "Miembros",
          value: `${guild.memberCount - bots} miembros, ${bots} bots`,
          inline: true,
        }, {
          name: "Region",
          value: format.region(guild.region),
          inline: true,
        }],
      },
    }).catch(() => {});
  });
};
