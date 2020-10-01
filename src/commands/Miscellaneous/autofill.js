const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class autofillCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Envía una lista de los resultados de Autocompletar de Google.",
      args: "<query:string>",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg, args) {
    const body = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(args.join(" "))}`)
      .then(res => res.json().catch(() => {}));

    if (!body || !body[1].length) return this.bot.embed("❌ Error", "No se han encontrado resultados.", msg, "error");
    this.bot.embed("✏ Autofill", body[1].join("\n"), msg);
  }
}

module.exports = autofillCommand;
