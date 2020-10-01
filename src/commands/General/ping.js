const Command = require("../../structures/Command");

class pingCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["pong"],
      description: "Devuelve la latencia del bot.",
      allowdisable: false,
    });
  }

  async run(msg) {
    const pingmsg = await this.bot.embed("🏓 Ping", `API Latencia: ${msg.channel.guild.shard.latency}ms.`, msg);
    this.bot.embed.edit("🏓 Pong!", `Este mensaje tomó ${pingmsg.timestamp - msg.timestamp}ms.`, pingmsg);
  }
}

module.exports = pingCommand;
