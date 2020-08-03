/**
 * formatError formats a json error message
 *
 * @param {*} err
 * @returns
 */
const formatError = (err) => {
    return {
        status: err.status,
        message: err.message,
    };
};

export default formatError