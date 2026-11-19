const { Op } = require('sequelize');
const XLSX = require('xlsx');
const Player = require('../models/player.model');

// Almacén simple en memoria para claves de idempotencia en POST
const idempotencyStore = new Map();

const buildPlayerWhereClause = (query) => {
  const { name, club, position } = query;
  const where = {};

  if (name) {
    where.name = { [Op.like]: `%${name.trim()}%` };
  }
  if (club) {
    where.club = { [Op.like]: `%${club.trim()}%` };
  }
  if (position) {
    where.position = { [Op.like]: `%${position.trim()}%` };
  }

  return where;
};

// GET /api/players (listado paginado y filtrado)
exports.getPlayers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const offset = (page - 1) * limit;

    const where = buildPlayerWhereClause(req.query);

    const { count, rows } = await Player.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'ASC']],
    });

    res.json({
      data: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error('Error al obtener jugadores:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener jugadores.' });
  }
};

// GET /api/players/export (exportación del listado filtrado a CSV con xlsx)
exports.exportPlayersCsv = async (req, res) => {
  try {
    const where = buildPlayerWhereClause(req.query);

    const players = await Player.findAll({
      where,
      order: [['id', 'ASC']],
      raw: true,
    });

    const worksheet = XLSX.utils.json_to_sheet(players);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="players.csv"');
    res.status(200).send(csvOutput);
  } catch (error) {
    console.error('Error al exportar jugadores a CSV:', error);
    res.status(500).json({ error: 'Error interno del servidor al exportar a CSV.' });
  }
};

// GET /api/players/:id (detalle de jugador)
exports.getPlayerById = async (req, res) => {
  try {
    const player = await Player.findByPk(req.params.id);

    if (!player) {
      return res.status(404).json({ error: 'Jugador no encontrado.' });
    }

    res.json({ data: player });
  } catch (error) {
    console.error('Error al obtener detalle del jugador:', error);
    res.status(500).json({ error: 'Error interno del servidor al buscar el jugador.' });
  }
};

// POST /api/players (crear jugador con Location y soporte opcional a Idempotency-Key)
exports.createPlayer = async (req, res) => {
  try {
    const idempotencyKey = req.header('Idempotency-Key');

    if (idempotencyKey && idempotencyStore.has(idempotencyKey)) {
      const cached = idempotencyStore.get(idempotencyKey);
      res.setHeader('Location', `/api/players/${cached.data.id}`);
      return res.status(201).json(cached);
    }

    const payload = {
      name: req.body.name,
      club: req.body.club ?? null,
      position: req.body.position ?? null,
      gender: req.body.gender,
      edition: req.body.edition,
      pace: req.body.pace ?? 0,
      shooting: req.body.shooting ?? 0,
      passing: req.body.passing ?? 0,
      dribbling: req.body.dribbling ?? 0,
      defending: req.body.defending ?? 0,
      physical: req.body.physical ?? 0,
    };

    const newPlayer = await Player.create(payload);
    const responseBody = {
      message: 'Jugador creado con éxito.',
      data: newPlayer,
    };

    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, responseBody);
    }

    res.setHeader('Location', `/api/players/${newPlayer.id}`);
    res.status(201).json(responseBody);
  } catch (error) {
    console.error('Error al crear jugador:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear el jugador.' });
  }
};

// PUT /api/players/:id (reemplazo completo del jugador)
exports.updatePlayer = async (req, res) => {
  try {
    const player = await Player.findByPk(req.params.id);

    if (!player) {
      return res.status(404).json({ error: 'Jugador no encontrado.' });
    }

    // Reemplazo completo: los campos opcionales no enviados quedan en null o en su valor por defecto
    const fullReplacementPayload = {
      name: req.body.name,
      club: req.body.club ?? null,
      position: req.body.position ?? null,
      gender: req.body.gender,
      edition: req.body.edition,
      pace: req.body.pace ?? 0,
      shooting: req.body.shooting ?? 0,
      passing: req.body.passing ?? 0,
      dribbling: req.body.dribbling ?? 0,
      defending: req.body.defending ?? 0,
      physical: req.body.physical ?? 0,
    };

    await player.update(fullReplacementPayload);

    res.status(200).json({
      message: 'Jugador actualizado con éxito.',
      data: player,
    });
  } catch (error) {
    console.error('Error al actualizar jugador:', error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar el jugador.' });
  }
};