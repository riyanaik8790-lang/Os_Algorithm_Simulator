const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

function fcfs(p){
  p.sort((a,b)=> a.at - b.at || a.pid - b.pid);

  let t = 0, c = [];

  p.forEach(x=>{
    let s = Math.max(t, x.at);

    if (s > t) {
      c.push({ pid: "IDLE", s: t, e: s });
    }

    c.push({ pid: x.pid, s: s, e: s + x.bt });
    t = s + x.bt;
  });

  return c;
}

app.post('/fcfs', (req, res) => {
  const result = fcfs(req.body);
  res.json(result);
});

app.listen(3000, () => console.log("Server running on port 3000"));

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

/* ================= ALGORITHMS ================= */

// FCFS
function fcfs(p){
  p.sort((a,b)=> a.at - b.at || a.pid - b.pid);
  let t = 0, c = [];

  p.forEach(x=>{
    let s = Math.max(t, x.at);

    if (s > t) c.push({ pid:"IDLE", s:t, e:s });

    c.push({ pid:x.pid, s:s, e:s+x.bt });
    t = s + x.bt;
  });

  return c;
}

// SJF
function sjf(p){
  let t=0,c=[],r=[...p];

  while(r.length){
    let a=r.filter(x=>x.at<=t);

    if(!a.length){
      let idle=t;
      t++;
      while(r.filter(x=>x.at<=t).length===0) t++;
      c.push({pid:"IDLE",s:idle,e:t});
      continue;
    }

    a.sort((a,b)=> a.bt-b.bt || a.at-b.at || a.pid-b.pid);

    let x=a[0];
    c.push({pid:x.pid,s:t,e:t+x.bt});
    t+=x.bt;
    r.splice(r.indexOf(x),1);
  }
  return c;
}

// SRTN
function srtn(p){
  let t=0,c=[],r=p.map(x=>({...x,rt:x.bt}));

  while(r.some(x=>x.rt>0)){
    let a=r.filter(x=>x.at<=t && x.rt>0);

    if(!a.length){
      c.push({pid:"IDLE",s:t,e:++t});
      continue;
    }

    a.sort((a,b)=> a.rt-b.rt || a.at-b.at || a.pid-b.pid);

    let x=a[0];

    if(!c.length || c[c.length-1].pid!==x.pid)
      c.push({pid:x.pid,s:t,e:t+1});
    else
      c[c.length-1].e++;

    x.rt--;
    t++;
  }
  return c;
}

// Round Robin
function rr(p, q){
  let time=0, gantt=[], queue=[];
  let r=p.map(x=>({...x,rt:x.bt}));

  while(r.some(x=>x.rt>0)){
    r.forEach(x=>{
      if(x.at<=time && x.rt>0 && !queue.includes(x)) queue.push(x);
    });

    if(!queue.length){
      gantt.push({pid:"IDLE",s:time,e:++time});
      continue;
    }

    let cur=queue.shift();
    let exec=Math.min(q, cur.rt);
    let start=time;

    time+=exec;
    cur.rt-=exec;

    gantt.push({pid:cur.pid,s:start,e:time});

    r.forEach(x=>{
      if(x.at>start && x.at<=time && x.rt>0 && !queue.includes(x))
        queue.push(x);
    });

    if(cur.rt>0) queue.push(cur);
  }

  return gantt;
}

/* ================= API ================= */

app.post('/schedule', (req, res) => {
  const { algorithm, processes, quantum } = req.body;

  let result;

  switch(algorithm){
    case "FCFS": result = fcfs(processes); break;
    case "SJF": result = sjf(processes); break;
    case "SRTN": result = srtn(processes); break;
    case "RR": result = rr(processes, quantum); break;
    default:
      return res.status(400).json({ error: "Invalid algorithm" });
  }

  res.json(result);
});

app.listen(3000, () => console.log("Server running on port 3000"));