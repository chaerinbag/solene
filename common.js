/* SOLÈNE 공통 스크립트 */
(function(){
  var gnb=document.querySelector('.gnb');
  var top=document.querySelector('.to-top');
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;

  function onScroll(){
    var y=window.pageYOffset||document.documentElement.scrollTop||0;
    // 스크롤을 내리면 헤더가 흰 배경 + 그림자로 바뀜 (서브 페이지는 항상 흰 배경)
    if(gnb&&!gnb.classList.contains('solid')) gnb.classList.toggle('scrolled',y>10);
    // 어느 정도 내려오면 "맨 위로" 버튼 표시
    if(top) top.classList.toggle('show',y>500);
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();

  if(top){
    top.addEventListener('click',function(){
      window.scrollTo({top:0,behavior:reduce?'auto':'smooth'});
      top.blur();
    });
  }

  // 검색창 옆 상품명: 매트릭스부터 시작해 상품 목록 순서대로 계속 바뀜
  var words=['매트릭스','포커스','오발로','레용','에끌라','에지','끌라르떼','르가르','부아','옴브르','퓨리티'];
  var labels=[].slice.call(document.querySelectorAll('.gnb .search span'));
  if(labels.length){
    var wi=0;
    labels.forEach(function(l){l.textContent=words[0]});
    setInterval(function(){
      wi=(wi+1)%words.length;
      labels.forEach(function(l){
        l.classList.add('out');
        setTimeout(function(){
          l.textContent=words[wi];
          l.classList.remove('out'); l.classList.add('pre');
          void l.offsetWidth;
          l.classList.remove('pre');
        },260);
      });
    },2500);
  }
})();

/* 검색 오버레이 : 모든 페이지의 GNB 검색 버튼에 공통 적용 */
(function(){
  var gnb=document.querySelector('.gnb');
  var btn=document.querySelector('.gnb .search');
  if(!gnb||!btn) return;

  var KEY='solene-recent', DEFAULT=['르가르','매트릭스','포커스'];
  var POP=[
    {n:'매트릭스',img:'assets/p-matrix.jpg'},
    {n:'포커스',img:'assets/p-focus.jpg'},
    {n:'오발로',img:'assets/p-ovalo.jpg'},
    {n:'헤일로',img:'assets/product1.jpg'}
  ];
  var X='<svg viewBox="0 0 12 12" aria-hidden="true"><path d="m1.5 1.5 9 9m0-9-9 9"/></svg>';

  function load(){
    try{var v=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(v))return v}catch(e){}
    return DEFAULT.slice();
  }
  function save(a){try{localStorage.setItem(KEY,JSON.stringify(a))}catch(e){}}
  var recent=load();

  var dim=document.createElement('div'); dim.className='sx-dim';
  var box=document.createElement('div'); box.className='sx'; box.id='sx';
  box.setAttribute('role','dialog'); box.setAttribute('aria-label','검색');
  box.innerHTML=
    '<button class="sx-close" type="button" aria-label="검색 닫기"><svg viewBox="0 0 24 24"><path d="m4 4 16 16M20 4 4 20"/></svg></button>'+
    '<div class="sx-in">'+
      '<form class="sx-field" role="search">'+
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.8"/><path d="m15.4 15.4 5 5"/></svg>'+
        '<input type="search" placeholder="매트릭스.." autocomplete="off" aria-label="검색어 입력">'+
      '</form>'+
      '<div class="sx-recent"><div class="sx-h"><span>최근 검색어</span><button type="button" class="sx-clear">전체삭제</button></div><div class="sx-chips"></div></div>'+
      '<div class="sx-h" style="margin-top:62px"><span>인기 검색어</span></div>'+
      '<div class="sx-pop">'+POP.map(function(p){
        return '<a href="product.html?q='+encodeURIComponent(p.n)+'" data-q="'+p.n+'"><i><img src="'+p.img+'" alt=""></i><span>'+p.n+'</span></a>';
      }).join('')+'</div>'+
    '</div>';
  document.body.appendChild(dim); document.body.appendChild(box);

  var input=box.querySelector('input'), chips=box.querySelector('.sx-chips'), recentBox=box.querySelector('.sx-recent');

  function renderRecent(){
    recentBox.style.display=recent.length?'':'none';
    chips.innerHTML='';
    recent.forEach(function(w,i){
      var c=document.createElement('span'); c.className='sx-chip';
      var a=document.createElement('button'); a.type='button'; a.className='w'; a.textContent=w;
      var d=document.createElement('button'); d.type='button'; d.className='x'; d.innerHTML=X; d.setAttribute('aria-label',w+' 삭제');
      a.onclick=function(){go(w)};
      d.onclick=function(){recent.splice(i,1);save(recent);renderRecent()};
      c.appendChild(a); c.appendChild(d); chips.appendChild(c);
    });
  }
  function go(q){
    q=(q||'').trim(); if(!q) return;
    recent=[q].concat(recent.filter(function(x){return x!==q})).slice(0,8); save(recent);
    location.href='product.html?q='+encodeURIComponent(q);
  }

  function open(){
    renderRecent(); input.value='';
    // 스크롤바가 사라지면서 화면이 밀리지 않도록 그 너비만큼 보정
    var de=document.documentElement;
    de.style.setProperty('--sbw',(window.innerWidth-de.clientWidth)+'px');
    de.style.setProperty('--gh',gnb.offsetHeight+'px');
    box.classList.add('open'); dim.classList.add('open'); gnb.classList.add('sx-open');
    document.documentElement.classList.add('sx-lock');
    btn.setAttribute('aria-expanded','true');
    setTimeout(function(){input.focus()},120);
  }
  function close(){
    box.classList.remove('open'); dim.classList.remove('open'); gnb.classList.remove('sx-open');
    document.documentElement.classList.remove('sx-lock');
    btn.setAttribute('aria-expanded','false');
  }
  btn.setAttribute('aria-controls','sx'); btn.setAttribute('aria-expanded','false');
  btn.addEventListener('click',function(e){e.preventDefault();box.classList.contains('open')?close():open()});
  box.querySelector('.sx-close').onclick=close;
  dim.onclick=close;
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&box.classList.contains('open')){close();btn.focus()}});
  box.querySelector('form').addEventListener('submit',function(e){e.preventDefault();go(input.value)});
  box.querySelector('.sx-clear').onclick=function(){recent=[];save(recent);renderRecent()};
  box.querySelector('.sx-pop').addEventListener('click',function(e){
    var a=e.target.closest('a'); if(!a) return;
    e.preventDefault(); go(a.dataset.q);
  });
})();
