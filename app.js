import bearerToken from 'express-bearer-token';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import Debug from 'debug';
import express from 'express';
import logger from 'morgan';
import path from 'path';
import sassMiddleware from 'node-sass-middleware';
// import favicon from 'serve-favicon';

import index from './routes/index';
import customer from './routes/customer';
import cart from './routes/cart';
import orders from './routes/orders';
import product from './routes/product';
import status from './routes/status';
import recipe from './routes/recipe';
import user from './routes/user';
import accessControl from './loaders/accessControl';

const app = express();
const debug = Debug('yumyum-back:app');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use(bearerToken());
app.use(accessControl.hydrateReq);

app.use('/', index);
app.use('/api', customer);
app.use('/api', cart);
app.use('/api', orders);
app.use('/api', product);
app.use('/api', status);
app.use('/api', recipe);
app.use('/api', user);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
/* eslint no-unused-vars: 0 */
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  console.log('ERR ', err);
  res.status(err.status || 500);
  res.json(err);
});

// Handle uncaughtException
process.on('uncaughtException', (err) => {
  debug('Caught exception: %j', err);
  process.exit(1);
});

export default app;
