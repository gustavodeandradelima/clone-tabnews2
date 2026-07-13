import database from "infra/database.js";

async function status(request, response) {
  const updateAt = new Date().toISOString();

  const bancoVersao = await database.query("show server_version;");

  const conexoesMaximas = await database.query(
    "SELECT setting::int AS max_conexoes FROM pg_settings WHERE name = 'max_connections';",
  );

  const databaseName = process.env.POSTGRES_DB;
  const conexoesUsadas = await database.query({
    text: "SELECT count(*)::int AS conexoes_usadas FROM pg_stat_activity where datname = $1;",
    values: [databaseName],
  });
  
  const databaseOpenedConnectionsResult = await database.query(
    "SELECT * from pg_stat_activity",
  );
  console.log(conexoesUsadas.rows[0].conexoes_usadas);

  response.status(200).json({
    updated_at: updateAt,
    dependencies: {
      database: {
        url_banco: process.env.POSTGRES_HOST,
        banco_versao: bancoVersao.rows[0].server_version,
        conexoes_maximas: conexoesMaximas.rows[0].max_conexoes,
        conexoes_usadas: conexoesUsadas.rows[0].conexoes_usadas,
      },
    },
  });
}

export default status;
