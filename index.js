const Koa = require('koa');
const router = require('koa-router')();
const serve = require('koa-static');
const views = require('koa-views');
const { join } = require('path');
const app = new Koa;

router.get('/', route);

app.use(serve('./public'));
app.use(views(join(__dirname, 'server', 'views'), { extension: 'html' }));
app.use(router.routes());

async function route(ctx, _next) {
  try {
    await ctx.render('index');
  } catch (e) {
    ctx.status = e.status || 500;
    ctx.type = 'json';
    ctx.body = { message: e.message, status: ctx.status };
    ctx.app.emit('error', e, ctx);
  }
}

app.listen(process.env.PORT || 8080, _ => 'Listening...');