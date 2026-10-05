export default async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const token=process.env.STORYBLOK_TOKEN;
  if(!token)return res.status(500).json({configured:false,error:'STORYBLOK_TOKEN is not configured in Vercel'});
  const preview=String(req.query?.preview||'')==='1';
  try{
    const stories=[]; let page=1;
    while(page<=10){
      const params=new URLSearchParams({version:preview?'draft':'published',token,content_type:'project',per_page:'100',page:String(page),cv:String(Date.now())});
      const response=await fetch('https://api.storyblok.com/v2/cdn/stories?'+params.toString(),{cache:'no-store'});
      const body=await response.text();
      if(!response.ok)return res.status(response.status).json({configured:true,storyblok_status:response.status,storyblok_response:body});
      const data=JSON.parse(body); const batch=Array.isArray(data.stories)?data.stories:[]; stories.push(...batch); if(batch.length<100)break; page++;
    }
    res.setHeader('Cache-Control','no-store,max-age=0');
    return res.status(200).json({configured:true,preview,version:preview?'draft':'published',stories});
  }catch(error){return res.status(500).json({configured:true,error:error?.message||'Unable to contact Storyblok'});}
}
