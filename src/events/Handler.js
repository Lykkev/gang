/**
 * @fileoverview Handler
 * @description Handles commands and their paramaters
 * @todo Stop using eris-additions and make our own global perm handler
 */

const Event = require("../structures/Event");
const eris = require("eris-additions")(require("eris"));
const sentry = require("@sentry/node");

/**
 * Listens for messages to check for commands
 * @param {Event} Handler
 * @listens messageCreate
 */

class Handler extends Event {
  constructor(...args) {
    super(...args, {
      name: "messageCreate",
    });
  }

  /**
   * Runs a command
   * @param {object} msg The message object
   * @param {string} [args] Raw args to use
   * @param {string} [pargs] Parsed args to use
   */

  async run(msg) {
    if (!msg || !msg.author || msg.author.bot) return;
    const blacklist = await this.bot.db.table("blacklist").run();
    if (blacklist.find(u => u.user === msg.author.id)) return;

    // DM handling & logger
    if (msg.channel instanceof eris.PrivateChannel && this.bot.config.logchannel) {
      const cmd = this.bot.commands.find(
        c => msg.content.toLowerCase().startsWith(`${this.bot.config.prefixes[0]}${c.id}`) || msg.content.toLowerCase().startsWith(c.id),
      );

      // Commands in dms
      if (cmd && cmd.allowdms) {
        cmd.run(msg, msg.content.substring(this.bot.config.prefixes[0].length + cmd.id.length + 1).split(" "));
      } else if (cmd && !cmd.allowdms) {
        this.bot.embed("❌ Error", "Ese comando solo se puede usar en un servidor.", msg, "error");
      }

      return this.bot.createMessage(this.bot.config.logchannel, {
        embed: {
          description: `${msg.content}`,
          color: this.bot.embed.color("general"),
          author: {
            icon_url: msg.author.dynamicAvatarURL(),
            name: `Mensaje enviado por ${this.bot.tag(msg.author)}`,
          },
          image: {
            url: msg.attachments.length !== 0 ? msg.attachments[0].url : "",
          },
        },
      }).catch(() => {});
    }

    let prefix;
    // Gets the command prefix and handles mention support
    const prefixes = this.bot.config.prefixes.map(p => msg.content.toLowerCase().startsWith(p)).indexOf(true);
    const guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();
    if (guildconfig && guildconfig.prefix && msg.content.toLowerCase().startsWith(guildconfig.prefix)) prefix = guildconfig.prefix;
    else if ((!guildconfig || !guildconfig.prefix) && (this.bot.config.prefixes && prefixes !== -1)) prefix = this.bot.config.prefixes[prefixes];
    else if (msg.content.startsWith(`<@!${this.bot.user.id}> `)) prefix = `<@!${this.bot.user.id}> `;
    else if (msg.content.startsWith(`<@${this.bot.user.id}> `)) prefix = `<@${this.bot.user.id}> `;
    else if (msg.content.startsWith(`<@${this.bot.user.id}>`)) prefix = `<@${this.bot.user.id}>`;
    else if (msg.content.startsWith(`<@!${this.bot.user.id}>`)) prefix = `<@!${this.bot.user.id}>`;
    if (!prefix) return;

    // Looks for the command ran
    const [cmdName, ...args] = msg.content.trim().slice(prefix.length).split(/ +/g);
    const cmd = this.bot.commands.find(c => c.id === cmdName.toLowerCase() || c.aliases.includes(cmdName.toLowerCase()));

    // Sends the prefix if mentioned with no content
    if (!cmdName.length && (prefix.startsWith(`<@${this.bot.user.id}>`) || prefix.startsWith(`<@!${this.bot.user.id}>`))) {
      return this.bot.embed(
        "🤖 Prefix",
        `El prefijo en este servidor es \`${guildconfig && guildconfig.prefix ? guildconfig.prefix : this.bot.config.prefixes[0]}\`.`,
        msg,
      );
    }

    let customcmd;
    if (guildconfig && guildconfig.customCommands) {
      customcmd = guildconfig.customCommands.find(c => c.name === cmdName);
    }

    // Sends the embed
    if (customcmd && !cmd) {
      // Mentioners
      if (msg.mentions && msg.mentions[0]) customcmd.content = customcmd.content.replace(/{mentioner}/g, `<@${msg.mentions[0].id}>`);
      else customcmd.content = customcmd.content.replace(/{mentioner}/g, `<@${msg.author.id}>`);

      // Replaces content
      customcmd.content = customcmd.content.replace(/{author}/g, `<@${msg.author.id}>`);
      customcmd.content = customcmd.content.replace(/{random}/g, Math.floor(Math.random() * 100));
      customcmd.content = customcmd.content.replace(/{guild}/g, msg.guild.name);

      return msg.channel.createMessage({
        embed: {
          title: `✨ ${customcmd.name}`,
          description: customcmd.content.substring(0, 2048),
          color: this.bot.embed.color("general"),
          image: {
            url: customcmd.image,
          },
          footer: {
            text: msg.guild.members.get(customcmd.createdBy) ?
              `Pedido por ${this.bot.tag(msg.author)} | Creado por ${this.bot.tag(msg.guild.members.get(customcmd.createdBy))}` : customcmd.name,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      });
    } else if (!cmd) return;

    // If the bot doesn't have sendMessages, dm the author
    if (!msg.channel.memberHasPermission(this.bot.user.id, "sendMessages")) {
      return msg.member.createMessage(`No tengo permiso para enviar mensajes en <#${msg.channel.id}>.`);
    }

    // If the bot doesn't have embed permission
    if (!msg.channel.memberHasPermission(this.bot.user.id, "embedLinks")) {
      return msg.channel.createMessage("Para funcionar correctamente, Necesito permiso para **insertar enlaces**.");
    }

    // Owner commands; disabled categories
    if (cmd.owner && !this.bot.config.owners.includes(msg.author.id)) return;
    if (guildconfig && (guildconfig.disabledCategories || []).includes(cmd.category) && cmd.allowdisable) {
      return this.bot.embed("❌ Error", "La categoría en la que se encuentra el comando está deshabilitada en este servidor.", msg, "error");
    }

    // Disabled commands
    if (guildconfig && (guildconfig.disabledCmds || []).includes(cmd.id) && cmd.allowdisable) {
      return this.bot.embed("❌ Error", "Ese comando está deshabilitado en este servidor.", msg, "error");
    }

    // Client perms
    if (cmd.clientperms) {
      const botperms = msg.channel.guild.members.get(this.bot.user.id).permission;

      // Sends plain message if no embed permissions
      if (!botperms.has("embedLinks")) {
        return msg.channel.createMessage("Para funcionar correctamente, necesito permiso para **insertar enlaces**.");
      }

      // Sends if lacks clientperms
      if (!botperms.has(cmd.clientperms)) {
        return this.bot.embed("❌ Error", `I need the **${cmd.clientperms}** permiso para ejecutar ese comando.`, msg, "error");
      }
    }

    // NSFW commands
    if (cmd.nsfw && !msg.channel.nsfw) {
      return this.bot.embed("❌ Error", "Ese comando solo se puede ejecutar en un canal NSFW.", msg, "error");
    }

    // Staff commands
    if (!msg.member.permission.has("administrator") && cmd.staff && guildconfig && guildconfig.staffRole && !msg.member.roles.includes(guildconfig.staffRole)) {
      return this.bot.embed("❌ Error", "Ese comando es solo para miembros del personal.", msg, "error");
    }

    // Required perms
    if (cmd.requiredperms && (!msg.member.permission.has(cmd.requiredperms) && !msg.member.permission.has("administrator")) && (!guildconfig || !guildconfig.staffRole)) {
      return this.bot.embed("❌ Error", `Necesitas el **${cmd.requiredperms}** permiso para ejecutar esto.`, msg, "error");
    }

    // Cooldowns
    if (cmd.cooldown && !this.bot.config.owners.includes(msg.author.id)) {
      if (this.bot.cooldowns.includes(`${cmd.id}:${msg.author.id}`)) return msg.addReaction("⌛");
    } else {
      this.bot.cooldowns.push(`${cmd.id}:${msg.author.id}`);
      setTimeout(() => {
        this.bot.cooldowns.splice(this.bot.cooldowns.indexOf(`${cmd.id}:${msg.author.id}`), 1);
      }, cmd.cooldown >= 1000 ? cmd.cooldown : cmd.cooldown * 1000);
    }

    // Command args
    let parsedArgs;
    if (cmd.args) {
      // Parses arguments
      parsedArgs = this.bot.args.parse(cmd.args, args.join(" "), cmd.argsDelimiter, msg);

      // Handles and sends missing arguments
      const missingargs = parsedArgs.filter(a => typeof a.value == "undefined" && !a.optional);
      if (missingargs.length) {
        return this.bot.embed("❌ Error", `No **${missingargs.map(a => a.name).join(" o ")}** fue dado.`, msg, "error");
      }
    }

    try {
      // Runs the command
      if (args.length) this.bot.log(`${this.bot.tag(msg.author)} uso ${cmd.id} en ${msg.channel.guild.name}: ${args}`);
      else { this.bot.log(`${this.bot.tag(msg.author)} uso ${cmd.id} en ${msg.channel.guild.name}`); }
      await cmd.run(msg, args, parsedArgs);
    } catch (err) {
      // Ignores timeouts and permission errors
      if (err && err.code && err.code === 10007 || err.code === 10008 || err.code === 10011 ||
        err.code === 10013 || err.code === 10026 || err.code === 50001 || err.code === 50007 || err.code === 90001 || err === "timeout") return;

      // Configures sentry info
      sentry.configureScope(scope => {
        scope.setUser({ id: msg.author.id, username: this.bot.tag(msg.author) });
        scope.setExtra("guild", msg.channel.guild.name);
      });

      // Logs the error
      sentry.captureException(err);
      console.error(err);
      return this.bot.embed("❌ Error", `Se produjo un error y se ha registrado. \n \`\`\`js\n${err}\n\`\`\``, msg, "error");
    }
  }
}

module.exports = Handler;
