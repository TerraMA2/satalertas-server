exports.response = (status, data = null, message = '') => {
    return {
        status,
        data,
        message
    }
};
