"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const match_controller_1 = require("../controllers/match.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Create a new match
router.post('/', auth_middleware_1.authenticateJWT, match_controller_1.createMatch);
// List public matches (with query filters)
router.get('/', match_controller_1.listMatches);
// Get matches created by or RSVP'd by user
router.get('/my', auth_middleware_1.authenticateJWT, match_controller_1.getMyMatches);
// Get details of a specific match
router.get('/:id', match_controller_1.getMatchDetails);
// RSVP to a match
router.post('/:id/rsvp', auth_middleware_1.authenticateJWT, match_controller_1.rsvpToMatch);
// Cancel RSVP
router.delete('/:id/rsvp', auth_middleware_1.authenticateJWT, match_controller_1.cancelRSVP);
exports.default = router;
