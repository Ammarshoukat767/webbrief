import assert from 'node:assert/strict';
import handler from './api/submit.js';

function response() {
  return { code: 0, payload: null, status(code) { this.code = code; return this; }, json(payload) { this.payload = payload; return this; } };
}

let res = response();
await handler({ method: 'GET', body: {} }, res);
assert.equal(res.code, 405);

res = response();
await handler({ method: 'POST', body: {} }, res);
assert.equal(res.code, 400);
assert.match(res.payload.error, /required field/i);

res = response();
await handler({ method: 'POST', body: { company_website_confirm: 'bot' } }, res);
assert.equal(res.code, 200);
assert.equal(res.payload.reference, 'accepted');

process.env.TRELLO_API_KEY='test-key';
process.env.TRELLO_TOKEN='test-token';
process.env.TRELLO_LIST_ID='test-list';
global.fetch=async()=>({ok:true,json:async()=>({url:'https://trello.test/card'})});
res=response();
await handler({method:'POST',body:{contactName:'Ammar',businessName:'Test Co',industry:'Retail',location:'USA',businessSummary:'A test business',projectType:'New website',platform:'WordPress',primaryGoal:'Generate leads',features:'Contact form',contentStatus:'Partially ready',pageCount:'5',designStyle:'Premium & elegant',budget:'250-499',timeline:'2–4 weeks',email:'client@example.com',consent:'on',pages:['Home','Contact']}},res);
assert.equal(res.code,200);
assert.equal(res.payload.ok,true);
assert.equal(res.payload.emailSent,false);

console.log('Brief validation, spam trap, Trello flow, and SMTP fallback: OK');
