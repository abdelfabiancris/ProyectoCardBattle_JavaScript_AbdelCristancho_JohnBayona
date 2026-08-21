import jsonServer from 'json-server';
import fs from 'fs';
import path from 'path';

const server = jsonServer.create();
const middlewares = jsonServer.defaults();

const isRailway =
    process.env.RAILWAY_ENVIRONMENT_NAME !== undefined;

const dbPath = isRailway
    ? '/app/data/db.json'
    : path.join(
        process.cwd(),
        'src',
        'data',
        'db.json'
    );

/*
 * Si estamos en Railway y el Volume todavía
 * no tiene un db.json, copiamos nuestra base
 * inicial al Volume.
 */
if (
    isRailway &&
    !fs.existsSync(dbPath)
) {

    fs.mkdirSync(
        path.dirname(dbPath),
        {
            recursive: true
        }
    );

    fs.copyFileSync(
        path.join(
            process.cwd(),
            'src',
            'data',
            'db.json'
        ),
        dbPath
    );

    console.log(
        'Base de datos inicial copiada al Volume.'
    );
}

const router =
    jsonServer.router(dbPath);

server.use(middlewares);
server.use(router);

const PORT =
    process.env.PORT || 3000;

server.listen(
    PORT,
    '0.0.0.0',
    () => {

        console.log(
            `JSON Server ejecutándose en el puerto ${PORT}`
        );

        console.log(
            `Base de datos: ${dbPath}`
        );
    }
);