const db = require('../config/db');

const Extra = {
  getAll: (callback) => {
    db.query('SELECT * FROM extra', callback);
  },
  
  getById: (id, callback) => {
    db.query('SELECT * FROM extra WHERE ExtraID = ?', [id], callback);
  },
  
  create: (extraData, callback) => {
    db.query(
      'INSERT INTO extra (Nom, Prix, Description) VALUES (?, ?, ?)',
      [extraData.Nom, extraData.Prix, extraData.Description],
      callback
    );
  },
  
  update: (id, extraData, callback) => {
    db.query(
      'UPDATE extra SET Nom = ?, Prix = ?, Description = ? WHERE ExtraID = ?',
      [extraData.Nom, extraData.Prix, extraData.Description, id],
      callback
    );
  },
  
  delete: (id, callback) => {
    db.query('DELETE FROM extra WHERE ExtraID = ?', [id], callback);
  }
};

module.exports = Extra;