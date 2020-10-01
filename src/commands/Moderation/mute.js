const Command = require("../../structures/Command");
const hierarchy = require("../../utils/hierarchy");

class muteCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["m", "silence", "shutup"],
      args: "<member:member> [reason:string]",
      description: "Silencia a un miembro.",
      clientperms: "manageRoles",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    let reason = args.slice(1).join(" ");
    if (!reason.length) reason = "Sin motivo proporcionado.";
    else if (reason.length > 512) reason = reason.slice(0, 512);

    // Reads db; finds role
    const guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();

    if (!guildconfig || !guildconfig.mutedRole) {
      await this.bot.db.table("guildconfig").insert({
        id: msg.channel.guild.id,
      }).run();

      return this.bot.embed("❌ Error", "La función mute aún no se ha configurado.", msg, "error");
    }

    // If bot doesn't have high enough role
    if (!hierarchy(msg.channel.guild.members.get(this.bot.user.id), user)) {
      return this.bot.embed("❌ Error", `No tengo un rol lo suficientemente alto para silenciar a **${user.username}**.`, msg, "error");
    }

    // If member is already muted
    if (user.roles.includes(guildconfig.mutedRole)) {
      return this.bot.embed("❌ Error", `**${user.username}** ya tiene el rol mute.`, msg, "error");
    }

    // If author is above member
    if (hierarchy(msg.member, user)) {
      await this.bot.db.table("mutecache").insert({
        role: "",
        member: user.id,
        guild: msg.channel.guild.id,
      }).run();

      // Mutes if no roles
      if (!user.roles.length) {
        try {
          await user.addRole(guildconfig.mutedRole, `Muteado por ${this.bot.tag(msg.author)} , razón ${reason}`);
        } catch (err) {
          return this.bot.embed("❌ Error", `No se pudo mutear a **${user.username}**.`, msg, "error");
        }

        this.bot.emit("memberMute", msg.channel.guild, msg.member, user, reason);
        return this.bot.embed("✅ Listo", `**${user.username}** esta silenciado.`, msg, "success");
      }

      // If member has roles
      await user.roles.forEach(async roles => {
        await this.bot.db.table("mutecache").insert({
          role: roles,
          member: user.id,
          guild: msg.channel.guild.id,
        }).run();

        // Removes other roles
        try {
          await msg.channel.guild.removeMemberRole(user.id, roles);
        } catch (err) {
          return this.bot.embed("❌ Error", `No se pudo eliminar a **${user.username}** otros roles.`, msg, "error");
        }
      });

      // Mutes the member
      try {
        await user.addRole(guildconfig.mutedRole, `Muteado por ${this.bot.tag(msg.author)} , razón ${reason}`);
      } catch (err) {
        return this.bot.embed("❌ Error", `No se pudo mutear a **${user.username}**.`, msg, "error");
      }

      // Tries to DM user about their mute
      const dmchannel = await user.user.getDMChannel().catch(() => {});
      dmchannel.createMessage({
        embed: {
          title: `🔇 Muteado en ${msg.channel.guild.name}`,
          description: `Estabas silenciado por ${reason ? `\`${reason}\`` : "sin razón proporcionada."}`,
          color: this.bot.embed.color("error"),
          footer: {
            text: `Muteado por ${this.bot.tag(msg.author)}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      }).catch(() => {});

      this.bot.emit("memberMute", msg.channel.guild, msg.member, user, reason);
      this.bot.embed("✅ Listo", `**${user.username}** esta muteado.`, msg, "success");
    } else {
      return this.bot.embed("❌ Error", `No tienes un rol lo suficientemente alto para silenciar **${user.username}**.`, msg, "error");
    }
  }
}

module.exports = muteCommand;
