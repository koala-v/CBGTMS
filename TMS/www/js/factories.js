var appFactory = angular.module('TMS.factories', [
    'TMS.services'
]);

appFactory.factory('ACCEPTJOB_ORM', function () {
    var ACCEPTJOB_ORM = {
        LIST: {
            Csbk1s: {},
            _setCsbk: function (value) {
                this.Csbk1s = value;
            }
        }
    };
    ACCEPTJOB_ORM.init = function () {
        this.LIST.Csbk1s = {};
    };
    return ACCEPTJOB_ORM;
});

appFactory.factory('TABLE_DB', function () {
    var TABLE_DB = {
        Todr1_Rcbp1: {
            DriverCode: 'TEXT',
            BusinessPartyCode: 'TEXT',
            PassWord: 'TEXT',
        },
        Tobk1: {
            Volume: 'INT',
            Weight: 'INT',
            DeliveryInstruction1: 'TEXT',
            DeliveryInstruction2: 'TEXT',
            DeliveryInstruction3: 'TEXT',
            Remark: 'TEXT',
            AttachmentFlag: 'TEXT',
            UpdatedFlag: 'TEXT',
            Key: 'TEXT',
            JobNo: 'TEXT',
            TableName: 'TEXT',
            DCFlag: 'TEXT',
            PcsUom: 'TEXT',
            TimeFrom: 'TEXT',
            // DeliveryToName: 'TEXT',
            // DeliveryToAddress1: 'TEXT',
            // DeliveryToAddress2: 'TEXT',
            // DeliveryToAddress3: 'TEXT',
            // DeliveryToAddress4: 'TEXT',
            FromLocationName: 'TEXT',
            FromLocationAddress1: 'TEXT',
            FromLocationAddress2: 'TEXT',
            FromLocationAddress3: 'TEXT',
            FromLocationAddress4: 'TEXT',
            ToLocationName: 'TEXT',
            ToLocationAddress1: 'TEXT',
            ToLocationAddress2: 'TEXT',
            ToLocationAddress3: 'TEXT',
            ToLocationAddress4: 'TEXT',
            StatusCode: 'TEXT',
            CancelDescription: 'TEXT',
            DriverCode: 'TEXT',
            FilterTime: 'TEXT',
            PhoneNumber: 'TEXT',
            TempBase64: 'TEXT',
            NoOfPallet: 'INT',
            OnBehalfName: 'TEXT',
            TotalPcs: 'INT',
            PostalCode: 'TEXT',
            CargoDescription: 'TEXT',
            AppHideScheduleTime: 'TEXT',
            UpdateRemarkFlag: 'TEXT',
            LineItemNo: 'INT',
            JobSeqNo: 'INT',
              DateTime: 'TEXT'
        },
        Tobk1Pending: {
            Volume: 'INT',
            Weight: 'INT',
            DeliveryInstruction1: 'TEXT',
            DeliveryInstruction2: 'TEXT',
            DeliveryInstruction3: 'TEXT',
            Remark: 'TEXT',
            AttachmentFlag: 'TEXT',
            UpdatedFlag: 'TEXT',
            Key: 'TEXT',
            JobNo: 'TEXT',
            TableName: 'TEXT',
            DCFlag: 'TEXT',
            PcsUom: 'TEXT',
            TimeFrom: 'TEXT',
            // DeliveryToName: 'TEXT',
            // DeliveryToAddress1: 'TEXT',
            // DeliveryToAddress2: 'TEXT',
            // DeliveryToAddress3: 'TEXT',
            // DeliveryToAddress4: 'TEXT',
            FromLocationName: 'TEXT',
            FromLocationAddress1: 'TEXT',
            FromLocationAddress2: 'TEXT',
            FromLocationAddress3: 'TEXT',
            FromLocationAddress4: 'TEXT',
            ToLocationName: 'TEXT',
            ToLocationAddress1: 'TEXT',
            ToLocationAddress2: 'TEXT',
            ToLocationAddress3: 'TEXT',
            ToLocationAddress4: 'TEXT',
            StatusCode: 'TEXT',
            CancelDescription: 'TEXT',
            DriverCode: 'TEXT',
            FilterTime: 'TEXT',
            PhoneNumber: 'TEXT',
            TempBase64: 'TEXT',
            NoOfPallet: 'INT',
            OnBehalfName: 'TEXT',
            TotalPcs: 'INT',
            PostalCode: 'TEXT',
            CargoDescription: 'TEXT',
            AppHideScheduleTime: 'TEXT',
            UpdateRemarkFlag: 'TEXT',
            LineItemNo: 'INT',
            JobSeqNo: 'INT',
DateTime: 'TEXT'
        },
        Jmjm1: {
            JobNo: 'TEXT',
            DeliveryAgentCode: 'TEXT',
            ETA: 'TEXT',
            Pcs: 'INT',
            AwbBlNo: 'TEXT',
            UpdatedFlag: 'TEXT',
            Address: 'TEXT',
            ConsigneeName: 'TEXT',
            ActualArrivalDate: 'TEXT',
            DeliveryDate: 'TEXT',
        }

    };
    return TABLE_DB;
});
