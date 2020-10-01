const Command = require("../../structures/Command");

class dailyCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Da sus cookies diarias.",
      allowdms: true,
    });
  }

  async run(msg) {
    // Formats time left in a day
    function formatDay(ms) {
      let h, m, s;
      s = Math.floor(ms / 1000);
      m = Math.floor(s / 60);
      s %= 60;
      h = Math.floor(m / 60);
      m %= 60;
      const d = Math.floor(h / 24);
      h %= 24;
      h += d * 24;
      return `**${h} horas** y **${m} minutos**`;
    }

    // Gets member's economy info
    let cookies = await this.bot.db.table("economy").get(msg.author.id).run();
    if (!cookies) {
      cookies = {
        id: msg.author.id,
        amount: 0,
        lastclaim: 9999,
      };

      // Inserts blank info if needed
      await this.bot.db.table("economy").insert(cookies).run();
    }

    // If lastclaim expired
    if (new Date() - new Date(cookies.lastclaim) > 86400000) {
      const amount = cookies.amount + 100;
      cookies = {
        id: msg.author.id,
        amount: amount,
        lastclaim: new Date(),
      };

      // Updates DB
      await this.bot.db.table("economy").get(msg.author.id).update(cookies).run();
      return this.bot.embed("🍪 Daily", "Ha reclamado sus ** 100 ** cookies diarias.", msg);
    }

    // If user is on cooldown
    const lastclaim = new Date(cookies.lastclaim);
    const time = 86400000 - (new Date().getTime() - lastclaim.getTime());
    this.bot.embed("🍪 Daily", `Puede reclamar sus cookies diarias nuevamente en ${formatDay(time)}.`, msg);
  }
}

module.exports = dailyCommand;
