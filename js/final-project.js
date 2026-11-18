/* Final project additions: theme, client-side demo authentication, form validation, iNaturalist API. */
(() => {
 'use strict';
 const ACCOUNTS='wildlifeKzDemoAccounts',SESSION='wildlifeKzDemoSession',THEME='wildlifeKzTheme';
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
 const emailOK=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
 const passwordOK=v=>v.length>=8&&/[A-Z]/.test(v)&&/[a-z]/.test(v)&&/\d/.test(v)&&/[^A-Za-z0-9]/.test(v);
 const phoneOK=v=>/^\+?[\d\s()\-]{10,20}$/.test(v)&&v.replace(/\D/g,'').length>=10;
 const setTheme=theme=>{document.documentElement.dataset.theme=theme;localStorage.setItem(THEME,theme)};
 setTheme(localStorage.getItem(THEME)==='dark'?'dark':'light');
 document.querySelectorAll('.theme-toggle').forEach(btn=>btn.addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark')));
 const show=(form,msg,error=true)=>{const el=form.querySelector('.form-message')||document.getElementById('form-message');if(el){el.textContent=msg;el.classList.toggle('error',error);el.classList.toggle('success',!error)}};
 const value=(form,name)=>form.elements.namedItem(name)?.value.trim()||'';
 function register(form,legacy=false){
  const name=legacy?document.getElementById('signup-name')?.value.trim():value(form,'name');
  const email=(legacy?document.getElementById('signup-email')?.value:value(form,'email')).trim().toLowerCase();
  const pass=legacy?document.getElementById('signup-password')?.value:value(form,'password');
  const confirm=legacy?document.getElementById('confirm-password')?.value:value(form,'confirm');
  const phone=legacy?'':value(form,'phone');
  if(!name||name.length<2)return show(form,'Please enter your full name (at least 2 characters).');
  if(!emailOK(email))return show(form,'Please enter a valid email address.');
  if(!passwordOK(pass))return show(form,'Password needs 8+ characters, uppercase, lowercase, number and symbol.');
  if(pass!==confirm)return show(form,'Passwords do not match.');
  if(!legacy&&!phoneOK(phone))return show(form,'Enter a valid phone number (at least 10 digits).');
  const accounts=read(ACCOUNTS,[]);
  if(accounts.some(a=>a.email===email))return show(form,'An account with this email already exists.');
  // Demo-only storage mandated by assignment. Never use a real password here.
  accounts.push({name,email,phone,password:pass});localStorage.setItem(ACCOUNTS,JSON.stringify(accounts));
  localStorage.setItem(SESSION,email);show(form,'Account created! Redirecting to your profile...',false);
  window.location.href='profile.html';
 }
 const signup=document.getElementById('final-signup');if(signup)signup.addEventListener('submit',e=>{e.preventDefault();register(signup)});
 const legacy=document.getElementById('signup-form');if(legacy)legacy.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();register(legacy,true)},true);
 const login=document.getElementById('final-login');if(login)login.addEventListener('submit',e=>{
  e.preventDefault();const email=value(login,'email').toLowerCase(),password=value(login,'password');
  if(!emailOK(email))return show(login,'Enter a valid email address.');
  if(!password)return show(login,'Please enter your password.');
  const user=read(ACCOUNTS,[]).find(a=>a.email===email&&a.password===password);
  if(!user)return show(login,'Email or password is incorrect.');
  localStorage.setItem(SESSION,email);window.location.href='profile.html';
 });
 const profile=document.getElementById('profile-content');if(profile){
  const user=read(ACCOUNTS,[]).find(a=>a.email===localStorage.getItem(SESSION));
  if(!user){profile.textContent='Please log in to view your profile.';document.getElementById('logout-button').hidden=true;}
  else{const h=document.createElement('p');h.textContent=`Name: ${user.name} | Email: ${user.email} | Phone: ${user.phone||'Not provided'}`;profile.append(h)}
  document.getElementById('logout-button').addEventListener('click',()=>{localStorage.removeItem(SESSION);window.location.href='login.html'});
  const saved=read('wildlifeKzSaved',[]);const target=document.getElementById('saved-wildlife');target.textContent=saved.length?saved.join(', '):'No saved observations yet.';
 }
 // Contact forms: intercept legacy handlers and validate in-page, with local-only confirmation.
 for(const id of ['contact-form','popup-form']){
  const form=document.getElementById(id);if(!form)continue;
  form.addEventListener('submit',e=>{
   e.preventDefault();e.stopImmediatePropagation();
   const name=form.querySelector('input[id$="name"]')?.value.trim()||'';
   const email=form.querySelector('input[id$="email"]')?.value.trim()||'';
   const message=form.querySelector('textarea')?.value.trim()||'';
   const target=form.querySelector('[role="status"]')||document.getElementById('contact-form-status');
   const animalText=form.id==='contact-form'?(form.querySelector('#animal')?.value.trim()||''):'';
    const error=name.length<2?'Please enter your name.':!emailOK(email)?'Please enter a valid email address.':form.id==='contact-form'&&animalText.length<5?'Please write about your animal (at least 5 characters).':message.length<5?'Please write a message (at least 5 characters).':'';
   if(target){target.textContent=error||'Your message was validated locally. No message was sent (demo site).';target.style.color=error?'#d73d45':'#238b4d'}
   if(!error)form.reset();
  },true);
 }
 // Dynamic catalogues are implemented in api-catalogues.js.
})();
