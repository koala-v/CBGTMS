using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ServiceStack.ServiceHost;
using ServiceStack.OrmLite;
using WebApi.ServiceModel.Tables;

namespace WebApi.ServiceModel.TMS
{
    [Route("/tms/login/check", "Get")]
    public class Tms_Login : IReturn<CommonResponse>
    {
      
        public string DriverCode { get; set; }
        public string BusinessPartyCode { get; set; }
        public string PassWord { get; set; }
   

    }
    public class Tms_Login_Logic
    {    
        public IDbConnectionFactory DbConnectionFactory { get; set; }
        public List<Todr1_Rcbp1> LoginCheck(Tms_Login request)
        {
            
           List<Todr1_Rcbp1> Result = null; 
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("TMS"))
                {
                    string strSql = "";
                    if (request.DriverCode != null && request.DriverCode.Length > 0)

                    {
                        strSql = "Select isnull(DriverCode,'') as  DriverCode   From Todr1 Where DriverCode='" + request.DriverCode + "' ";
                        Result = db.Select<Todr1_Rcbp1>(strSql);
                    }
                    else if (request.BusinessPartyCode != null && request.BusinessPartyCode.Length > 0 && request.PassWord != null && request.PassWord.Length > 0)
                    {
                        strSql = "Select isnull(BusinessPartyCode,'') as  BusinessPartyCode ,isnull(PassWord,'') as  PassWord From Rcbp1 Where BusinessPartyCode='" + request.BusinessPartyCode + "' And PassWord ='" + request.PassWord + "' ";
                        Result = db.Select<Todr1_Rcbp1>(strSql);
                    }

                }
            }
            catch { throw; }
            return Result;

        }
    }
}
