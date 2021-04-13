

const result = {
  ok(json) {
    return {
      status: 200,
      data: json,
      message: "Sucesso!"
    }
  },
  created(json) {
    return {
      status: 201,
      data: json,
      message: "Criado com sucesso!"
    }
  },
  err(json) {
    return {
      status: 500,
      data: json,
      message: "Erro interno!"
    }
  }
};
module.exports = result;
