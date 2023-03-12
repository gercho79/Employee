sap.ui.define([

], function (

) {
    "use strict";

    function dateFormat(date) {

        var timeDay = 24 * 60 * 60 * 1000;

        if (date) {
            var dateNow = new Date();
            //Formatear fecha yyy/mm/dd
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy/MM/dd" });
            var dateNowFormat = new Date(dateFormat.format(dateNow));

            switch (true) {
                //Hoy
                case date.getTime() === dateNowFormat.getTime():
                    return "Hoy";
                case date.getTime() === dateNowFormat.getTime() - timeDay:
                    return "Ayer";
                case date.getTime() === dateNowFormat.getTime() + timeDay:
                    return "Mañana";
            }
        }
    }

    return { dateFormat: dateFormat };
});