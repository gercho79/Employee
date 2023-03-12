sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("logaligroup.employeesv2.controller.Base", {
    ordersToDetails: function (oEvent) {
      var oContext = oEvent.getSource().getBindingContext("odataNortwhind");

      var oContextObj = oContext.getObject();

      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("RouteOrderDetails", {
        OrderId: oContextObj.OrderID,
      });
    },
  });
});
