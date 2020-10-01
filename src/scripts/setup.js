/**
 * @fileoverview Setup
 * @description Creates required RethinkDB tables and indexes
 * @module setup
 */

const { r } = require("rethinkdb-ts");
const config = require("../../config");
const log = require("./logger");
const start = require("./database").start;
const requiredtables = config.rethink.tables;

(async () => {
  await start().catch(err => {
    log.error(`Error al iniciar RethinkDB (Is it running; are you authorized?): ${err}`);
    process.exit();
  });

  const db = r.db(config.rethink.db);
  const dbList = await r.dbList().run();
  if (!dbList.includes(config.rethink.db)) {
    await r.dbCreate(config.rethink.db).run();
    log.success(`Creó el ${config.rethink.db} database`);
  }

  // Creates missing tables
  const tables = await db.tableList().run();
  await Promise.all(requiredtables.map(async t => {
    if (!tables.includes(t)) {
      await db.tableCreate(t).run();
      log.success(`Created the ${t} table`);
    }
  }));

  // Creates marriage index
  const index = await db.table("marriages").indexList().run();
  if (!index.includes("marriages")) {
    await db.table("marriages").indexCreate("marriages", [r.row("id"), r.row("spouse")], { multi: true }).run();
    log.success("Creó el índice de matrimonio");
  }

  log.success("RethinkDB se ha configurado correctamente.");
  process.exit(0);
})();
