const { Biome, sequelize } = require("../models");

exports.get = async () => {
  const options = {
    attributes: ["gid", "name"],
    order: [["name"]],
  };
  return await Biome.findAll(options);
};
