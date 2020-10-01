const Command = require("../../structures/Command");
const format = require("../../utils/format");
const os = require("os");

class aboutCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["aboutbot", "info", "stats", "uptime"],
      description: "Devuelve información y estadísticas sobre el bot.",
      allowdms: true,
    });
  }

  run(msg) {
    // Formats OS platform
    function formatOS(platform, release) {
      switch (platform) {
        case "aix":
          return `IBM AIX ${release}`;
        case "android":
          return `Android ${release}`;
        case "darwin":
          return `macOS ${(parseFloat(release).toFixed(2) - parseFloat("7.6").toFixed(2) + parseFloat("0.03")).toFixed(2)}`;
        case "linux":
          return `Linux ${release}`;
        case "freebsd":
          return `FreeBSD ${release}`;
        case "openbsd":
          return `OpenBSD ${release}`;
        case "sunos":
          return `Solaris ${release}`;
        case "win32":
          return `Windows ${release}`;
        default:
          return platform;
      }
    }

    // Formats bytes
    function formatBytes(amount) {
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      if (amount === 0) return "N/A";
      const i = parseInt(Math.floor(Math.log(amount) / Math.log(1024)));
      if (i === 0) return amount + " " + sizes[i];
      return (amount / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
    }

    let useramnt = 0;
    this.bot.guilds.forEach(g => { useramnt += g.memberCount; });

    msg.channel.createMessage({
      embed: {
        title: "🤖 Informacion",
        description: `**${this.bot.user.username}**, hecho por Lykkev 💖`,
        color: this.bot.embed.color("general"),
        fields: [{
          name: "Analítica",
          value: `${useramnt} total usuarios \n` + `${this.bot.guilds.size} total servidores \n` +
            `${this.bot.commands.length} comandos \n` + `${this.bot.events.length} eventos \n` +
            `${format.uptime(process.uptime())} tiempo de actividad`,
          inline: true,
        }, {
          name: "Version",
          value: `Gvng v1.1 \n` + `Node.js ${process.version}\n` +
            `V8 v${process.versions.v8}`,
          inline: true,
        }, {
          name: "Host Info",
          value: `Bot usando ${formatBytes(process.memoryUsage().rss)} de memoria \n` +
            `Sistema usando ${formatBytes(os.totalmem() - os.freemem())} de memoria \n` +
            `Sistema listo para ${format.uptime(os.uptime())} \n` +
            `Que se ejecuta en ${formatOS(os.platform(), os.release())} ${os.arch()}`,
          inline: false,
        }, {
          name: "Informacion",
          value: `${this.bot.user.username} es un bot de Discord todo en uno fácil . \n` +
            `[Invite](https://discord.com/api/oauth2/authorize?client_id=760706188915769354&permissions=8&scope=bot) • [Support](https://discord.gg/ezKexuF) `,
        }],
        thumbnail: {
          url: this.bot.user.dynamicAvatarURL(),
        },
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = aboutCommand;
