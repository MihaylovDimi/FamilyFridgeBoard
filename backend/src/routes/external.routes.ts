import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getDailyQuote, getWeather } from '../controllers/external.controller';

const router = Router();

// Weather requires auth so the API key can't be scraped by anonymous calls
router.get('/weather', requireAuth, getWeather);

// Daily quote is public — shown even on the login screen
router.get('/quotes/daily', getDailyQuote);

export default router;
