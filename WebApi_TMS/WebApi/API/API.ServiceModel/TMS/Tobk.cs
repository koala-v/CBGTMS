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
        public string Remark { get; set; }
        public string OnBehalfName { get; set; }
        public string TableName { get; set; }
        public string UpdateAllString { get; set; }
        public string DriverCode { get; set; }
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
                    strSql = " select BookingNo as 'Key','Tobk1' as TableName, Case JobType when 'CO' then 'Collection' when 'DE' then 'Delivery' when 'TP' then 'Transport' else '' end as DCFlag ,'' as UpdatedFlag ,isnull((cast(TotalPcs as nvarchar(20))+' ' +UomCode),'') as PcsUom ," +
                       "Case JobType when 'CO' then FromName else ToName END as DeliveryToName ,DeliveryEndDateTime  as TimeFrom ," +
                        "Case JobType when 'CO' then FromAddress1 else ToAddress1 END as DeliveryToAddress1 , " +
                             " Case JobType when 'CO' then FromAddress2 else ToAddress2 END as DeliveryToAddress2 ,Case JobType when 'CO' then FromAddress3 else ToAddress3 END as DeliveryToAddress3 ,Case JobType when 'CO' then FromAddress4 else ToAddress4 END as DeliveryToAddress4 , " +
                             "TotalGrossWeight as Weight,TotalVolume As Volume ,isnull(Description, '') as DeliveryInstruction1, '' as DeliveryInstruction2, " +
                             "'' as DeliveryInstruction3,DescriptionOfGoods1 AS CargoDescription,Note as Remark,AttachmentFlag as AttachmentFlag ,isnull(JobNo, '') as JobNo,Case StatusCode When 'POD' then 'POD' Else(Case(Select Top 1 StatusCode from jmjm3 Where JobNo = Tobk1.JobNo Order By LineItemNo DESC) When 'CANCEL' then 'CANCEL' else Tobk1.StatusCode END) END AS StatusCode,'' AS CancelDescription," +
                             "DriverCode, CONVERT(varchar(20), DeliveryEndDateTime, 112) as FilterTime , " +
                             "Case JobType when 'CO' then 'PC ' + isnull(FromPostalCode, '') else 'PC ' + isnull(ToPostalCode, '') END as PostalCode,NoOfPallet,OnBehalfName,TotalPcs," +
                             " isnull((Case JobType when 'CO' then(select top 1 case isnull(Rcbp1.Handphone1, '') when '' then isnull(Rcbp1.Telephone, '')  else Rcbp1.Handphone1 end   from rcbp1 where rcbp1.BusinessPartyCode = Tobk1.FromCode ) else (select top 1 case isnull(Rcbp1.Handphone1, '') when '' then isnull(Rcbp1.Telephone, '')  else Rcbp1.Handphone1 end   from rcbp1 where rcbp1.BusinessPartyCode = Tobk1.ToCode) End), '')  AS PhoneNumber" +
                             "  from Tobk1  Where CONVERT(varchar(20),ScheduleDate ,112)=(select convert(varchar(10),getdate(),112))  and DriverCode ='" + request.DriverCode + "'";
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
                    string str;
                    str = " Note = "+ Modfunction.SQLSafeValue(request.Remark) + ",OnBehalfName = " + Modfunction.SQLSafeValue(request.OnBehalfName) + ",StatusCode = 'POD',CompletedFlag='Y'";
                    db.Update(request.TableName,
                           str,
                           " BookingNo='" + request.Key + "'");
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
                                string strTableName = ja[i]["TableName"].ToString();
                                string strRemark = "";
                                string strStatusCode = "";
                                string strOnBehalfName = "";
                                if (ja[i]["OnBehalfName"] != null || ja[i]["OnBehalfName"].ToString() != "")
                                    strOnBehalfName = ja[i]["OnBehalfName"].ToString();
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
                                            LineItemNo = intMaxLineItemNo,
                                            AutoFlag = "N",
                                            StatusCode = "CANCEL",
                                            UpdateBy = ja[0]["DriverCode"] == null ? "" : Modfunction.SQLSafe(ja[0]["DriverCode"].ToString()),
                                            Remark = Modfunction.SQLSafe(strRemark),
                                            Description = ja[0]["CancelDescription"] == null ? "" : Modfunction.SQLSafe(ja[0]["CancelDescription"].ToString())
                                        });
                                        db.Update(strTableName,
                                              " Note = '" + Modfunction.SQLSafe(strRemark) + "', OnBehalfName = '" + Modfunction.SQLSafe(strOnBehalfName) + "'",
                                              " BookingNo='" + strKey + "'");

                                    }
                                }
                                else
                                {
                                    db.Update(strTableName,
                                           " Note = '" + Modfunction.SQLSafe(strRemark) + "',StatusCode = '" + strStatusCode + "', OnBehalfName = '" + Modfunction.SQLSafe(strOnBehalfName) + "'",
                                           " BookingNo='" + strKey + "'");
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
