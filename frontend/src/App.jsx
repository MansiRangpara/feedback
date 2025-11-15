import React, {useEffect, useState} from "react";
import axios from "axios";
import ErrorBoundary from "./ErrorBoundary";

const API = import.meta.env.VITE_API || "http://localhost:5000/api";

function GlowCard({children, style}) {
  return <div className="glass-card" style={style}>{children}</div>;
}

function Star({filled}) {
  return <span className="star">{filled ? "★" : "☆"}</span>;
}

export default function App(){
  const [form,setForm] = useState({name:"",email:"",message:"",rating:5});
  const [feedbacks,setFeedbacks] = useState([]); // start as array
  const [stats,setStats] = useState({});
  const [loading,setLoading] = useState(false);
  const [err,setErr] = useState(null);

  const load = async () => {
    try{
      setLoading(true);
      const fb = await axios.get(`${API}/feedback`);
      // ensure array
      setFeedbacks(Array.isArray(fb.data) ? fb.data : []);
      const st = await axios.get(`${API}/stats`);
      setStats(st.data || {});
      setErr(null);
    }catch(e){
      console.error(e);
      setErr(e.response?.data?.error || e.message || "Fetch error");
      setFeedbacks([]);
      setStats({});
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); },[]);

  const submit = async () => {
    if(!form.name.trim() || !form.message.trim()){
      alert("Name and message are required.");
      return;
    }
    try{
      setLoading(true);
      await axios.post(`${API}/feedback`,{...form, rating: Number(form.rating)});
      setForm({name:"",email:"",message:"",rating:5});
      await load();
    }catch(e){
      console.error(e);
      alert("Failed to submit: " + (e.response?.data?.error || e.message));
    }finally{
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
    <div className="app">
      <header className="topbar">
        <h1>🌙 Feedback Dashboard</h1>
        <div className="sub">Dark mode • Glassmorphism • Glow ✨</div>
      </header>

      <main className="layout">
        <aside className="left">
          <GlowCard>
            <h2>📝 Add Feedback</h2>
            <label>Name</label>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" />
            <label>Email</label>
            <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" />
            <label>Message</label>
            <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows="4" placeholder="Type something nice..."></textarea>
            <label>Rating</label>
            <div className="rating-row">
              {[1,2,3,4,5].map(n=>(
                <button key={n} className={"star-btn "+(n<=form.rating?"active":"")} onClick={()=>setForm({...form, rating:n})} aria-label={"Rate "+n}>
                  <Star filled={n<=form.rating} />
                </button>
              ))}
            </div>

            <button className="cta" onClick={submit} disabled={loading}>
              {loading ? "Sending..." : "Send Feedback ✨"}
            </button>
            <button className="ghost" onClick={()=>{ setForm({name:"",email:"",message:"",rating:5}) }}>
              Clear
            </button>
          </GlowCard>

          <GlowCard style={{marginTop:16}}>
            <h3>Quick Actions</h3>
            <div className="actions">
              <button onClick={load} className="mini">🔄 Refresh</button>
              <button onClick={()=>{ navigator.clipboard?.writeText(window.location.href) }} className="mini">🔗 Copy URL</button>
            </div>
          </GlowCard>
        </aside>

        <section className="right">
          <div className="cards-row">
            <GlowCard style={{flex:1}}>
              <div className="stat-title">⭐ Average</div>
              <div className="stat-value">{stats.avg ? Number(stats.avg).toFixed(1) : "-"}</div>
            </GlowCard>
            <GlowCard style={{flex:1}}>
              <div className="stat-title">📥 Total</div>
              <div className="stat-value">{stats.total ?? "-"}</div>
            </GlowCard>
            <GlowCard style={{flex:1}}>
              <div className="stat-title">😊 Positive</div>
              <div className="stat-value">{stats.positive ?? "-"}</div>
            </GlowCard>
            <GlowCard style={{flex:1}}>
              <div className="stat-title">☹ Negative</div>
              <div className="stat-value">{stats.negative ?? "-"}</div>
            </GlowCard>
          </div>

          <GlowCard style={{marginTop:16}}>
            <div className="table-header">
              <h2>📋 All Feedback</h2>
              <div className="small">Showing {feedbacks.length} items</div>
            </div>

            {err && <div className="error">Error: {String(err)}</div>}

            {loading && <div className="loading">Loading…</div>}

            <div className="feed-list">
              {feedbacks.length===0 && !loading ? (
                <div className="empty">No feedback yet — be the first ✨</div>
              ) : feedbacks.map(f=>(
                <div className="feed-item" key={f._id}>
                  <div className="leftmeta">
                    <div className="avatar">{(f.name||"U").charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="name">{f.name}</div>
                      <div className="email">{f.email}</div>
                    </div>
                  </div>
                  <div className="msg">{f.message}</div>
                  <div className="rating">{Array.from({length:5}).map((_,i)=><span key={i} className={"mini-star "+(i<f.rating?"on":"")}>★</span>)}</div>
                </div>
              ))}
            </div>
          </GlowCard>
        </section>
      </main>

      <footer className="footer">Made with ❤️ — Dark mode edition</footer>
    </div>
    </ErrorBoundary>
  );
}
