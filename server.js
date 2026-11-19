require('dotenv').config({ quiet: true });
const express = require('express'), path = require('path');
const { testConnection, pingDb } = require('./config/db');
const { notFound, errorHandler } = require('./middleware');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', async (req, res) => {
  const ok = await pingDb();
  res.status(ok ? 200 : 503).json({ success: ok, message: ok ? 'API and database are healthy' : 'Database unavailable' });
});
app.use('/api',
  require('./routes/suppliers'), require('./routes/fruits'), require('./routes/vendors'),
  require('./routes/trade'), require('./routes/insights'));
app.use('/api', notFound);
app.use(errorHandler);

// the app must never crash because of a DB failure
process.on('unhandledRejection', e => console.error('Unhandled rejection:', e && e.message));
process.on('uncaughtException', e => console.error('Uncaught exception:', e.message));

app.listen(process.env.PORT || 3000, async () => {
  console.log(`🍎 Batloung Farm running on http://localhost:${process.env.PORT || 3000}`);
  await testConnection();
});