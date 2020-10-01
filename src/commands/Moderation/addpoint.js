const { Snowflake } = require("../../utils/snowflake");
const Command = require("../../structures/Command");

class addpointCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["addmerit", "addrep", "addreputation", "merit"],
      args: "<member:member&strict> [reason:string]",
      description: "Le da a un miembro un punto de reputación.",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    // Generates the id
    const id = Snowflake();
    const user = pargs[0].value;
    let reason = args.slice(1).join(" ");
    if (reason.length > 512) reason = reason.slice(0, 512);

    // Inserts info
    await this.bot.db.table("points").insert({
      giver: msg.author.id,
      receiver: user.id,
      guild: msg.channel.guild.id,
      id: id,
      reason: reason || "No se proporcionó ninguna razón.",
    }).run();

    this.bot.emit("pointAdd", msg.channel.guild, msg.member, user, id, reason || "Sin motivo proporcionado.");
    this.bot.embed("✨ Reputación", `**${user.username}** se le dio un punto de reputación.`, msg);
  }
}

module.exports = addpointCommand;
