// log_to_console = function(content) {
//     var log = new Element("DIV");
//     log.update(content);
//     
//     var el = $("console").down(".log_container");
//     el.insert(log);
// }

log_to_console = function(content) {
    $("<div></div").html(content).appendTo("#console .log_container"); // *cw*
};