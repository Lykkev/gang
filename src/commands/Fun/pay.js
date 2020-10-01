const Command = require("../../structures/Command");

class payCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["give", "givecookie", "givecookies"],
      args: "<member:member> <amount:string>",
      description: "Dale a un miembro algunas galletas.",
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const amount = parseInt(args[1]);

    // Blocks bots, selfpaying, and non-integers
    if (user.bot) return this.bot.embed("❌ Error", "No puedes darle cookies a un bot.", msg, "error");
    if (user.id === msg.author.id) return this.bot.embed("❌ Error", "El fraude es ilegal.", msg, "error");
    if (!amount || isNaN(amount)) return this.bot.embed("❌ Error", "Proporcionaste una cantidad no válida de cookies.", msg, "error");

    // Gets author & user's cookies
    let ucookies = await this.bot.db.table("economy").get(user.id).run();
    let acookies = await this.bot.db.table("economy").get(msg.author.id).run();

    if (!ucookies) {
      await this.bot.db.table("economy").insert({
        id: user.id,
        amount: 0,
        lastclaim: 9999,
      }).run();

      ucookies = await this.bot.db.table("economy").get(user.id).run();
    }

    if (!acookies) {
      await this.bot.db.table("economy").insert({
        id: user.id,
        amount: 0,
        lastclaim: 9999,
      }).run();

      acookies = await this.bot.db.table("economy").get(msg.author.id).run();
    }

    // Compares cookie amounts
    if (!acookies || amount > acookies.amount || acookies && acookies.amount <= 0) {
      return this.bot.embed("❌ Error", "No tienes suficientes cookies.", msg, "error");
    }

    acookies.amount -= amount;
    ucookies.amount += amount;

    // Updates cookie amounts
    await this.bot.db.table("economy").get(user.id).update(ucookies).run();
    await this.bot.db.table("economy").get(msg.author.id).update(acookies).run();
    this.bot.embed("🍪 Pagaste", `Tu le diste **${amount}** cookie${amount === 1 ? "" : "s"} a **${user.username}**.`, msg);
  }
}

module.exports = payCommand;
