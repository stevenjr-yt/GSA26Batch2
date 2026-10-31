const {test,beforeEach,afterEach}=require('node:test');
const assert=require('node:assert/strict');
const sharp=require('sharp');
const handler=require('../api/moments.js');
const originalFetch=global.fetch;
const originalEnv={url:process.env.SUPABASE_URL,secret:process.env.SUPABASE_SECRET_KEY,legacy:process.env.SUPABASE_SERVICE_ROLE_KEY};
beforeEach(()=>{
  process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SECRET_KEY='sb_secret_only_a_test';delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  global.fetch=async()=>{throw new Error('Unexpected network request in test');};
});
afterEach(()=>{
  global.fetch=originalFetch;
  for(const [name,value] of Object.entries({SUPABASE_URL:originalEnv.url,SUPABASE_SECRET_KEY:originalEnv.secret,SUPABASE_SERVICE_ROLE_KEY:originalEnv.legacy})){
    if(value===undefined)delete process.env[name];else process.env[name]=value;
  }
});
async function request(method='GET',body,url='/api/moments',extra={}){
  let status;const headers={};let result;
  const res={set statusCode(v){status=v;},setHeader(k,v){headers[k]=v;},end(v){result=JSON.parse(v);}};
  const req={method,url,headers:{host:'localhost:8000','content-type':'application/json',...extra},body,socket:{remoteAddress:'127.0.0.1'}};
  await handler(req,res);return {status,headers,body:result};
}
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
const image=()=>sharp({create:{width:2400,height:1800,channels:3,background:'#3186ff'}}).jpeg({quality:50}).toBuffer();
test('missing configuration disables uploads without breaking the archive',async()=>{
  delete process.env.SUPABASE_URL;
  assert.equal((await request()).body.available,false);
  assert.equal((await request('POST',{})).status,503);
});
test('method, origin, title, tags and encoded size are validated before storage',async()=>{
  assert.equal((await request('DELETE')).status,405);
  assert.equal((await request('POST',{},undefined,{origin:'https://other.example'})).status,403);
  assert.equal((await request('POST',{title:'',tags:[],image:'AAAA'})).status,422);
  assert.equal((await request('POST',{title:'Photo',tags:Array(9).fill('tag'),image:'AAAA'})).status,422);
  assert.equal((await request('POST',{title:'Photo',tags:[],image:Buffer.alloc(100001).toString('base64')})).status,413);
});
test('invalid or SVG image payloads cannot become public objects',async()=>{
  for(const value of ['not an image','<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"></svg>']){
    const result=await request('POST',{title:'Photo',description:'',tags:[],image:Buffer.from(value).toString('base64')});
    assert.equal(result.status,422);
  }
});
test('valid photos are decoded, resized, compressed and published with private fields omitted',async()=>{
  let params,stored;
  global.fetch=async(url,options)=>{
    assert.equal(options.headers.apikey,'sb_secret_only_a_test');
    assert.equal(options.headers.Authorization,undefined);
    if(url.includes('/rpc/')){params=JSON.parse(options.body);return json(params.p_id);}
    if(url.includes('/storage/')){stored=options.body;return json({Key:'photo'});}
    if(options.method==='PATCH')return json([{id:params.p_id,title:params.p_title,description:params.p_description,tags:params.p_tags,storage_path:params.p_path,image_bytes:params.p_bytes,width:params.p_width,height:params.p_height,created_at:'2026-10-31T03:00:00.123456+00:00',submitter_hash:params.p_submitter_hash}]);
    throw new Error('Unexpected request');
  };
  const result=await request('POST',{title:'  Our moment  ',description:'',tags:['squad','squad'],image:(await image()).toString('base64')});
  assert.equal(result.status,201);assert.equal(result.body.item.title,'Our moment');
  assert.equal(result.body.item.description,'');assert.deepEqual(result.body.item.tags,['squad']);
  assert.ok(stored.length<=100000);const info=await sharp(stored).metadata();
  assert.equal(info.format,'webp');assert.ok(info.width<=1600&&info.height<=1600);
  assert.match(params.p_submitter_hash,/^[a-f0-9]{64}$/);assert.ok(!JSON.stringify(result.body).includes('submitter_hash'));
});
test('daily quota rejects before writing storage',async()=>{
  let writes=0;
  global.fetch=async(url)=>{writes++;assert.ok(url.includes('/rpc/'));return json({message:'MOMENT_RATE_LIMIT'},400);};
  const result=await request('POST',{title:'Photo',tags:[],image:(await image()).toString('base64')});
  assert.equal(result.status,429);assert.equal(writes,1);
});
test('failed storage or publication rolls back only the newly reserved object and row',async()=>{
  for(const phase of ['storage','publish']){
    const calls=[];
    global.fetch=async(url,options)=>{
      calls.push({url,method:options.method});
      if(options.method==='DELETE')return new Response(null,{status:204});
      if(url.includes('/rpc/'))return json('reserved');
      if((phase==='storage'&&url.includes('/storage/'))||options.method==='PATCH')return json({message:'Failed'},500);
      return json({Key:'ok'});
    };
    const result=await request('POST',{title:'Photo',tags:[],image:(await image()).toString('base64')});
    assert.equal(result.status,503);
    assert.equal(calls.filter(c=>c.method==='DELETE').length,2);
    assert.match(calls.find(c=>c.method==='DELETE'&&c.url.includes('/rest/')).url,/id=eq\.[a-f0-9-]{36}$/);
  }
});
test('feed pagination keeps timestamp precision, exposes only published rows, and validates cursors',async()=>{
  let query;
  const row={id:'00000000-0000-0000-0000-000000000001',title:'Moment',tags:[],storage_path:'one.webp',image_bytes:500,created_at:'2026-10-31T03:00:00.123456+00:00'};
  global.fetch=async url=>{query=new URL(url);return json(Array.from({length:41},()=>row));};
  const first=await request();assert.equal(first.body.items.length,40);assert.equal(query.searchParams.get('published'),'eq.true');
  const cursor=first.body.nextCursor;
  assert.equal(JSON.parse(Buffer.from(cursor,'base64url')).time,'2026-10-31T03:00:00.123456Z');
  await request('GET',undefined,'/api/moments?cursor='+cursor);assert.ok(query.searchParams.get('or').includes('.123456Z'));
  assert.equal((await request('GET',undefined,'/api/moments?cursor=invalid')).status,400);
});
