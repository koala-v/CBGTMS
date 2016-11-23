using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ServiceStack.ServiceHost;
using ServiceStack.OrmLite;
using WebApi.ServiceModel.Tables;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

namespace WebApi.ServiceModel.TMS
{
    [Route("/tms/tobk1", "Get")]  //DriverCode=
    [Route("/tms/tobk1/update", "Post")] //
    [Route("/tms/tobk1/confirm", "Get")] //update?Key=,Remark=,TableName=

    public class Tobk : IReturn<CommonResponse>
    {
        public string Key { get; set; }
        public string LineItemNo { get; set; }
        public string Remark { get; set; }
        public string OnBehalfName { get; set; }
        public string TableName { get; set; }
        public string UpdateAllString { get; set; }
        public string DriverCode { get; set; }
        public string BookingNo { get; set; }
        public string JobNo { get; set; }
        public string DCDescription { get; set; }
    }
    public class Tobk_Logic
    {
        public IDbConnectionFactory DbConnectionFactory { get; set; }
        public List<Tobk1> Get_Tobk1_List(Tobk request)
        {

            List<Tobk1> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("TMS"))
                {
                    string strSql = "";
                    strSql = " select Tobk2.BookingNo as 'Key','Tobk2' as TableName,Tobk2.LineItemNo, Case Tobk1.JobType when 'CO' then 'Collection'" +
                                 " when 'DE' then 'Delivery' when 'TP' then 'Transport' else '' end as DCFlag ,'' as UpdatedFlag ,"+
                                 "  isnull((cast(Tobk2.Pcs as nvarchar(20)) + ' ' + Tobk2.UomCode), '') as PcsUom ," +
                                  " Case Tobk1.JobType when 'CO' then isnull(Tobk2.FromLocationName , '') else isnull(Tobk2.ToLocationName, '') END as DeliveryToName ,Tobk2.ScheduleDate as TimeFrom ," +
                                 "  Case Tobk1.JobType when 'CO' then isnull(Tobk2.FromLocationAddress1,'') else isnull(Tobk2.ToLocationAddress1,'') END as DeliveryToAddress1 ,  " +
                                 "  Case Tobk1.JobType when 'CO' then isnull(Tobk2.FromLocationAddress2,'') else isnull(Tobk2.ToLocationAddress2,'') END as DeliveryToAddress2 ," +
                                 "  Case Tobk1.JobType when 'CO' then isnull(Tobk2.FromLocationAddress3,'') else isnull(Tobk2.ToLocationAddress3,'') END as DeliveryToAddress3 ," +
                                 "  Case Tobk1.JobType when 'CO' then isnull(Tobk2.FromLocationAddress4,'') else isnull(Tobk2.ToLocationAddress4,'') END as DeliveryToAddress4 , " +
                                 "  Tobk2.GrossWeight as Weight,Tobk2.Volume ," +
                                 "  isnull(Tobk1.Description, '') as DeliveryInstruction1, '' as DeliveryInstruction2, '' as DelitructiveryInson3," +
                                 "  GoodsDescription01 AS CargoDescription,Tobk2.Note as Remark,Tobk1.AttachmentFlag as AttachmentFlag ,isnull(Tobk1.JobNo, '') as JobNo," +
                                 "  Case tobk2.completeflag When 'Y' then 'POD' Else (Case tobk2.returnFLag When 'Y' then 'CANCEL' else 'USE' END) END AS StatusCode," +
                                 "  '' AS CancelDescription, Tobk2.DriverCode, CONVERT(varchar(20), Tobk2.ScheduleDate, 112) as FilterTime ," +
                                 " Case Tobk1.JobType when 'CO' then 'PC ' + isnull(Tobk2.FromPostalCode, '') else 'PC ' + isnull(Tobk2.ToPostalCode, '') END as PostalCode," +
                                 " Tobk2.NoOfPallet,isnull(Tobk1.OnBehalfName, '') as OnBehalfName,Tobk2.Pcs AS TotalPcs," +
                                 " isnull((Case Tobk1.JobType when 'CO' then(select top 1 case isnull(Rcbp1.Handphone1, '')" +
                                 " when '' then isnull(Rcbp1.Telephone, '')  else Rcbp1.Handphone1 end   from rcbp1" +
                                 " where rcbp1.BusinessPartyCode = Tobk2.FromLocationCode ) else (select top 1 case isnull(Rcbp1.Handphone1, '')" +
                                 " when '' then isnull(Rcbp1.Telephone, '')  else Rcbp1.Handphone1 end   from rcbp1" +
                                 " where rcbp1.BusinessPartyCode = Tobk2.ToLocationCode) End), '')  AS PhoneNumber," +
                                 "  isnull((select  AppHideScheduleTime  from topa1),'N') as AppHideScheduleTime ," +
                                 " Tobk2.JobSeqNo as JobSeqNo," +
                                 " '' as UpdateRemarkFlag   from Tobk2 join Tobk1 on tobk1.BookingNo = Tobk2.BookingNo" +                                 
                                 " Where   Tobk2.DriverCode = '" + request.DriverCode + "'  ";
                    if (request.BookingNo != null && request.BookingNo != "" && request.LineItemNo != null && request.LineItemNo != "") {
                        strSql = strSql + "And Tobk2.BookingNo='" + request.BookingNo + "' And Tobk2.LineItemNo='" + request.LineItemNo+"'";
                    }
                    strSql = strSql + " order by (case isnull((select  AppHideScheduleTime  from topa1),'N') when 'Y' then JobSeqNo end) ";
                    Result = db.Select<Tobk1>(strSql);
                }
            }
            catch { throw; }
            return Result;

        }
        public int confirm_Tobk1(Tobk request)
        {
            int Result = -1;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection())
                {
                    string strJobNo = request.JobNo;
                    if (strJobNo != "" && strJobNo != null )
                    {
                        int intMaxLineItemNo = 1;
                        List<Jmjm3> list1 = db.Select<Jmjm3>("Select Max(LineItemNo) LineItemNo from Jmjm3 Where JobNo = " + Modfunction.SQLSafeValue(strJobNo));
                        if (list1 != null)
                        {
                            if (list1[0].LineItemNo > 0)
                                intMaxLineItemNo = list1[0].LineItemNo + 1;
                        }
                        if (request.DCDescription == "Collection")
                        {
                            request.DCDescription = "COLLECTED";
                        }
                        else
                        {
                            request.DCDescription = "DELIVERED";
                        }
                        db.Insert(new Jmjm3
                        {
                            JobNo = Modfunction.SQLSafe(strJobNo),
                            DateTime = DateTime.Now,
                            UpdateDatetime = DateTime.Now,
                            LineItemNo = intMaxLineItemNo,
                            RefNo = Modfunction.SQLSafe(request.LineItemNo).ToString(),
                            AutoFlag = "N",
                            StatusCode = "POD",
                            UpdateBy = Modfunction.SQLSafe(request.DriverCode),
                            Remark = Modfunction.SQLSafeValue(request.Remark),
                            Description = Modfunction.SQLSafe(request.DCDescription)
                        });
                     
                    }


                    string str;
                    str = " Note = " + Modfunction.SQLSafeValue(request.Remark) + ",DeliveryDate=GETDATE(),CompleteFlag='Y'";
                    db.Update(request.TableName,
                           str,
                           " BookingNo='" + request.Key + "' and LineItemNo='"+ request.LineItemNo + "'");


                }

            }
            catch { throw; }
            return Result;
        }

        public int UpdateAll_Tobk1(Tobk request)
        {
            int Result = -1;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection())
                {
                    if (request.UpdateAllString != null && request.UpdateAllString != "")
                    {
                        JArray ja = (JArray)JsonConvert.DeserializeObject(request.UpdateAllString);
                        if (ja != null)
                        {
                            for (int i = 0; i < ja.Count(); i++)
                            {
                                if (ja[i]["TableName"] == null || ja[i]["TableName"].ToString() == "")
                                { continue; }
                                string strKey = ja[i]["Key"].ToString();
                                string strTobk2LineItemNo= ja[i]["LineItemNo"].ToString();
                                string strTableName = ja[i]["TableName"].ToString();
                                string strRemark = "";
                                string strStatusCode = "";
                                string strDCDescription = ja[i]["DCFlag"].ToString();                      
                                if (ja[i]["Remark"] != null || ja[i]["Remark"].ToString() != "")
                                    strRemark = ja[i]["Remark"].ToString();
                                if (ja[i]["StatusCode"] != null || ja[i]["StatusCode"].ToString() != "")
                                    strStatusCode = ja[i]["StatusCode"].ToString();
                                if (strStatusCode.ToLower() == "cancel")
                                {
                                    string strJobNo = "";
                                    if (ja[i]["JobNo"] != null || ja[i]["JobNo"].ToString() != "")
                                        strJobNo = ja[i]["JobNo"].ToString();
                                    if (strJobNo != "")
                                    {
                                        int intMaxLineItemNo = 1;
                                        List<Jmjm3> list1 = db.Select<Jmjm3>("Select Max(LineItemNo) LineItemNo from Jmjm3 Where JobNo = " + Modfunction.SQLSafeValue(strJobNo));
                                        if (list1 != null)
                                        {
                                            if (list1[0].LineItemNo > 0)
                                                intMaxLineItemNo = list1[0].LineItemNo + 1;
                                        }
                                        db.Insert(new Jmjm3
                                        {
                                            JobNo = strJobNo,
                                            DateTime = DateTime.Now,
                                            UpdateDatetime = DateTime.Now,
                                            RefNo= strTobk2LineItemNo,
                                            LineItemNo = intMaxLineItemNo,
                                            AutoFlag = "N",
                                            StatusCode = "CANCEL",
                                            UpdateBy = ja[0]["DriverCode"] == null ? "" : Modfunction.SQLSafe(ja[0]["DriverCode"].ToString()),
                                            Remark = Modfunction.SQLSafe(strRemark),
                                            Description = ja[0]["CancelDescription"] == null ? "" : Modfunction.SQLSafe(ja[0]["CancelDescription"].ToString())
                                        });
                                   

                                        string str;
                                        str = " Note = " + Modfunction.SQLSafeValue(strRemark) + ",DeliveryDate=GETDATE(),ReturnFlag='Y'";
                                        db.Update(strTableName,
                                               str,
                                               " BookingNo='" + strKey + "' and LineItemNo='" + strTobk2LineItemNo + "'");

                                    }
                                }
                                else
                                {

                                    string strJobNo = "";
                                    if (ja[i]["JobNo"] != null || ja[i]["JobNo"].ToString() != "")
                                        strJobNo = ja[i]["JobNo"].ToString();
                                    if (strJobNo != "")
                                    {
                                        int intMaxLineItemNo = 1;
                                        List<Jmjm3> list1 = db.Select<Jmjm3>("Select Max(LineItemNo) LineItemNo from Jmjm3 Where JobNo = " + Modfunction.SQLSafeValue(strJobNo));
                                        if (list1 != null)
                                        {
                                            if (list1[0].LineItemNo > 0)
                                                intMaxLineItemNo = list1[0].LineItemNo + 1;
                                        }
                                        if (strDCDescription == "Collection")
                                        {
                                            strDCDescription = "COLLECTED";
                                        }
                                        else
                                        {
                                            strDCDescription = "DELIVERED";
                                        }
                                        db.Insert(new Jmjm3
                                        {
                                            JobNo = strJobNo,
                                            DateTime = DateTime.Now,
                                            UpdateDatetime = DateTime.Now,
                                            RefNo = strTobk2LineItemNo,
                                            LineItemNo = intMaxLineItemNo,
                                            AutoFlag = "N",
                                            StatusCode = "POD",
                                            UpdateBy = ja[0]["DriverCode"] == null ? "" : Modfunction.SQLSafe(ja[0]["DriverCode"].ToString()),
                                            Remark = Modfunction.SQLSafe(strRemark),
                                            Description = strDCDescription
                                        });
                                      
                                    }

                                    string str;
                                    str = " Note = " + Modfunction.SQLSafeValue(strRemark) + ",DeliveryDate=GETDATE(),CompleteFlag='Y'";
                                    db.Update(strTableName,
                                           str,
                                           " BookingNo='" + strKey + "' and LineItemNo='" + strTobk2LineItemNo + "'");

                                }

                            }
                            Result = 1;
                        }
                    }
                }
            }
            catch { throw; }
            return Result;
        }
    }
}
