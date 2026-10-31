const products=[
 {id:1,name:'Rosalie Bloom Dress',cat:'Dresses',price:118,badge:'BESTSELLER',pos:'39%',colors:['#eab5c2','#fff0e6']},
 {id:2,name:'Elara Linen Suit',cat:'Tailoring',price:164,badge:'NEW',pos:'10%',colors:['#e8ddc8','#222']},
 {id:3,name:'Sage Muse Set',cat:'Sets',price:132,badge:'LOW STOCK',pos:'68%',colors:['#aab79a','#e5d1bd']},
 {id:4,name:'Nocturne Slip Dress',cat:'Evening',price:146,badge:'EXCLUSIVE',pos:'91%',colors:['#f2e8dd','#741137']},
 {id:5,name:'Petal Day Dress',cat:'Dresses',price:104,badge:'NEW',pos:'42%',colors:['#e9a5b9','#db705e']},
 {id:6,name:'Avery Wide-Leg Suit',cat:'Tailoring',price:178,badge:'EDITOR\'S PICK',pos:'8%',colors:['#eee4d2','#8c8b84']},
 {id:7,name:'Softline Co-ord',cat:'Sets',price:128,badge:'',pos:'70%',colors:['#91a57f','#d6a291']},
 {id:8,name:'Ivory After Dark',cat:'Evening',price:152,badge:'LIMITED',pos:'92%',colors:['#eee7dc','#1d1a1a']}
];
const storage={
 get(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}},
 set(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{/* Storage can be blocked on mobile privacy modes. */}}
};
let cart=storage.get('lumora-cart',[]),wish=new Set(storage.get('lumora-wish',[])),active='All',visibleLimit=4,promo=0;
let activeProduct=null,modalQuantity=1;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function money(n){return `$${n.toFixed(2)}`}
function renderProducts(query=''){
 const list=products.filter(p=>(active==='All'||p.cat===active)&&(`${p.name} ${p.cat}`.toLowerCase().includes(query.toLowerCase()))).slice(0,visibleLimit);
 $('#productGrid').innerHTML=list.length?list.map((p,i)=>`<article class="product reveal visible" data-product="${p.id}" role="button" tabindex="0" aria-label="View ${p.name}" style="transition-delay:${i*.06}s"><div class="product-media"><img src="assets/lumora-campaign.png" style="object-position:${p.pos}" alt="${p.name}" loading="lazy">${p.badge?`<span class="badge">${p.badge}</span>`:''}<button class="heart ${wish.has(p.id)?'active':''}" data-wish="${p.id}" aria-label="Add ${p.name} to wishlist">${wish.has(p.id)?'♥':'♡'}</button><button class="quick-add" data-add="${p.id}">QUICK ADD TO BAG +</button></div><div class="product-info"><h3>${p.name}</h3><p><span>${p.cat}</span><strong>${money(p.price)}</strong></p><div class="swatches">${p.colors.map(c=>`<i style="background:${c}"></i>`).join('')}</div></div></article>`).join(''):'<p>No pieces matched your search.</p>';
 bindProductButtons();
}
function bindProductButtons(){
 $$('[data-add]').forEach(b=>b.onclick=()=>addToCart(+b.dataset.add));
 $$('[data-wish]').forEach(b=>b.onclick=()=>toggleWish(+b.dataset.wish));
 $$('.product').forEach(card=>{card.onclick=e=>{if(e.target.closest('[data-wish],[data-add]'))return;openProduct(+card.dataset.product)};card.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('button')){e.preventDefault();openProduct(+card.dataset.product)}}});
}
function addToCart(id,quantity=1){const found=cart.find(x=>x.id===id);found?found.qty+=quantity:cart.push({id,qty:quantity});persist();renderCart();toast('Added to your bag');openCart()}
function toggleWish(id){wish.has(id)?wish.delete(id):wish.add(id);storage.set('lumora-wish',[...wish]);$('#wishCount').textContent=wish.size;renderProducts();toast(wish.has(id)?'Saved to your wishlist':'Removed from wishlist')}
function persist(){storage.set('lumora-cart',cart);updateCounts()}
function updateCounts(){const n=cart.reduce((a,b)=>a+b.qty,0);$('#cartCount').textContent=n;$('#drawerCount').textContent=`(${n})`;$('#wishCount').textContent=wish.size}
function renderCart(){
 if(!cart.length)$('#cartItems').innerHTML='<div class="empty"><h3>Your bag is feeling light.</h3><p>Discover something made for you.</p></div>';
 else $('#cartItems').innerHTML=cart.map(x=>{const p=products.find(v=>v.id===x.id);return `<div class="cart-item"><img class="cart-thumb" src="assets/lumora-campaign.png" style="object-position:${p.pos}" alt="${p.name}"><div><h4>${p.name}</h4><p>${p.cat} · ${money(p.price)}</p><div class="qty"><button data-qty="${p.id}" data-delta="-1">−</button><span>${x.qty}</span><button data-qty="${p.id}" data-delta="1">+</button></div></div><button class="remove" data-remove="${p.id}">×</button></div>`}).join('');
 const total=cart.reduce((a,x)=>a+products.find(p=>p.id===x.id).price*x.qty,0)*(1-promo);$('#subtotal').textContent=money(total);updateCounts();
 $$('[data-qty]').forEach(b=>b.onclick=()=>changeQty(+b.dataset.qty,+b.dataset.delta));$$('[data-remove]').forEach(b=>b.onclick=()=>{cart=cart.filter(x=>x.id!==+b.dataset.remove);persist();renderCart()});
}
function changeQty(id,d){const x=cart.find(v=>v.id===id);x.qty+=d;if(x.qty<1)cart=cart.filter(v=>v.id!==id);persist();renderCart()}
function syncPageLock(){document.body.classList.toggle('ui-open',$('#cartDrawer').classList.contains('open')||$('#searchOverlay').classList.contains('open')||$('#checkoutModal').classList.contains('open')||$('#productModal').classList.contains('open')||$('.desktop-nav').classList.contains('mobile'))}
function openProduct(id){const p=products.find(item=>item.id===id);if(!p)return;activeProduct=p;modalQuantity=1;$('#productModalImage').style.objectPosition=p.pos;$('#productModalImage').alt=p.name;$('#productModalCategory').textContent=p.cat.toUpperCase();$('#productModalTitle').textContent=p.name;$('#productModalPrice').textContent=money(p.price);$('#modalAddPrice').textContent=money(p.price);$('#modalQty').textContent='1';$('#productModalDescription').textContent=`A considered ${p.cat.toLowerCase()} piece with a fluid silhouette, refined finishing and an easy, modern fit. Designed to move beautifully from day to evening.`;$('#productModalColors').innerHTML=p.colors.map((color,i)=>`<button class="${i===0?'active':''}" data-modal-color="${i}" style="--swatch:${color}" aria-label="Select color ${i+1}"></button>`).join('');$('#selectedColor').textContent=['Blush','Ivory','Sage','Noir'][p.id%4];$$('[data-modal-color]').forEach((button,i)=>button.onclick=()=>{$$('[data-modal-color]').forEach(x=>x.classList.remove('active'));button.classList.add('active');$('#selectedColor').textContent=['Blush','Ivory','Sage','Noir'][i]||`Color ${i+1}`});$('#productModal').classList.add('open');$('#productModal').setAttribute('aria-hidden','false');$('#backdrop').classList.add('show');syncPageLock();setTimeout(()=>$('.product-modal-close').focus(),250)}
function closeProduct(){$('#productModal').classList.remove('open');$('#productModal').setAttribute('aria-hidden','true');if(!$('#cartDrawer').classList.contains('open')&&!$('#checkoutModal').classList.contains('open'))$('#backdrop').classList.remove('show');syncPageLock()}
function openCart(){closeSearch();$('#cartDrawer').classList.add('open');$('#cartDrawer').setAttribute('aria-hidden','false');$('#backdrop').classList.add('show');syncPageLock()}
function closeCart(){$('#cartDrawer').classList.remove('open');$('#cartDrawer').setAttribute('aria-hidden','true');if(!$('#checkoutModal').classList.contains('open'))$('#backdrop').classList.remove('show');syncPageLock()}
function openSearch(){closeCart();$('#searchOverlay').classList.add('open');$('#searchOverlay').setAttribute('aria-hidden','false');syncPageLock();setTimeout(()=>$('#searchInput').focus(),300)}
function closeSearch(){$('#searchOverlay').classList.remove('open');$('#searchOverlay').setAttribute('aria-hidden','true');syncPageLock()}
let toastTimer;function toast(msg){clearTimeout(toastTimer);$('#toast').textContent=msg;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2200)}
$$('.filter').forEach(b=>b.onclick=()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');active=b.dataset.filter;visibleLimit=4;renderProducts()});
$$('.link-filter').forEach(b=>b.onclick=()=>{active=b.dataset.category;$$('.filter').forEach(x=>x.classList.toggle('active',x.dataset.filter===active));renderProducts();$('#shop').scrollIntoView()});
$('#viewAll').onclick=()=>{visibleLimit=8;renderProducts();$('#viewAll').textContent='All pieces showing'};
$('#cartBtn').onclick=openCart;$('#wishBtn').onclick=()=>{active='All';visibleLimit=8;renderProducts();$('#shop').scrollIntoView();toast(`${wish.size} saved piece${wish.size===1?'':'s'}`)};$('#searchBtn').onclick=openSearch;$('#backdrop').onclick=()=>{closeProduct();closeCart();$('#checkoutModal').classList.remove('open');syncPageLock()};
$$('[data-close]').forEach(b=>b.onclick=()=>{if(b.dataset.close==='cart')closeCart();if(b.dataset.close==='search')closeSearch();if(b.dataset.close==='product')closeProduct();if(b.dataset.close==='checkout'){$('#checkoutModal').classList.remove('open');$('#backdrop').classList.remove('show');syncPageLock()}});
$$('#productSizes button').forEach(button=>button.onclick=()=>{$$('#productSizes button').forEach(x=>x.classList.remove('active'));button.classList.add('active')});
$('#modalQtyMinus').onclick=()=>{modalQuantity=Math.max(1,modalQuantity-1);$('#modalQty').textContent=modalQuantity;$('#modalAddPrice').textContent=money(activeProduct.price*modalQuantity)};
$('#modalQtyPlus').onclick=()=>{modalQuantity=Math.min(9,modalQuantity+1);$('#modalQty').textContent=modalQuantity;$('#modalAddPrice').textContent=money(activeProduct.price*modalQuantity)};
$('#modalAddBtn').onclick=()=>{if(!activeProduct)return;const id=activeProduct.id,quantity=modalQuantity;closeProduct();addToCart(id,quantity)};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeProduct();closeSearch();closeCart()}});
$('#searchGo').onclick=()=>{const q=$('#searchInput').value;closeSearch();active='All';visibleLimit=8;renderProducts(q);$('#shop').scrollIntoView();$('#searchHint').textContent=q?`Results for “${q}”`:'Try “dress” or “sage”'};$('#searchInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('#searchGo').click()});
$('#promoBtn').onclick=()=>{if($('#promoInput').value.trim().toUpperCase()==='LUMORA10'){promo=.1;renderCart();toast('10% has been applied')}else toast('Try code LUMORA10')};
$('#checkoutBtn').onclick=()=>{if(!cart.length)return toast('Your bag is empty');closeCart();$('#checkoutModal').classList.add('open');$('#backdrop').classList.add('show')};
$('#newsletterForm').onsubmit=e=>{e.preventDefault();const val=$('#email').value;$('#newsletterForm').innerHTML=`<p><strong>Welcome to the inner circle.</strong><br>We’ll send the next edit to ${val}.</p>`;toast('You’re on the list')};
$('#storyBtn').onclick=()=>$('#story').scrollIntoView();
$('#menuBtn').onclick=()=>{$('#menuBtn').classList.toggle('open');$('.desktop-nav').classList.toggle('mobile');$('#menuBtn').setAttribute('aria-expanded',$('#menuBtn').classList.contains('open'));syncPageLock()};$$('.desktop-nav a').forEach(a=>a.onclick=()=>{$('#menuBtn').classList.remove('open');$('.desktop-nav').classList.remove('mobile');$('#menuBtn').setAttribute('aria-expanded','false');syncPageLock()});
window.addEventListener('scroll',()=>$('.nav-wrap').classList.toggle('scrolled',scrollY>20));
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.08});$$('.reveal').forEach(el=>observer.observe(el))}else{$$('.reveal').forEach(el=>el.classList.add('visible'))}
window.addEventListener('resize',()=>{if(innerWidth>900){$('#menuBtn').classList.remove('open');$('.desktop-nav').classList.remove('mobile');syncPageLock()}});
renderProducts();renderCart();updateCounts();
