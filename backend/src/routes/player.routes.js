const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');
const playerController = require('../controllers/player.controller');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos.',
      details: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

const skillValidation = (field) =>
  body(field)
    .optional()
    .isInt({ min: 0, max: 99 })
    .withMessage(`${field} debe ser un número entero entre 0 y 99.`);

const playerPayloadRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del jugador es obligatorio.'),
  body('gender')
    .isIn(['male', 'female'])
    .withMessage("El género debe ser 'male' o 'female'."),
  body('edition')
    .isInt({ min: 2015, max: 2023 })
    .withMessage('La edición debe ser un año entre 2015 y 2023.'),
  body('club')
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage('El club debe ser un texto válido.'),
  body('position')
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage('La posición debe ser un texto válido.'),
  skillValidation('pace'),
  skillValidation('shooting'),
  skillValidation('passing'),
  skillValidation('dribbling'),
  skillValidation('defending'),
  skillValidation('physical'),
];

const idParamRule = [
  param('id').isInt({ min: 1 }).withMessage('El ID del jugador debe ser un entero positivo.'),
];

const listQueryRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero mayor o igual a 1.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe ser un entero entre 1 y 100.'),
];

router.use(verifyToken);

router.get('/export', playerController.exportPlayersCsv);
router.get('/', listQueryRules, handleValidationErrors, playerController.getPlayers);
router.get('/:id', idParamRule, handleValidationErrors, playerController.getPlayerById);
router.post('/', playerPayloadRules, handleValidationErrors, playerController.createPlayer);
router.put('/:id', [...idParamRule, ...playerPayloadRules], handleValidationErrors, playerController.updatePlayer);

module.exports = router;