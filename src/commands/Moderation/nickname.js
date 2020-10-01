const Command = require("../../structures/Command");

class nicknameCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["nick", "set-nick", "set-nickname"],
      args: "<member:member&strict> [nickname:string]",
      description: "Cambia el apodo de un usuario.",
      clientperms: "manageNicknames",
      requiredperms: "manageNicknames",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const nickname = args[1];

    // Clears nicknames
    if (nickname === "clear") {
      try {
        await msg.channel.guild.members.get(user.id).edit({ nick: null }, `Cambiado por ${this.bot.tag(msg.author, true)}`);
      } catch (err) {
        return this.bot.embed("❌ Error", `No se pudo borrar a **${user.username}** el apodo.`, msg, "error");
      }

      return this.bot.embed("✅ Listo", "Se borró el apodo.", msg, "success");
    }

    // Shows user's nickname
    if (!nickname && user.nick) {
      return this.bot.embed("📛 Nickname", `**${user.username}** el apodo es \`${user.nick}\`.`, msg);
    }

    // If user has no nickname
    if (!nickname && !user.nick) {
      return this.bot.embed("❌ Error", `**${user.username}** no tiene un apodo establecido.`, msg, "error");
    }

    // If nickname is too long
    if (nickname.length > 32) {
      return this.bot.embed("❌ Error", "El apodo debe tener 32 caracteres o menos.", msg, "error");
    }

    // Updates the nickname
    try {
      await msg.channel.guild.members.get(user.id).edit({ nick: nickname }, `Cambiado por ${this.bot.tag(msg.author, true)}`);
    } catch (err) {
      return this.bot.embed("❌ Error", `No se pudo cambiar el apodo a **${user.username}** .`, msg, "error");
    }

    this.bot.embed("✅ Listo", `**${user.username}** el apodo era ${!nickname.length ? "re" : ""}set.`, msg, "success");
  }
}

module.exports = nicknameCommand;
