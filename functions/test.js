exports.handler = function(event, context, callback) {
    console.log("Called the test function");

    console.log("GONNA DO SOME COOL SHIT");

    console.log("ERROR!");
    callback(new Error("FUCK IS BROKE!"));
    
    callback(null, {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify("POK!")
    });
}