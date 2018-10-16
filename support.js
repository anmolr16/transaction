const e = {}

e.log = (str) => {
    console.log("\n" + str);
}

e.success = (response, data) => {
    return response.status(200).send(data);
}
e.error = (response, error) => {
    return response.status(400).send({ "message": "Error", "data": error });
}
e.invalidData = (response) => {
    return response.status(400).send({ "message": "Invalid data" });
}
e.badRequest = (response) => {
    return response.status(400).send({ "message": "Bad Request" });
}
e.noDataFound = (response) => {
    return response.status(200).send({ "message": "No Data Found", "data": [] });
}

module.exports = e;