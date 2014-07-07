/*************
 * Este modulo se encarga de resolver la direccion 
 * solicitada y servir el contenido apropiadamente
 */
exports.sirvePagina = function(req, res) {
    var archivo = req.route.path;
    if (archivo === '/')
        res.sendfile('./public/index.html');
    else
        res.sendfile('./public' + archivo + '.html');
};