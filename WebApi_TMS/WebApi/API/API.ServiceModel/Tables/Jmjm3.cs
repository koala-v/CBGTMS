using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WebApi.ServiceModel.Tables
{
    public class Jmjm3
    {
        public int LineItemNo { get; set; }
        public string JobNo { get; set; }
        public string Description { get; set; }
        public Nullable<System.DateTime> DateTime { get; set; }
        public Nullable<System.DateTime> UpdateDatetime { get; set; }
        public string UpdateBy { get; set; }
        public string StatusCode { get; set; }
        public string AutoFlag { get; set; }
        public string Remark { get; set; }
    }
}
