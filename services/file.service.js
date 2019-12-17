
const env = process.env.NODE_ENV || 'development';
const confDb = require(__dirname + '/../config/config.json')[env];

module.exports = FileService = {

  async get(id) {
    let result = {result: `Feature not implemented! ${id}`};

    return (result);
  },
  async upload(file) {
    let result = {result: 'Feature not implemented!', base64: file};


    return (result);
  },
  async delete(id, file) {
    let result = {result: `Feature not implemented! ${id}`};

    return (result);
  }
};
