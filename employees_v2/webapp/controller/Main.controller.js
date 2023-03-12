sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/ui/model/Filter",
  "sap/m/MessageBox",
],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel,
    MessageToast,
    Filter,
    MessageBox) {
    "use strict";

    return Controller.extend("logaligroup.employeesv2.controller.Main", {
      onBeforeRendering: function () {
        this._detatilEmployeeView = this.getView().byId("detailEmployee");
      },

      /**
       * @override
       */
      onInit: function () {
        //1° Forma de llamar a un JSON (Segundo parametro False - Espera el retrono del contenido)
        //var oJsonModel = new sap.ui.model.json.JSONModel;
        ////var oJsonModel = new JSONModel();
        //// oJsonModel.loadData('./localService/mockdata/Employees.json', "false");
        //var jsonData = oJsonModel.loadData('./localService/mockdata/Employees.json', false);
        //// this.getView().setModel(oJsonModel);

        //2° Forma llamado a un JSON, se ejecuta cuando termina de cargar el archivo
        // oJsonModel.attachRequestCompleted(function(oEvent){
        //     console.log(JSON.stringify(oJsonModel.getData()));
        // });

        //Llamado al Countries.json
        var oJsonMCountry = new JSONModel();
        oJsonMCountry.loadData(
          "./model/json/Countries.json",
          "false"
        );
        this.getView().setModel(oJsonMCountry, "Countries");
        //Obtencion Modelo 118n
        //var i18nBoundle = this.getView().getModel('i18n').getResourceBundle();
        //var i18nModel = this.getView().getModel('i18n');

        /**
         * ? Modelo Layout Json
         */

        var oJsonModelL = new JSONModel();
        oJsonModelL.loadData("./model/json/Layouts.json", "false");
        //var jsonData = oJsonModel.loadData('./localService/mockdata/Employees.json', false);
        this.getView().setModel(oJsonModelL, "Layouts");

        //Modelo de Configuracion
        var oJsonMCountry = new JSONModel({
          VisibleId: true,
          VisibleName: true,
          VisibleCountry: true,
          VisibleCity: false,
          VisibleBtnShowCity: true,
          VisibleBtnHideCity: false,
        });
        this.getView().setModel(oJsonMCountry, "ConfigView");

        this._bus = sap.ui.getCore().getEventBus();

        this._bus.subscribe(
          "flexible",
          "showDetails",
          this.showEmployeeDetails,
          this
        );

        this._bus.subscribe(
          "incidence",
          "onSaveIncidence",
          this.onSaveOdataIncidence,
          this
        );

        this._bus.subscribe(
          "incidence",
          "onDeleteIncidence",
          function (channelId, eventId, data) {
            this.getView()
              .getModel('incidentModel')
              .remove(
                "/IncidentsSet(IncidenceId='" +
                data.IncidenceId +
                "',SapId='" +
                data.SapId +
                "',EmployeeId='" +
                data.EmployeeId +
                "')",
                {
                  success: function () {
                    onReadOdataIncidence(data.EmployeeId);
                    MessageToast.show("Borrado OK :)");
                  }.bind(this),
                  error: function (oError) {
                    MessageToast.show("Los datos no fueron borrados :(");
                  }.bind(this),
                }
              );
          }, this
        );
      },

      showEmployeeDetails: function (category, nameEvent, path) {
        //Obtener la informacion del registro seleccionado desde el MasterEmployee para
        // volcarlo en el EmployeeDetails.
        //Cambiando el Layout

        var detailView = this.getView().byId("detailEmployee");

        detailView = detailView.bindElement("odataNortwhind>" + path);

        //Cambio de Layout
        this.getView()
          .getModel("Layouts")
          .setProperty("/ActiveKey", "TwoColumnsMidExpanded");

        var incidentModel = new JSONModel([]);
        detailView.setModel(incidentModel, "incidentModel");
        //borra toda informacion de una seleccion de registro de uno a otro.
        detailView.byId("tableIncidence").removeAllContent();

        this.onReadOdataIncidence(
          this._detatilEmployeeView
            .getBindingContext("odataNortwhind")
            .getObject().EmployeeID
        );
      },

      onSaveOdataIncidence: function (channelId, eventId, data) {
        const resourceBoundle = this.getView()
          .getModel("i18n")
          .getResourceBundle();

        let employeeId = this._detatilEmployeeView
          .getBindingContext("odataNortwhind")
          .getObject().EmployeeID;

        let incidentModel = this._detatilEmployeeView
          .getModel("incidentModel")
          .getData();

        if (
          typeof incidentModel[data.incidenceRow].IncidenceId == "undefined"
        ) {
          //Es un registro nuevo.

          //Preparacion datos para enviar al oData(Sap)
          var body = {
            SapId: this.getOwnerComponent().SapId,
            EmployeeId: employeeId.toString(),
            CreationDate: incidentModel[data.incidenceRow].CreationDate,
            Type: incidentModel[data.incidenceRow].Type,
            Reason: incidentModel[data.incidenceRow].Reason,
          };

          this.getView()
            .getModel("incidentModel")
            .create("/IncidentsSet", body, {
              success: function () {
                onReadOdataIncidence(employeeId);
                //MessageToast.show("Los datos se agregaron correctamente");
                MessageBox.success("Los datos se agregaron correctamente");
              }.bind(this),

              error: function (oError) {
                MessageToast.show("Los datos no fueron agregados :(");
              }.bind(this),
            });
        } else if (
          incidentModel[data.incidenceRow].CreationDateX === true ||
          incidentModel[data.incidenceRow].ReasonX === true ||
          incidentModel[data.incidenceRow].TypeX === true
        ) {
          var body = {
            CreationDate: incidentModel[data.incidenceRow].CreationDate,
            CreationDateX: incidentModel[data.incidenceRow].CreationDateX,
            Type: incidentModel[data.incidenceRow].Type,
            TypeX: incidentModel[data.incidenceRow].TypeX,
            Reason: incidentModel[data.incidenceRow].Reason,
            ReasonX: incidentModel[data.incidenceRow].ReasonX,
          };

          var oModel = this.getView().getModel("incidentModel");

          oModel.update(
            "/IncidentsSet(IncidenceId='" +
            incidentModel[data.incidenceRow].IncidenceId +
            "',SapId='" +
            incidentModel[data.incidenceRow].SapId +
            "',EmployeeId='" +
            incidentModel[data.incidenceRow].EmployeeId +
            "')",
            body,
            {
              success: function () {
                onReadOdataIncidence(employeeId);
                MessageToast.show("Actualizacion OK :)");
              },
              error: function (oError) {
                MessageToast.show("Los datos no fueron actualizados :(");
              },
            }
          );
        } else {
          //Si es un registro a Actualizar
          MessageToast.show("No se detectaron cambios");
        }
      },

      onReadOdataIncidence: function (employeeId) {
        let oModel = this.getView().getModel("incidentModel");

        oModel.read("/IncidentsSet", {
          filters: [
            new Filter("SapId", "EQ", this.getOwnerComponent().SapId),
            new Filter("EmployeeId", "EQ", employeeId.toString()),
          ],
          success: function (data) {
            var incdenceModel =
              this._detatilEmployeeView.getModel("incidentModel");
            incdenceModel.setData(data.results);

            var tableIncidence =
              this._detatilEmployeeView.byId("tableIncidence");
            tableIncidence.removeAllContent();

            for (var incidence in data.results) {

              data.results[incidence]._ValidateDate = true;

              var newIncidence = sap.ui.xmlfragment(
                "logaligroup.employeesv2.fragment.NewIncidence",
                this._detatilEmployeeView.getController()
              );
              this._detatilEmployeeView.addDependent(newIncidence);
              newIncidence.bindElement("incidentModel>/" + incidence);
              tableIncidence.addContent(newIncidence);
            }
          }.bind(this),
          error: function (oError) { },
        });
      },
    });
  });
