// Dynamic API-powered wildlife and parks catalogues.
(() => {
  const $ = id => document.getElementById(id);
  const timeoutFetch = async (url, options = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 16000);
    try {
      const response = await fetch(url, {...options, signal: controller.signal});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally { clearTimeout(timer); }
  };
  const highlight = (text, query) => {
    const fragment = document.createDocumentFragment();
    const value = String(text || '');
    const index = value.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
    if (!query || index < 0) { fragment.append(document.createTextNode(value)); return fragment; }
    fragment.append(document.createTextNode(value.slice(0,index)));
    const mark = document.createElement('mark'); mark.className='a6-highlight';
    mark.textContent=value.slice(index,index+query.length); fragment.append(mark);
    fragment.append(document.createTextNode(value.slice(index+query.length)));
    return fragment;
  };
  const make = (tag, className, content) => {
    const element=document.createElement(tag); if(className)element.className=className;
    if(content !== undefined)element.textContent=content; return element;
  };
  const animalRoot=$('api-results');
  if(animalRoot){
    const status=$('api-status'), search=$('wildlife-search'); let animals=[];
    function render(){
      const q=search.value.trim(); animalRoot.replaceChildren();
      const visible=animals.filter(a=>(a.name+' '+a.scientific).toLocaleLowerCase().includes(q.toLocaleLowerCase()));
      status.textContent=animals.length?`Showing ${visible.length} of ${animals.length} animal species from Kazakhstan.`:'No animals available.';
      for(const a of visible){
        const col=make('div','col-12 col-md-6 col-lg-3'); const card=make('article','card h-100 api-catalogue-card');
        if(a.photo){const img=make('img','card-img-top');img.src=a.photo;img.alt=a.name;img.loading='lazy';img.referrerPolicy='no-referrer';card.append(img)}
        const body=make('div','card-body d-flex flex-column');const title=make('h3','card-title h5');title.append(highlight(a.name,q));body.append(title);
        const scientific=make('p','card-text');scientific.append(highlight(a.scientific,q));body.append(scientific);
        body.append(make('p','small',`${a.count.toLocaleString()} observations in Kazakhstan`));
        const link=make('a','btn btn-success mt-auto','View on iNaturalist');link.href=`https://www.inaturalist.org/taxa/${encodeURIComponent(a.id)}`;link.target='_blank';link.rel='noopener noreferrer';body.append(link);
        const save=make('button','btn btn-outline-success mt-2','Save to profile');save.type='button';save.addEventListener('click',()=>{
          let list=[];try{list=JSON.parse(localStorage.getItem('wildlifeKzSaved')||'[]');if(!Array.isArray(list))list=[]}catch{}
          if(!list.includes(a.name))list.push(a.name);localStorage.setItem('wildlifeKzSaved',JSON.stringify(list));save.textContent='Saved ✓';
        });body.append(save);card.append(body);col.append(card);animalRoot.append(col);
      }
      if(!visible.length&&animals.length)status.textContent='No animals match your search.';
    }
    async function load(){status.textContent='Loading animals from iNaturalist...';animalRoot.replaceChildren();
      try{
        const data=await timeoutFetch('https://api.inaturalist.org/v1/observations/species_counts?place_id=8051&taxon_id=1&per_page=30');
        animals=(data.results||[]).filter(x=>x.taxon?.id&&x.taxon?.name&&x.taxon?.iconic_taxon_name!=='Plantae'&&x.taxon?.name!=='Homo sapiens').map(x=>({id:x.taxon.id,name:x.taxon.preferred_common_name||x.taxon.name,scientific:x.taxon.name,count:x.count||0,photo:x.taxon.default_photo?.medium_url||''}));
        if(!animals.length)throw Error('Empty response');render();
      }catch(error){animals=[];status.textContent='Could not load animals from iNaturalist. Please try Refresh animals. '+(error.name==='AbortError'?'The request timed out.':'');}
    }
    search.addEventListener('input',render);$('refresh-observations').addEventListener('click',load);load();
  }
  const parksRoot=$('parks-api-results');
  if(parksRoot){
    const status=$('parks-api-status'),search=$('park-search');let parks=[];
    // Local photos keep park cards usable even if the public API is slow or offline.
    // Generic landscapes are marked as illustrative, not as photos of a specific park.
    const parkPhotos = [
      [/altyn[ -]?emel/i, 'altyn-emel.jpg'],
      [/charyn|sharyn/i, 'charyn.jpg'],
      [/ile[ -]?alatau|ile alatau|ili[ -]?alatau/i, 'ile-alatau.jpg'],
      [/kolsai|k[oö]lsai|kaindy/i, 'kaindy.jpg'],
      [/burabay|borovoe|burabai/i, 'burabay.jpg'],
      [/aksu[ -]?zhabagly|aqsu[ -]?jabagly/i, 'aksu-zhabagly.jpg']
    ];
    const photoFor = name => {
      const match = parkPhotos.find(([regex]) => regex.test(name));
      return match ? {src:'images/'+match[1], illustrative:false} : {src:'images/kazakhstan-nature.jpg', illustrative:true};
    };
    function render(){
      parksRoot.replaceChildren();const q=search.value.trim();const visible=parks.filter(p=>p.name.toLocaleLowerCase().includes(q.toLocaleLowerCase()));
      status.textContent=`Showing ${visible.length} of ${parks.length} protected areas from OpenStreetMap.`;
      for(const park of visible){
        const col=make('div','col-12 col-lg-6');const article=make('article','park-info h-100 p-3 api-catalogue-card');
        const photo=photoFor(park.name);
        const img=make('img','park-api-photo');img.src=photo.src;
        img.alt=photo.illustrative?'Illustrative Kazakhstan nature landscape':`Landscape of ${park.name}`;
        img.loading='lazy';img.decoding='async';
        img.onerror=()=>{if(!img.src.endsWith('/images/kazakhstan-nature.jpg'))img.src='images/kazakhstan-nature.jpg';};
        article.append(img);
        if(photo.illustrative)article.append(make('p','park-photo-caption','Illustrative landscape photo'));
        const title=make('h3');title.append(highlight(park.name,q));article.append(title);
        article.append(make('p','',park.type));
        if(park.lat!=null&&park.lon!=null){const link=make('a','btn btn-success','View on OpenStreetMap');link.href=`https://www.openstreetmap.org/?mlat=${encodeURIComponent(park.lat)}&mlon=${encodeURIComponent(park.lon)}#map=10/${encodeURIComponent(park.lat)}/${encodeURIComponent(park.lon)}`;link.target='_blank';link.rel='noopener noreferrer';article.append(link)}
        col.append(article);parksRoot.append(col);
      }
      if(!visible.length)status.textContent='No protected areas match your search.';
    }
    // A small verified starter catalogue remains usable when public Overpass servers are busy.
    const starterParks = [
      {name:'Altyn-Emel National Park',type:'National park',lat:44.25,lon:78.75},
      {name:'Charyn National Park',type:'National park',lat:43.35,lon:79.08},
      {name:'Ile-Alatau National Park',type:'National park',lat:43.05,lon:77.10},
      {name:'Kolsai Lakes National Park',type:'National park',lat:42.95,lon:78.40},
      {name:'Burabay National Park',type:'National park',lat:53.08,lon:70.30},
      {name:'Korgalzhyn Nature Reserve',type:'Nature reserve',lat:50.58,lon:69.18},
      {name:'Aksu-Zhabagly Nature Reserve',type:'Nature reserve',lat:42.40,lon:70.50},
      {name:'Katon-Karagay National Park',type:'National park',lat:49.15,lon:85.60}
    ];
    const cacheKey='wildlifeKzParksApiCacheV2';
    const endpoints=['https://overpass.private.coffee/api/interpreter','https://overpass.kumi.systems/api/interpreter','https://overpass-api.de/api/interpreter'];
    const query='[out:json][timeout:12];(nwr["boundary"="national_park"]["name"](40.5,46.4,55.5,87.4);nwr["boundary"="protected_area"]["name"]["protect_class"~"^(1|2)$"](40.5,46.4,55.5,87.4););out center 50;';
    const normalize = data => {
      const seen=new Set();
      return (data.elements||[]).map(x=>({name:x.tags?.['name:en']||x.tags?.name||'',type:x.tags?.boundary==='national_park'?'National park':'Protected nature reserve',lat:x.lat??x.center?.lat,lon:x.lon??x.center?.lon})).filter(x=>{const key=x.name.toLocaleLowerCase();if(!key||seen.has(key))return false;seen.add(key);return true;}).slice(0,24);
    };
    let busy=false;
    async function load(){
      if(busy)return;
      busy=true;
      const button=$('refresh-parks');if(button)button.disabled=true;
      let cached=[];try{cached=JSON.parse(localStorage.getItem(cacheKey)||'[]');if(!Array.isArray(cached))cached=[]}catch{}
      parks=cached.length?cached:starterParks.slice();
      render();
      status.textContent=cached.length?'Showing saved park data while checking OpenStreetMap...':'Showing example Kazakhstan parks while checking OpenStreetMap...';
      const errors=[];
      try{
        for(const endpoint of endpoints){
          try{
            const controller=new AbortController();
            const timer=setTimeout(()=>controller.abort(),8500);
            let response;
            try{response=await fetch(endpoint+'?data='+encodeURIComponent(query),{signal:controller.signal});}finally{clearTimeout(timer)}
            if(!response.ok)throw Error('HTTP '+response.status);
            const data=await response.json();const result=normalize(data);
            if(!result.length)throw Error('No parks returned');
            parks=result;
            try{localStorage.setItem(cacheKey,JSON.stringify(result))}catch{}
            render();return;
          }catch(error){errors.push(error.message||'Network error')}
        }
        render();
        status.textContent=(cached.length?'Live API unavailable. Showing last saved OpenStreetMap results. ':'Live API unavailable. Showing example Kazakhstan parks. ')+'You can still search and open the map links. Click Refresh parks to retry.';
      }finally{busy=false;if(button)button.disabled=false}
    }
    search.addEventListener('input',render);$('refresh-parks').addEventListener('click',load);load();
  }
})();
