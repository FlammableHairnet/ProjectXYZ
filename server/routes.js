const githubPassportHandler = require('./Controllers/authController');
const searchController = require('./Controllers/searchController');
const kanbanController = require('./Controllers/kanbanController');

module.exports = function (app) {
  app.get('/api/searches/:id', searchController.getSavedSearch);

  app.get('/api/searches', searchController.getAllSearches);

  app.post('/api/searches', searchController.saveSearch);

  app.post('/api/kanban/add', kanbanController.addJobsToKanban);

  app.get('api/kanban', kanbanController.getKanban);

  app.delete('/api/kanban/:job', kanbanController.deleteJobFromKanban)

  // handler for /auth/github & /logout =>
  //routes for passport github OAuth2 login and sessions are here
  githubPassportHandler(app);

}