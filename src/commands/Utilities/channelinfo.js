const Command = require("../../structures/Command");
const format = require("../../utils/format");

class channelinfoCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["cinfo"],
      args: "<channel:channel>",
      description: "Devuelve información sobre un canal.",
    });
  }

  run(msg, args, pargs) {
    const channel = pargs[0].value;
    if (channel.type === 4) return this.bot.embed("❌ Error", "No se proporcionó ningún **canal**.", msg, "error");

    const fields = [];
    fields.push({
      name: "ID",
      value: channel.id,
    });

    if (channel.parentID) fields.push({
      name: "Categoria",
      value: `${msg.channel.guild.channels.get(channel.parentID).name}`,
    });

    if (channel.topic) fields.push({
      name: "Tema",
      value: `${channel.topic}`,
    });

    fields.push({
      name: "Creado",
      value: `${format.date(channel.createdAt)} (${format.dateParse(new Date() / 1000 - channel.createdAt / 1000)} ago)`,
    });

    if (channel.type === 0) fields.push({
      name: "Información",
      value: `El canal ${channel.nsfw ? "es" : "no es"} NSFW y está en posición ${channel.position}.`,
    });

    if (channel.type === 2) fields.push({
      name: "Info",
      value: `La tasa de bits del canal es ${channel.bitrate / 1000}kbps y se limita a ${channel.userLimit > 0 ? `${channel.userLimit}` : "infinito"} usuarios.`,
    });

    msg.channel.createMessage({
      embed: {
        color: this.bot.embed.color("general"),
        fields: fields,
        author: {
          icon_url: msg.channel.guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
          name: `#${channel.name} (${channel.type === 0 ? "texto" : "voz"} canal)`,
        },
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = channelinfoCommand;
