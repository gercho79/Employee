sap.ui.define(
  [
    "logaligroup/employeesv2/controller/Base.controller",
    "logaligroup/employeesv2/model/formatter",
    "sap/m/MessageBox",
  ],
  function (Base, formatter, MessageBox) {
    "use strict";

    return Base.extend(
      "logaligroup.employeesv2.controller.EmployeeDetails",
      {
        Formatter: formatter,

        /**
         * @override
         */
        onInit: function () {
          //Instancia del even bus - eventos nos permite manejar el layout
          this._bus = sap.ui.getCore().getEventBus();
        },

        onCreateIncidence: function () {
          var tableIncidence = this.getView().byId("tableIncidence");
          var newIncidence = sap.ui.xmlfragment(
            "logaligroup.employeesv2.fragment.NewIncidence",
            this
          );
          var modelIncidence = this.getView().getModel("incidentModel");
          var oData = modelIncidence.getData();
          //Obtenemos la longitud de los datos del oData
          var index = oData.length;
          //agrego la propiedad index sumando 1 al indice obtenido
          //oData.push({ incidenceId: index + 1 });
          oData.push({
            index: index + 1,
            _validaDate: false,
            EnabledSave: false,
          });

          //refrescamos el modelo
          modelIncidence.refresh();
          //bindea al modelo la propiedad index
          newIncidence.bindElement("incidentModel>/" + index);
          //se agrega a la tabla el contenido del modelo
          tableIncidence.addContent(newIncidence);
        },

        onDeleteincidence: function (oEvent) {
          //Datos de la row que se presiono el boton delete
          var contextObj = oEvent
            .getSource()
            .getBindingContext("incidentModel")
            .getObject();

          //Se publica un evento para tener todas las logicas del CRUD en este caso DELETE en un solo lugar "Main.controller"
          //Para esto se debe publicar en el bus un evento

          MessageBox.confirm("Esta seguro que quiere borrar el incidente?", {
            onClose: function (oAction) {
              if (oAction === "OK") {
                this._bus.publish("incidence", "onDeleteIncidence", {
                  IncidenceId: contextObj.IncidenceId,
                  SapId: contextObj.SapId,
                  EmployeeId: contextObj.EmployeeId,
                });
              }
            }.bind(this),
          });

          //LOGICA VIEJA SIN ODATA
          /* var tableIncidence = this.getView().byId("tableIncidence");

          var rowSelected = oEvent.getSource().getParent().getParent();
          var incidenceModel = this.getView().getModel("incidentModel");
          var oData = incidenceModel.getData();
          var contextObj = rowSelected.getBindingContext("incidentModel");

          oData.splice(contextObj.index - 1, 1);

          for (const i in oData) {
            oData[i].index = parseInt(i) + 1;
          }

          incidenceModel.refresh();

          tableIncidence.removeContent(rowSelected);

          for (const j in tableIncidence.getContent()) {
            tableIncidence.getContent()[j].bindElement("incidentModel>/" + j);
          }*/
        },

        onSaveIncident: function (oEvent) {
          var incidence = oEvent.getSource().getParent().getParent();

          //Obtenemos la linea del evento
          var incidenceRow = incidence.getBindingContext("incidentModel");

          //Event BUS
          this._bus.publish("incidence", "onSaveIncidence", {
            incidenceRow: incidenceRow.sPath.replace("/", ""),
          });
        },

        updateIncidenceCreationDate: function (oEvent) {
          var oContext = oEvent.getSource().getBindingContext("incidentModel");
          var oContextObj = oContext.getObject();
          if (oEvent.getSource().isValidValue()) {
            oContextObj.CreationDateX = true;
            oContextObj._validaDate = true;
            oContextObj.CreationDateState = "None";
          } else {
            oContextObj._validaDate = false;
            oContextObj.CreationDateState = "Error";
            MessageBox.error("Dato Invalido", {
              title: "Error",
              onclose: null,
              styleClass: "",
              actions: MessageBox.Action.close,
              emphasizedAction: null,
              initialFocus: null,
              textDirection: sap.ui.core.TextDirection.Inherit,
            });
          }
          if (oEvent.getSource().isValidValue() && oContextObj.Reason) {
            oContextObj.EnabledSave = true;
          } else {
            oContextObj.EnabledSave = false;
          }
          oContext.getModel().refresh();
        },

        updateIncidenceReason: function (oEvent) {
          var oContext = oEvent.getSource().getBindingContext("incidentModel");
          var oContextObj = oContext.getObject();
          if (oEvent.getSource().getValue() != "") {
            oContextObj.ReasonX = true;
            oContextObj._validaReason = true;
            oContextObj.CreationReasonState = "None";
          } else {
            oContextObj._validaReason = false;
            oContextObj.CreationReasonState = "Error";
          }

          oContext.getModel().refresh();
        },

        updateIncidenceType: function (oEvent) {
          var oContext = oEvent.getSource().getBindingContext("incidentModel");
          var oContextObj = oContext.getObject();
          oContextObj.TypeX = true;
        },

       /* Esta funcion se hereda del Base
       ordersToDetails: function (oEvent) {
          var oContext = oEvent.getSource().getBindingContext("odataNortwhind");

          var oContextObj = oContext.getObject();

          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("RouteOrderDetails", {
            OrderId: oContextObj.OrderID,
          });
        },*/
      }
    );
  }
);
