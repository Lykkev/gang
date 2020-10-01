/**
 * @fileoverview Member update logger
 * @description Logs when a member joins or leaves
 * @module logger/memberUpdate
 */

const Logger = require("../structures/Logger");
const format = require("../utils/format");

module.exports = bot => {
  // Logging database
  const loggingdb = new Logger(bot.db);
  const canSend = async guild => {
    if (!guild || !guild.channels) return;
    const canLog = await loggingdb.canLog(guild);
    if (!canLog) return;
    // Sets type
    const channel = await loggingdb.guildLogging(guild, "memberLogging");
    if (guild.channels.has(channel)) return channel;
  };

  // Tries to log
  const trySend = async (guild, event, embed) => {
    const channel = await canSend(guild, event);
    if (channel) {
      bot.createMessage(channel, {
        embed: embed,
      }).catch(() => {});
    }
  };

  // Logs to the leaveJoin channel when a member joins
  bot.on("guildMemberAdd", async function(guild, member) {
    // Invalid member
    if (!member.username || !member.user && !member.user.username) return;
    bot.emit("loggingMemberAdd", guild, member);
    const guildconfig = await bot.db.table("guildconfig").get(guild.id).run();
    // Re-mutes muted members
    const muted = await bot.db.table("mutecache").run();
    const mute = muted.find(m => m.member === member.id && m.guild === guild.id);
    if (mute && guildconfig.mutedRole) await member.addRole(guildconfig.mutedRole, "Se unió después de ser silenciado").catch(() => {});
    // If no config
    if (!guildconfig || !guildconfig.leaveJoin) return;
    const leaveJoin = guildconfig.leaveJoin;
    const leavejoinchannel = guild.channels.find(c => c.id === leaveJoin);
    if (!leavejoinchannel) return;
    // Handler for custom join messages
    let joinMessage = `Bienvenido a **${guild.name}, **${member.username}.`;
    if (guildconfig.joinMessage && guildconfig.joinMessage.length < 2000) {
      joinMessage = guildconfig.joinMessage;
      joinMessage = joinMessage.replace("{member}", `${member.username}`);
      joinMessage = joinMessage.replace("{membercount}", `${guild.memberCount}`);
      joinMessage = joinMessage.replace("{servername}", `${guild.name}`);
    }
    // Sends when a member joined
    leavejoinchannel.createMessage({
      embed: {
        title: "🎉 Nuevo Miembro",
        description: joinMessage,
        color: bot.embed.color("success"),
      },
    }).catch(() => {});
  });

  // Logs to the leaveJoin channel when a member leaves
  bot.on("guildMemberRemove", async function(guild, member) {
    // Invalid member
    if (!member.username || !member.user && !member.user.username) return;
    bot.emit("loggingMemberRemove", guild, member);
    const guildconfig = await bot.db.table("guildconfig").get(guild.id).run();
    // If no config
    if (!guildconfig || !guildconfig.leaveJoin) return;
    const leaveJoin = guildconfig.leaveJoin;
    const leavejoinchannel = guild.channels.find(c => c.id === leaveJoin);
    if (!leavejoinchannel) return;
    // Handler for custom leave messages
    let leaveMessage = `Te echaremos de menos, ${member.username}.`;
    if (guildconfig.leaveMessage && guildconfig.leaveMessage.length < 2000) {
      leaveMessage = guildconfig.leaveMessage;
      leaveMessage = leaveMessage.replace("{member}", `**${member.username}**`);
      leaveMessage = leaveMessage.replace("{membercount}", `**${guild.memberCount}**`);
      leaveMessage = leaveMessage.replace("{servername}", `**${guild.name}**`);
    }
    // Sends when a member leaves
    leavejoinchannel.createMessage({
      embed: {
        title: "👋 Un miembro se fue",
        description: leaveMessage,
        color: bot.embed.color("error"),
      },
    }).catch(() => {});
  });

  // Logs details about a new member
  bot.on("loggingMemberAdd", (guild, member) => trySend(guild, "loggingMemberAdd", {
    color: bot.embed.color("success"),
    timestamp: new Date(),
    author: {
      name: `${bot.tag(member, true)} ingresó`,
      icon_url: member.avatarURL,
    },
    thumbnail: {
      url: member.user ? member.user.dynamicAvatarURL(null, 1024) : member.dynamicAvatarURL(null, 1024),
    },
    fields: [{
      name: "ID",
      value: member.id,
    }, {
      name: "Creado",
      value: format.date(member.user.createdAt),
    }, {
      name: "Dias de la cuenta",
      value: `**${Math.floor((new Date() - member.user.createdAt) / 86400000)}** dias`,
    }],
    footer: {
      icon_url: guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
      text: `${guild.name} ahora tiene ${guild.memberCount} miembros`,
    },
  }));

  // Logs details about a member that left
  bot.on("loggingMemberRemove", (guild, member) => trySend(guild, "loggingMemberRemove", {
    color: bot.embed.color("error"),
    timestamp: new Date(),
    author: {
      name: `${bot.tag(member, true)} left`,
      icon_url: member.avatarURL,
    },
    thumbnail: {
      url: member.user ? member.user.dynamicAvatarURL(null, 1024) : member.dynamicAvatarURL(null, 1024),
    },
    fields: [{
      name: "ID",
      value: member.id,
    }, {
      name: "Ingresó",
      value: format.date(member.joinedAt),
    }, {
      name: "Creado",
      value: format.date(member.user.createdAt),
    }, {
      name: "Dias de la cuenta",
      value: `**${Math.floor((new Date() - member.user.createdAt) / 86400000)}** dias`,
    }],
    footer: {
      icon_url: guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
      text: `${guild.name} ahora somos ${guild.memberCount} miembros`,
    },
  }));
};
