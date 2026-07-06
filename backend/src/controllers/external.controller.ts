import { Request, Response } from 'express';
import { getCurrentWeather } from '../services/weather.service';
import { ApiResponse, QuoteResponse, WeatherResponse } from '../types';

// ─── Daily Quotes ─────────────────────────────────────────────────────────────

const QUOTES: QuoteResponse[] = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'In the middle of every difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { text: 'An unexamined life is not worth living.', author: 'Socrates' },
  { text: 'Spread love everywhere you go.', author: 'Mother Teresa' },
  { text: 'When you reach the end of your rope, tie a knot in it and hang on.', author: 'Franklin D. Roosevelt' },
  { text: 'Always remember that you are absolutely unique, just like everyone else.', author: 'Margaret Mead' },
  { text: 'Don\'t judge each day by the harvest you reap but by the seeds that you plant.', author: 'Robert Louis Stevenson' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { text: 'Tell me and I forget. Teach me and I remember. Involve me and I learn.', author: 'Benjamin Franklin' },
  { text: 'The best and most beautiful things in the world cannot be seen or even touched — they must be felt with the heart.', author: 'Helen Keller' },
  { text: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle' },
  { text: 'Whoever is happy will make others happy too.', author: 'Anne Frank' },
  { text: 'Do not go where the path may lead, go instead where there is no path and leave a trail.', author: 'Ralph Waldo Emerson' },
  { text: 'You will face many defeats in life, but never let yourself be defeated.', author: 'Maya Angelou' },
  { text: 'In the end, it\'s not the years in your life that count. It\'s the life in your years.', author: 'Abraham Lincoln' },
  { text: 'Never let the fear of striking out keep you from playing the game.', author: 'Babe Ruth' },
  { text: 'Life is either a daring adventure or nothing at all.', author: 'Helen Keller' },
  { text: 'Many of life\'s failures are people who did not realise how close they were to success when they gave up.', author: 'Thomas A. Edison' },
  { text: 'You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.', author: 'Dr. Seuss' },
  { text: 'If life were predictable it would cease to be life, and be without flavour.', author: 'Eleanor Roosevelt' },
  { text: 'If you look at what you have in life, you\'ll always have more.', author: 'Oprah Winfrey' },
  { text: 'If you want to live a happy life, tie it to a goal, not to people or things.', author: 'Albert Einstein' },
  { text: 'Never let the fear of striking out keep you from playing the game.', author: 'Babe Ruth' },
  { text: 'Money and success don\'t change people; they merely amplify what is already there.', author: 'Will Smith' },
  { text: 'Your time is limited, so don\'t waste it living someone else\'s life.', author: 'Steve Jobs' },
  { text: 'Not how long, but how well you have lived is the main thing.', author: 'Seneca' },
  { text: 'If life were predictable it would cease to be life, and be without flavour.', author: 'Eleanor Roosevelt' },
  { text: 'A ship in harbour is safe, but that is not what ships are built for.', author: 'John A. Shedd' },
];

/** Returns a deterministic quote based on the day of the year (rotates daily) */
function getDailyQuote(): QuoteResponse {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return QUOTES[dayOfYear % QUOTES.length];
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/weather?lat=&lon=
 * Proxies OpenWeatherMap; keeps the API key server-side.
 */
export async function getWeather(req: Request, res: Response): Promise<void> {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);

  if (isNaN(lat) || isNaN(lon)) {
    res.status(400).json({
      success: false,
      error: 'Query params lat and lon must be valid numbers.',
    } satisfies ApiResponse);
    return;
  }

  try {
    const weather = await getCurrentWeather(lat, lon);
    res.status(200).json({ success: true, data: weather } satisfies ApiResponse<WeatherResponse>);
  } catch (err) {
    res.status(502).json({
      success: false,
      error: 'Unable to fetch weather. ' + (err as Error).message,
    } satisfies ApiResponse);
  }
}

/**
 * GET /api/quotes/daily
 * Returns today's motivational quote. No auth required.
 */
export async function getDailyQuote(_req: Request, res: Response): Promise<void> {
  const quote = getDailyQuote();
  res.status(200).json({ success: true, data: quote } satisfies ApiResponse<QuoteResponse>);
}
