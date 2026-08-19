const clean=(value,max=3000)=>String(value??'').trim().slice(0,max);
const validEmail=value=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)&&value.length<=254;

async function notifyOwner(data,reference,description,cardUrl){
  const host=process.env.SMTP_HOST,user=process.env.SMTP_USER;
  const pass=process.env.SMTP_APP_PASSWORD,to=process.env.NOTIFY_EMAIL||user;
  if(!host||!user||!pass||!to)return false;
  const {default:nodemailer}=await import('nodemailer');
  const port=Number(process.env.SMTP_PORT||465);
  const secure=String(process.env.SMTP_SECURE??port===465).toLowerCase()==='true';
  const transport=nodemailer.createTransport({host,port,secure,auth:{user,pass},connectionTimeout:10000});
  await transport.sendMail({
    from:`Ammar Website Brief <${user}>`,to,replyTo:clean(data.email),
    subject:`New website brief: ${clean(data.businessName,100)} · ${reference}`,
    text:`A qualified website brief was submitted.\n\nTrello: ${cardUrl||'Card created'}\n\n${description}`
  });
  return true;
}

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const data=req.body||{};
  if(data.company_website_confirm)return res.status(200).json({ok:true,reference:'accepted'});
  const required=['contactName','businessName','industry','location','businessSummary','projectType','platform','primaryGoal','features','contentStatus','pageCount','designStyle','budget','timeline','email','consent'];
  if(required.some(key=>!clean(data[key])))return res.status(400).json({error:'Please complete every required field'});
  if(!validEmail(clean(data.email)))return res.status(400).json({error:'Please enter a valid email address'});
  if(!['250-499','500-999','1000-2499','2500+'].includes(data.budget))return res.status(400).json({error:'Development budget must start at US$250'});
  const key=process.env.TRELLO_API_KEY,token=process.env.TRELLO_TOKEN,list=process.env.TRELLO_LIST_ID;
  if(!key||!token||!list)return res.status(503).json({error:'Submission service is not configured yet'});
  const reference='WEB-'+Date.now().toString(36).toUpperCase();
  const description=[`REFERENCE: ${reference}`,`STATUS: Qualified website brief`,``,`CONTACT`,`Name: ${clean(data.contactName)}`,`Business: ${clean(data.businessName)}`,`Email: ${clean(data.email)}`,`Phone: ${clean(data.phone)||'Not provided'}`,`Location: ${clean(data.location)}`,`Industry: ${clean(data.industry)}`,``,`PROJECT`,`Type: ${clean(data.projectType)}`,`Platform: ${clean(data.platform)}`,`Budget: US$${clean(data.budget)}`,`Timeline: ${clean(data.timeline)}`,`Pages: ${Array.isArray(data.pages)?data.pages.map(page=>clean(page,100)).join(', '):clean(data.pages)}`,`Page count: ${clean(data.pageCount)}`,`Features: ${clean(data.features)}`,`Primary goal: ${clean(data.primaryGoal)}`,`Existing site: ${clean(data.existingWebsite)||'None'}`,`Content: ${clean(data.contentStatus)}`,`Design: ${clean(data.designStyle)}`,`Inspiration: ${clean(data.inspiration)||'None'}`,`Brand assets: ${clean(data.brandAssets)}`,``,`BUSINESS CONTEXT`,`Summary: ${clean(data.businessSummary)}`,`Notes: ${clean(data.notes)||'None'}`,``,`Pricing acknowledged: development starts at US$250; domain/hosting separate.`].join('\n');
  try{
    const response=await fetch(`https://api.trello.com/1/cards?key=${encodeURIComponent(key)}&token=${encodeURIComponent(token)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idList:list,name:`${clean(data.businessName,100)} — ${clean(data.projectType,60)}`,desc:description,pos:'top'})});
    if(!response.ok)throw Error('Trello rejected the submission');
    const card=await response.json();
    let emailSent=false;
    try{emailSent=await notifyOwner(data,reference,description,card.url);}catch(error){console.error('SMTP notification failed',error);}
    return res.status(200).json({ok:true,reference,emailSent});
  }catch(error){console.error('Brief submission failed',error);return res.status(502).json({error:'Could not save your brief right now'});}
}
