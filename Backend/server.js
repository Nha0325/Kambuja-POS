require('./config/env');
const app = require('./app');
const { connectToDatabase } = require('./database/db');

const port = process.env.PORT;
console.log('[DEBUG] Backend port: ' + port);

var authRoutes = [];
app.router.stack.forEach(function(layer) {
  if (layer.name === 'router' && layer.handle && layer.handle.stack) {
    layer.handle.stack.forEach(function(inner) {
      if (inner.route && ['/signup', '/signin', '/signout', '/me'].indexOf(inner.route.path) !== -1) {
        authRoutes.push(inner.route.path + ' [' + Object.keys(inner.route.methods).join(',') + ']');
      }
    });
  }
});
console.log('[DEBUG] Auth routes mounted: ' + (authRoutes.length > 0 ? 'YES (' + authRoutes.join(', ') + ')' : 'NO'));

// connect to the database
connectToDatabase().then(function() {
    app.listen(port, function() {
        console.log('Server is running on port ' + port);
    });
}).catch(function(error) {
    console.error('Failed to connect to database:', error.message);
    process.exitCode = 1;
});
