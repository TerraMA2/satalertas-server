

const result = {
  ok(json, columns = undefined) {
    const response = {
      status: 200,
      data: json,
      message: "Sucesso!"
    }
    if (columns) response.columns = columns 
    return response;
  },
  created(json, column = undefined) {
    const response = {
      status: 201,
      data: json,
      message: "Criado com sucesso!"
    }
    if (columns) response.columns = columns 
    return response;
  },
  err(json, columns = undefined) {
    const response = {
      status: 500,
      data: json,
      message: "Erro interno!"
    }
    if (columns) response.columns = columns 
    return response;
  }
};
module.exports = result;
