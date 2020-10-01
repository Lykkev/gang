/**
 * @fileoverview Message update logger
 * @description Logs when a message is deleted or modified
 * @module logger/messageUpdate
 */

const Logger = require("../structures/Logger");

module.exports = bot => {
  // Logging database
  const loggingdb = new Logger(bot.db);
  const canSend = async (guild, evchannel) => {
    if (!guild || !guild.channels) return;
    const canLog = await loggingdb.canLog(guild);
    if (!canLog) return;
    // Sets type
    const channel = await loggingdb.guildLogging(guild, "messageLogging", evchannel);
    if (guild.channels.has(channel)) return channel;
  };

  // Logs when a message is deleted
  bot.on("messageDelete", async msg => {
    // Finds channel; returns if it shouldn't log
    const channel = await canSend(msg.channel.guild, msg.channel.id);
    if (!channel || !msg || !msg.author || msg.author.id === bot.user.id) return;
    if (msg.content.length > 1024) msg.content.slice(768);
    bot.createMessage(channel, {
      embed: {
        color: bot.embed.color("error"),
        author: {
          name: `${bot.tag(msg.author, false)} mensaje fue eliminado.`,
          icon_url: msg.author.avatarURL,
        },
        fields: [{
          name: "Contenido",
          value: msg.content || "Sin contenido",
          inline: false,
        }, {
          name: "Canal",
          value: msg.channel.mention || "Sin canal",
          inline: true,
        }, {
          name: "ID",
          value: msg.id,
          inline: true,
        }],
        image: {
          url: msg.attachments && msg.attachments[0] ? msg.attachments[0].proxy_url : null,
        },
      },
    }).catch(() => {});
  });

  // Logs when a message is updated
  bot.on("messageUpdate", async (msg, oldmsg) => {
    // Finds channel; returns if it shouldn't log
    const channel = await canSend(msg.channel.guild, msg.channel.id);
    if (!channel || !oldmsg || !msg.author || msg.author.id === bot.user.id) return;
    if (msg.content === oldmsg.content) return;
    if (msg.content.length > 1024) msg.content.slice(768);
    if (oldmsg.content.length > 1024) oldmsg.content.slice(768);
    bot.createMessage(channel, {
      embed: {
        color: bot.embed.color("error"),
        author: {
          name: `${bot.tag(msg.author, false)} mensaje editado.`,
          icon_url: msg.author.avatarURL,
        },
        fields: [{
          name: "Antes",
          value: oldmsg.content || "Sin contenido",
          inline: false,
        }, {
          name: "Despues",
          value: msg.content || "Sin contenido",
          inline: false,
        }, {
          name: "Canal",
          value: msg.channel.mention || "No hay canal",
          inline: true,
        }, {
          name: "Mensaje",
          value: `[Ver](https://discord.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id})`,
          inline: true,
        }],
        image: {
          url: msg.attachments && msg.attachments[0] ? msg.attachments[0].proxy_url : null,
        },
      },
    }).catch(() => {});
  });
};
