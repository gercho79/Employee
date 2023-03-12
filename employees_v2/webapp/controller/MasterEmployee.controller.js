// @ts-nocheck

sap.ui.define(
  [
    "logaligroup/employeesv2/controller/Base.controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   * @param {typeof sap.ui.model.json.JSONModel} JSONModel
   * @param {typeof sap.ui.model.Filter} Filter
   * @param {typeof sap.ui.model.FilterOperator} FilterOperator
   * @param {typeof sap.m.MessageToast} MessageToast
   */
  function (
	Base,
	JSONModel,
	Filter,
	FilterOperator,
	MessageToast,
	UIComponent
  ) {
    "use strict";

    return Base.extend(
      "logaligroup.employeesv2.controller.MasterEmployee",
      {
        onInit: function () {
          //Instancia del Bus de los eventos
          this._bus = sap.ui.getCore().getEventBus();
        },

        onBeforeRendering: function () {},

        onChangeText: function () {
          let sValue = this.getView().byId("idInput01").getValue();
          if (sValue.length === 6) {
            this.getView().byId("idText01").setText("OK");
            this.byId("idSlCountry").setVisible(true);
          } else {
            this.getView().byId("idText01").setText("NOK");
          }
        },
        onHandlerFilter: function (oEvent) {
          //var sValueFilter = this.byId('idInput01').getValue();
          var oJsonModel = this.getView().getModel().getData();
          var filters = [];

          //Filtero EmployeeID
          if (oJsonModel.EmployeeId !== "") {
            filters.push(
              new Filter("EmployeeID", FilterOperator.EQ, oJsonModel.EmployeeId)
            );
          }
          //Filter Country
          if (oJsonModel.CountryKey !== "") {
            filters.push(
              new Filter("Country", FilterOperator.EQ, oJsonModel.CountryKey)
            );
          }

          var oTable = this.getView().byId("Table01");
          var oBinding = oTable.getBinding("items");
          oBinding.filter(filters);
        },
        onHandlerClearFilter: function (oEvent) {
          var oModel = this.getView().getModel();
          oModel.setProperty("/EmployeeId", "");
          oModel.setProperty("/CountryKey", "");
          var oTable = this.getView().byId("Table01");
          var oBinding = oTable.getBinding("items");
          oBinding.filter([]);
        },

        onMessageToast: function (oEvent) {
          //var oModel = this.getView().getModel();

          var itemPress = oEvent.getSource();
          var oContext = itemPress.getBindingContext();
          var objectContext = oContext.getObject();

          MessageToast.show(objectContext.PostalCode);
        },

        onHandlerShowCity: function () {
          var oModelConfg = this.getView().getModel("ConfigView");
          oModelConfg.setProperty("/VisibleCity", true);
          oModelConfg.setProperty("/VisibleBtnShowCity", false);
          oModelConfg.setProperty("/VisibleBtnHideCity", true);
        },

        onHandlerHideCity: function () {
          var oModelConfg = this.getView().getModel("ConfigView");
          oModelConfg.setProperty("/VisibleCity", false);
          oModelConfg.setProperty("/VisibleBtnShowCity", true);
          oModelConfg.setProperty("/VisibleBtnHideCity", false);
        },

        showOrders: function (oEvent) {
          //Se obtiene el componente donde va a ser colocado los componentes dinamicos.
          var oHbox = this.getView().byId("idHbox01");
          //Se destruye todo el contenido de los items de HBOX.
          oHbox.destroyItems();
          //Obtenemos el Modelo Principal con el contenido del empleado que se clickeo en la tabla.
          var itemPress = oEvent.getSource();
          //Obtenemos el contexto de cual registro fue seleccionado,
          //Si tiene un modelo con nombre debe ponerse dentro del
          //getBindingContext('modelo')
          var oContext = itemPress.getBindingContext();
          //Se obtiene el objeto del registro (Los datos en si)
          var oContextData = oContext.getObject();

          var pedidos = oContextData.Orders; //Obtenemos los pedidos asociado al registro seleccionado de la tabla

          var orders = []; //Array vacio

          //Recorremos los pedidos obtenidos.
          //Generamos dinamicamente una tabla mediante JS que se vuelca en el ID idHbox01
          for (let i in pedidos) {
            orders.push(
              new sap.m.ColumnListItem({
                cells: [
                  new sap.m.Label({ text: pedidos[i].OrderID }),
                  new sap.m.Label({ text: pedidos[i].Freight }),
                  new sap.m.Label({ text: pedidos[i].ShipAddress }),
                ],
              })
            );
          }

          //Creamos una tabla mediante JS pasando columnas y celdas
          var table = new sap.m.Table({
            width: "auto",
            columns: [
              new sap.m.Column({
                header: new sap.m.Text({ text: "{i18n>orderId}" }),
              }),
              new sap.m.Column({
                header: new sap.m.Text({ text: "Peso" }),
              }),
              new sap.m.Column({
                header: new sap.m.Text({ text: "Direccion" }),
              }),
            ],
            items: orders,
          }).addStyleClass("sapUiSmallMargin");

          //Insertamos en el objeto xml(HBOX) la tabla en este caso.
          oHbox.addItem(table);

          /**
           * !Segunda forma de implementar una tabla dinamica
           */

          //Creamos una tabla mediante JS sin ningun parametro.
          var tableJson = new sap.m.Table();

          tableJson.setWidth("auto");
          tableJson.addStyleClass("sapUISmallMargin");

          //Creamos las columnas mediante JS
          var columnID = new sap.m.Column();
          //var labelID = new sap.m.Label({ text: 'ID' });
          var labelID = new sap.m.Label();
          labelID.bindProperty("text", "i18n>orderId");
          columnID.setHeader(labelID);
          tableJson.addColumn(columnID);

          var columnPeso = new sap.m.Column();
          //var labelPeso = new sap.m.Label({ text: 'Peso' });
          var labelPeso = new sap.m.Label();
          labelPeso.bindProperty("text", "i18n>peso");
          columnPeso.setHeader(labelPeso);
          tableJson.addColumn(columnPeso);

          var columnDir = new sap.m.Column();
          //var labelDir = new sap.m.Label({ text: 'Direccion' });
          var labelDir = new sap.m.Label();
          labelDir.bindProperty("text", "i18n>direccion");
          columnDir.setHeader(labelDir);
          tableJson.addColumn(columnDir);

          //Creamos celdas mediante JS
          var columnListItem = new sap.m.ColumnListItem();

          var cellID = new sap.m.Label();
          cellID.bindProperty("text", "OrderID");
          columnListItem.addCell(cellID);

          var cellPeso = new sap.m.Label();
          cellPeso.bindProperty("text", "Freight");
          columnListItem.addCell(cellPeso);

          var cellDir = new sap.m.Label();
          cellDir.bindProperty("text", "ShipAddress");
          columnListItem.addCell(cellDir);

          var oBindingData = {
            path: "Orders",
            template: columnListItem,
          };

          //Se agrega en la sap.m.table en el aggrgation 'items' el:
          /**
           * Model:    Hace referencia al modelo donde se encuentra los datos
           * Path:     Ruta dentro del modelo donde estan los datos
           * Template: columnListItem
           */
          tableJson.bindAggregation("items", oBindingData);

          //bindElement es para decirle dentro del modelo en que posicion se encuentra el dato a mostrar.
          tableJson.bindElement("" + oContext.getPath());

          tableJson.addItem(columnListItem);

          //Insertamos en el objeto xml(HBOX) la tabla en este caso.
          oHbox.addItem(tableJson);
        },

        showOrdersDialog: function (oEvent) {
          //Obtener el controlador seleccionado
          var rowPress = oEvent.getSource();

          //Obtener Modelo de la fila seleccionada
          var oContext = rowPress.getBindingContext("odataNortwhind");

          //Instanciar el fragmento del Dialogo
          if (!this._objectDialogOrder) {
            this._objectDialogOrder = sap.ui.xmlfragment(
              "logaligroup.employeesv2.fragment.dialogOrders",
              this
            );
            this.getView().addDependent(this._objectDialogOrder);
          }

          //Bindeo al contexto del item al empleado seleccionado
          this._objectDialogOrder.bindElement(
            "odataNortwhind>" + oContext.getPath()
          );

          this._objectDialogOrder.open();
        },

        closeDialog: function () {
          this._objectDialogOrder.close();
        },

        showDetails: function (oEvent) {
          //publicar un evento por el componente BUS
          var path = oEvent
            .getSource()
            .getBindingContext("odataNortwhind")
            .getPath();

          //Publicar un evento
          this._bus.publish("flexible", "showDetails", path);
        },

       /* Esta funcion se hereda del Base
       ordersToDetails: function (oEvent) {
          var oContext = oEvent.getSource().getBindingContext("odataNortwhind");

          var oContextObj = oContext.getObject();

          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("RouteOrderDetails", {
            OrderId: oContextObj.OrderID,
          });
        }*/

      }
    );
  }
);
