using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WebApi.ServiceModel;
using WebApi.ServiceModel.TMS;

namespace WebApi.ServiceInterface.TMS
{
    class LoginService
    {
        public void initial(Auth auth, Tms_Login request, Tms_Login_Logic loginLogic, CommonResponse ecr, string[] token, string uri)
        {
            if (auth.AuthResult(token, uri))
            {
                if (uri.IndexOf("/tms/login/check") > 0)
                {
                    
                    ecr.meta.code = 200;
                    ecr.meta.message = "OK";
                    ecr.data.results = loginLogic.LoginCheck(request);
                }
                else
                {
                    ecr.meta.code = 612;
                    ecr.meta.message = "Invalid Login ID";
                }
            }
            else
            {
                ecr.meta.code = 401;
                ecr.meta.message = "Unauthorized";
            }

        }
    }
}
