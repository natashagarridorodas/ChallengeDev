# Proyecto Full-Stack: Gestión de Jugadores de FIFA (2015-2023)

Aplicación full-stack para gestionar jugadores FIFA (masculinos y femeninos) y sus seis habilidades principales (`pace`, `shooting`, `passing`, `dribbling`, `defending`, `physical`) a través de las ediciones de 2015 a 2023.

## Stack Tecnológico
- **Backend:** Node.js (v22), Express, Sequelize ORM, JWT (`jsonwebtoken`), `bcryptjs`, `express-validator`, `xlsx`.
- **Frontend:** Angular (componentes standalone, Reactive Forms, Router, guards de autenticación, `HttpClient`, `Chart.js` para gráficos de radar).
- **Base de datos y orquestación:** MySQL 8.0, Docker y Docker Compose.

## Decisiones Técnicas y Funcionales
1. **Arquitectura desacoplada por capas:** El backend separa rutas, controladores, modelos Sequelize y middlewares de autenticación/validación; el frontend separa servicios (`core`) y vistas (`features`) con componentes standalone.
2. **Autenticación con JWT y contraseñas hasheadas:** Las credenciales se almacenan hasheadas con `bcryptjs` y las rutas de jugadores se protegen mediante middleware JWT enviado en la cabecera `Authorization: Bearer <token>`.
3. **Validación y operaciones REST:** Se valida la entrada con `express-validator` (ediciones entre 2015 y 2023, habilidades entre 0 y 99, género `male`/`female`). El alta (`POST /api/players`) devuelve `201 Created`, cabecera `Location` y soporta clave de idempotencia opcional; la edición (`PUT /api/players/:id`) realiza reemplazo completo del recurso.
4. **Consultas filtradas, exportación y visualización:** El listado soporta filtros y paginación; la exportación CSV utiliza `xlsx`; el detalle visualiza las 6 habilidades en un gráfico de radar con `Chart.js`.
5. **Orquestación con Docker Compose:** Tres servicios (`mysql-db` con healthcheck y volumen persistente `mysql_data`, `backend` en puerto `3000` y `frontend` compilado en producción y servido con Nginx en puerto `4200`).

## Ejecución con Docker Compose
Desde la raíz del proyecto (`fifa-app`):

```bash
docker compose up --build -d
docker compose ps