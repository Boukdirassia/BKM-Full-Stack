const db = require('../config/db');

const Admin = {
  getAll: (callback) => {
    db.query('SELECT * FROM admin', callback);
  },
  
  getById: (id, callback) => {
    db.query('SELECT * FROM admin WHERE AdminID = ?', [id], callback);
  },
  
  create: (adminData, callback) => {
    db.query(
      'INSERT INTO admin (UserID, Role, Permissions) VALUES (?, ?, ?)',
      [adminData.UserID, adminData.Role, adminData.Permissions],
      callback
    );
  },
  
  update: (id, adminData, callback) => {
    db.query(
      'UPDATE admin SET UserID = ?, Role = ?, Permissions = ? WHERE AdminID = ?',
      [adminData.UserID, adminData.Role, adminData.Permissions, id],
      callback
    );
  },
  
  delete: (id, callback) => {
    db.query('DELETE FROM admin WHERE AdminID = ?', [id], callback);
  },
  
  // Méthode pour obtenir un admin par son UserID
  getByUserId: (userId, callback) => {
    db.query('SELECT * FROM admin WHERE UserID = ?', [userId], callback);
  }
};

module.exports = Admin;