"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const team_controller_1 = require("../controllers/team.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Create a new team
router.post('/', auth_middleware_1.authenticateJWT, team_controller_1.createTeam);
// List teams (public + user's teams)
router.get('/', team_controller_1.listTeams);
// Get detailed info of a single team
router.get('/:id', team_controller_1.getTeamDetails);
// Request to join a team
router.post('/:id/join', auth_middleware_1.authenticateJWT, team_controller_1.joinTeam);
exports.default = router;
