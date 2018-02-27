﻿using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ServiceStack.ServiceHost;
using ServiceStack.OrmLite;
using WebApi.ServiceModel.Tables;
using ServiceStack.Common.Web;
using System.Drawing;
using ServiceStack;
using System.Drawing.Imaging;
using WebApi.ServiceModel.Utils;
using System.IO;
using System.Data.SqlClient;
using System.Data;

namespace WebApi.ServiceModel.TMS
{
    [Route("/tms/upload/img", "Post")]                      //img?Key= & TableName= & FileName= & Extension=
    [Route("/tms/upload/img", "Options")]			//img?FileName= & Extension=
    public class UploadImg: IReturn<CommonResponse>
    {
        public string Key { get; set; }
        public string FileName { get; set; }
        public string Extension { get; set; }
        public string Base64 { get; set; }
        public string TableName { get; set; }
        public Stream RequestStream { get; set; }
    }
    public class UploadImg_Logic
    {
        public IDbConnectionFactory DbConnectionFactory { get; set; }
        public int upload(UploadImg request)
        {
            int i = -1;
            string folderPath = "";
          
            if (!string.IsNullOrEmpty(request.Key))
            {
                try
                {
                    using (var db = DbConnectionFactory.OpenDbConnection())
                    {
                       string strSQL = "Select  DocumentPath From Saco1 ";
                        List<Saco1> saco1 = db.Select<Saco1>(strSQL);
                        if (saco1.Count > 0)
                        {
                            folderPath = saco1[0].DocumentPath  + "\\"+request.TableName+"\\" + request.Key;
                        }
                    }
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }
																				if (Directory.Exists(folderPath))
																				{
																								//if (!FolderSecurityHelper.ExistFolderRights(folderPath))
																								//{
																												FolderSecurityHelper.SetFolderRights(folderPath);
																								//}
																				}
                    if (string.IsNullOrEmpty(request.FileName)) return i;
                    string resultFile = Path.Combine(folderPath, request.FileName);
                    if (File.Exists(resultFile))
                    {
                        File.Delete(resultFile);
                    }
                    //Image img = System.Drawing.Image.FromStream(request.RequestStream);
                    //img.Save(System.IO.Path.GetTempPath() + "\\" + request.FileName, ImageFormat.Jpeg);		
                    if (!string.IsNullOrEmpty(request.Base64))
                    {
                        string strBase64 = request.Base64;
                        string[] base64s = strBase64.Split(',');
                        if (base64s.Length > 0)
                        {
                            byte[] arr = Convert.FromBase64String(base64s[1]);
                            using (MemoryStream ms = new MemoryStream(arr))
                            {                          
                                using (var db = DbConnectionFactory.OpenDbConnection())
                                {

                                    string SQL = "";
                                    string sqlConnection =  db.ConnectionString.ToString() ;
                                    SqlConnection con = new SqlConnection(sqlConnection);
                                    con.Open();
                                    SQL = "Update Rcbp3 Set  NameCard = @bytes WHERE BusinessPartyCode ='SYSMAGIC' and lineItemNo = 1 ";
                                    SqlCommand cmd = new SqlCommand(SQL.ToString(), con);
                                    cmd.Parameters.Add("bytes", SqlDbType.Image);
                                    cmd.Parameters["bytes"].Value = arr;
                                    //cmd.Parameters.Add("@bytes", SqlDbType.Binary).Value = arr.ToArray();
                                     cmd.ExecuteNonQuery();
                                    con.Close();
                            
                                }
                                Bitmap bmp = new Bitmap(ms);
                                //bmp.Save(resultFile, System.Drawing.Imaging.ImageFormat.Png);
                                int x = 0;
                                int y = 0;
                                for (int Xcount = 0; Xcount < bmp.Width; Xcount++)
                                {
                                    for (int Ycount = 0; Ycount < bmp.Height; Ycount++)
                                    {
                                       
                                        x = Xcount;
                                        y = Ycount;
                                    }
                                }

                                
                                bmp.Save(resultFile, System.Drawing.Imaging.ImageFormat.Png);

                                bmp.SetPixel(x, y, Color.Cornsilk);
                                //bmp.Save(txtFileName + ".bmp", ImageFormat.Bmp);
                                //bmp.Save(txtFileName + ".gif", ImageFormat.Gif);
                                //bmp.Save(txtFileName + ".png", ImageFormat.Png);
                                i = 0;

                            

                            }
                        }
                    }
                    else {
                        using (FileStream file = File.Create(resultFile))
                        {                         
                            request.RequestStream.Copy(file);
                            i = 0;
                        }
                    }
                    if (i.Equals(0))
                    {
                        using (var db = DbConnectionFactory.OpenDbConnection())
                        {
                            db.Update("Tobk1",
                                    "AttachmentFlag = 'Y'",
                                  " BookingNo='" + request.Key + "'");
                        }
                    }
                }
                catch { throw; }
            }
            return i;
        }
    }

}
