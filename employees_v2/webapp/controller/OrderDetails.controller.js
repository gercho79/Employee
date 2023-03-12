sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "/sap/ui/core/routing/History",
    "sap/m/ObjectListItem",
    "sap/m/MessageBox",
    "sap/ui/commons/Message",
    "sap/m/UploadCollection",
    "sap/m/UploadCollectionParameter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
], function (Controller, History, ObjectListItem, MessageBox, Message, UploadCollection, UploadCollectionParameter, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("logaligroup.employeesv2.controller.OrderDetails", {
        /**
       * @override
       */
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteOrderDetails").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            // limpiar Firma en el controlador
            // this.onClearSignature();

            this.getView().bindElement({
                path: "/Orders(" + oEvent.getParameter("arguments").OrderId + ")",
                model: "odataNortwhind",
                events: {
                    dataReceived: function (oData) {
                        this.readSignature(oData.getParameter("data").OrderID, oData.getParameter("data").EmployeeID, this.getOwnerComponent().SapId);
                    }.bind(this)
                }
            });

            const objContext = this.getView().getModel("odataNortwhind").getContext("/Orders(" + oEvent.getParameter("arguments").OrderId + ")").getObject();
        },

        /*
       * Read oData Signature
       * Read oData Files
       */
        readSignature: function (orderId, EmployeeId, sapId) {
            this.getView().getModel("incidentModel").read("/SignatureSet(OrderId='" + orderId + "',EmployeeId='" + EmployeeId + "',SapId='" + sapId + "')", {
                success: function (data) {
                    let signature = this.getView().byId("signature");
                    signature.setSignature("data:image/png;base64," + data.MediaContent);
                }.bind(this),
                error: function () { }
            });

            // BIND FILES
            this.byId("uploadCollection").bindAggregation("items", {
                path: "incidentModel>FileSet",
                filters: [
                    new Filter("orderId", FilterOperator.EQ, orderId),
                    new Filter("EmployeeId", FilterOperator.EQ, EmployeeId),
                    new Filter("SapId", FilterOperator.EQ, sapId),
                ],

                template: new sap.m.UploadCollection(
                    { documentId: "{incidentModel>AttId}", visibleEdit: false, fileName: "{incidentModel>FileName}" }
                ).attachPress(this.dowloadFile),
                // .attachPress(this.dowloadFile) - genera el link para visualizar el archivo.
            });
        },

        onBack: function () {
            var sHistory = History.getInstance();
            let sPreviousHash = sHistory.getPreviousHash();

            if (sPreviousHash !== undefined) { // Si hubo una navegacion vuelve a la anterior vista
                window.history.go(-1);
            } else {
                // si hubo una navegacion de otra vista que no se encuentra luego de la primera
                // le decimos que vuelva a la vista principal
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteMain", true);
            }
        },

        clearSignature: function () {
            var Signature = this.getView().byId("signature");
            Signature.clear();
        },

        factoryOrderDetails: function (listid, oContext) {
            var contextObj = oContext.getObject();
            contextObj.Currency = "EUR";
            var unitInStock = oContext.getModel().getProperty("/Products(" + contextObj.ProductID + "/UnitsInStock)");

            if (contextObj.Quantity <= unitInStock) {
                var objectListItem = new sap.m.ObjectListItem({
                    title: "{odataNortwhind> /Products(" + contextObj.ProductID + "/ProductName) ({odataNortwhind>Quantity} )}",
                    number: "{parts: [ {path: 'odataNortwhind>UnitPrice' } , {path: 'odataNortwhind>Currency'}], type: 'sap.ui.model.type.Currency', formatOptions: {showMeasure: false} '}",
                    numberunit: "{'odataNortwhind>Currency'}"
                });
                return objectListItem;
            } else {
                var customListItems = new sap.m.CustomListItem({
                    content: [
                        new sap.m.Bar(
                            {
                                contentLeft: new sap.m.Label(
                                    {
                                        text: "{odataNortwhind>/Products(" + contextObj.ProductID + ")/ProductName) ({odataNortwhind>Quantity})}"
                                    }
                                ),
                                contentMiddle: new sap.m.ObjectStatus(
                                    {
                                        text: "Stock Disponible {odataNortwhind>/Products(" + contextObj.ProductID + ")/UnitStock)} ",
                                        state: "Error"
                                    }
                                ),
                                contentRight: new sap.m.Label(
                                    { text: "{parts: [ {path: 'odataNortwhind>UnitPrice'}, {path: 'odataNortwhind>Currency'}], type: 'sap.ui.model.type.Currency'}" }
                                )
                            }
                        ),
                    ]
                });
                return customListItems;
            }
        },

        onSaveSignature: function (oEvent) { // Obtener la isntacia de la firma
            var oSignature = this.getView().byId("signature");
            const oResourceBoundle = this.getView().getModel("i18n").getResourceBundle();
            let signaturePng;

            if (oSignature.isFill()) {
                signaturePng = oSignature.getSingature().replace("data:image/png;base64,", "");
            } else { // No tenemos la Firma cuando se presiona SAVE
                MessageBox.error(oResourceBoundle.getText("fillSignature"));
            }

            // Llamar a la entidad SignatureSet con:
            // EmployeId
            // SapId
            // OrderId

            let objectContent = oEvent.getSource().getBindingContext("odataNortwhind").getObject();

            let body = {
                EmployeeId: objectContent.EmployeeID.toString(),
                OrderId: objectContent.OrderID.toString(),
                SapId: this.getOwnerComponent().SapId,
                MimeType: "image/png",
                MediaContent: signaturePng
            };

            this.getView().getModel("incidentModel").create("/SignatureSet", body, {
                success: function () {
                    MessageBox.information("Firma Grabada correctamente");
                },
                error: function () {
                    MessageBox.error("La Firma realizada no pudo ser grabada. intente nuevamente.");
                }
            });
        },

        onFileBeforeUpload: function (oEvent) {
            /**
             * UPLOAD COLLECTION
            */
            let fileName = oEvent.getParameter("fileName");
            let objContext = oEvent.getSource().getBindingContext("odataNortwhind").getObject();
            let slug = objContext.OrderID + ";" + objContext.EmployeeID + ";" + this.getOwnerComponent().SapId + ";" + fileName;
            let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({ name: "slug", value: slug });

            // Añadimos el parametro Header Slug dentro del componente UploadCollection
            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
        },

        onFileChange: function (oEvent) {
            let uploadCollection = oEvent.getSource();

            // Header Token CSRF
            let oCustomerHeaderToken = new sap.m.UploadCollectionParameter({ 
                name: "x-crsf-token", 
                value: this.getView().getModel("incidentModel").getSecurityToken() 
            });
            // Añadimos el parametro Header Slug dentro del componente UploadCollection
            uploadCollection.addHeaderParameter(oCustomerHeaderToken);
        },

        onFileUploadComplete: function (oEvent) { // Refresca el modelo una vez subido un nuevo archivo.
            var oUploadCollection = oEvent.getSource();
			oUploadCollection.getBinding("items").refresh();
        },

        onFileDelete: function (oEvent) {
            var uploadCollection = oEvent.getSource();
            // obetenmos el item que fue seleccionado, obtenemos los datos del modelo de ese registro y su ruta.
            var sPath = oEvent.getParameter("item").getBindingContext("incidentmodel").getPath();

            this.getView().getModel("inicdentModel").remove(sPatch, {
                success: function () {
                    uploadCollection.getBinding("items").refresh();
                },
                error: function () { }
            }.bind(this));
        },

        dowloadFile: function (oEvent) {
            let path = oEvent.getParameter("item").getBindingContext("incidentmodel").getPath();
            window.open("/sap/opu/odata/sap/YSAPUI5_SRV_01" + path + "/$value");
        }
    });
});
