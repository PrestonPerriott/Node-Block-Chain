//should create a /helpers.js file and export these functions instead
//Naking our own specific helpers for handlbars 
module.exports = { 
    checkToken: function(req, res, next) {
    
        console.log('First Log Check Token');
        var headerRequest = new XMLHttpRequest();
        headerRequest.open('HEAD', window.location, true);
        headerRequest.send(null);
        while(headerRequest.readyState != 4){ };
        console.log(JSON.stringify('The header from checkToken' + headerRequest));
        return headerRequest.getResponseHeader('cookies');
    } 
};