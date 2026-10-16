import { renderPostCard, escapeHtml } from '../lib/post-card';
import type { CatalogPage, CatalogOptions } from '../lib/public-posts';

const initialElement = document.getElementById('catalog-initial');
if (initialElement) initCatalog();

function initCatalog() {
    const initial = JSON.parse(initialElement!.textContent || '{}');
    let page: CatalogPage = initial.page;
    let options: CatalogOptions = initial.options;
    const list = document.getElementById('post-list')!;
    const input = document.getElementById('post-search') as HTMLInputElement;
    const sort = document.getElementById('post-sort') as HTMLSelectElement;
    const selectedTag = document.getElementById('selected-tag') as HTMLInputElement;
    const more = document.getElementById('load-more') as HTMLAnchorElement;
    const status = document.getElementById('load-status')!;
    const error = document.getElementById('catalog-error')!;
    const tags = document.getElementById('tag-list')!;
    const empty = document.getElementById('catalog-empty')!;
    let pending: AbortController | null = null;
    let debounce: ReturnType<typeof setTimeout>;
    let failed = Boolean(initial.error);
    let generation = 0;
    let typing = false;
    const storageKey = 'erpanomer:blog:v1';
    const queryUrl = () => {
        const params = new URLSearchParams();
        if (options.q) params.set('q', options.q);
        if (options.tag) params.set('tag', options.tag);
        if (options.sort !== 'latest') params.set('sort', options.sort);
        return `/blog${params.size ? `?${params}` : ''}`;
    };
    const save = () => {
        try { sessionStorage.setItem(storageKey,JSON.stringify({ url:location.pathname+location.search, page, options, scroll:scrollY, savedAt:Date.now() })); } catch { /* Storage can be disabled or full. */ }
    };
    const update = (render = true) => {
        if (render) list.innerHTML = page.items.map(post => renderPostCard(post)).join('');
        const params = new URLSearchParams({ q:options.q,tag:options.tag,sort:options.sort });
        if (page.nextCursor) params.set('cursor',page.nextCursor);
        more.href = `/blog?${params}`;
        more.hidden = !page.hasMore;
        more.textContent = failed ? '重试加载' : '加载更多文章';
        more.removeAttribute('aria-disabled');
        empty.hidden = page.items.length>0 || failed;
        document.getElementById('catalog-notice')!.hidden = page.source!=='static';
        document.getElementById('reset-filters')!.hidden = !options.q&&!options.tag&&options.sort==='latest';
        input.value = options.q; sort.value=options.sort; selectedTag.value=options.tag;
        if (page.meta) {
            document.getElementById('expand-tags')!.hidden = page.meta.tags.length<=12;
            document.getElementById('result-count')!.textContent = `${options.tag ? `${options.tag} · ` : ''}${page.meta.matchingTotal} 篇文章`;
            for (const key of ['total','views','likes','tagCount'] as const) {
                const value = page.meta[key];
                document.querySelector(`[data-stat="${key}"]`)!.textContent = value===null ? '—' : value.toLocaleString('zh-CN');
            }
            tags.innerHTML = `<a href="/blog" class="catalog-tag${!options.tag?' active':''}" data-tag="">全部文章 <span>${page.meta.total}</span></a>` + page.meta.tags.map((tag,index)=>`<a href="/blog?tag=${encodeURIComponent(tag.name)}" class="catalog-tag${index>=12?' extra-tag':''}${options.tag===tag.name?' active':''}" data-tag="${escapeHtml(tag.name)}"${options.tag===tag.name?' aria-current="true"':''}>${escapeHtml(tag.name)}<span>${tag.count}</span></a>`).join('');
        }
        status.textContent = !page.hasMore&&page.items.length ? '已经读到这里的全部文章了。' : '';
    };
    const showError = (message: string) => {
        failed=true;
        error.textContent=message;
        const retry=document.createElement('button'); retry.type='button'; retry.className='text-action'; retry.textContent='重试';
        retry.addEventListener('click',()=>{void load(page.items.length===0);});
        const restart=document.createElement('a'); restart.href=queryUrl(); restart.textContent='重新加载列表';
        error.append(' ',retry,' · ',restart); error.hidden=false;
    };
    async function load(reset: boolean) {
        if (pending || (!reset&&!page.hasMore)) return;
        const requestGeneration=generation;
        const controller=new AbortController(); pending=controller;
        list.setAttribute('aria-busy','true'); more.setAttribute('aria-disabled','true');
        status.textContent=reset?'正在查找文章…':'正在加载更多文章…'; error.hidden=true;
        const params=new URLSearchParams({q:options.q,tag:options.tag,sort:options.sort,includeMeta:reset?'1':'0'});
        if (!reset&&page.nextCursor) params.set('cursor',page.nextCursor);
        try {
            const response=await fetch(`/api/blog/posts?${params}`,{signal:controller.signal});
            const result=await response.json();
            if (!response.ok) throw new Error(result.message||'文章暂时加载失败，请稍后重试。');
            if (requestGeneration!==generation) return;
            const incoming=result as CatalogPage;
            const slugs=new Set(reset?[]:page.items.map(post=>post.slug));
            const additions=incoming.items.filter(post=>!slugs.has(post.slug));
            page={...incoming,meta:incoming.meta||page.meta,items:reset?incoming.items:[...page.items,...additions]};
            failed=false;
            if (reset) list.innerHTML=page.items.map(post=>renderPostCard(post)).join('');
            else list.insertAdjacentHTML('beforeend',additions.map(post=>renderPostCard(post)).join(''));
            update(false); save();
        } catch (err) {
            if (controller.signal.aborted||requestGeneration!==generation) return;
            showError(err instanceof TypeError || err instanceof SyntaxError ? '网络连接暂时不可用，请重试。' : err instanceof Error?err.message:'加载失败，请重试。');
            more.textContent='重试加载'; status.textContent='';
        } finally {
            if (pending===controller) {
                pending=null; list.setAttribute('aria-busy','false'); more.removeAttribute('aria-disabled');
            }
        }
    }
    function changeFilters(push=true) {
        clearTimeout(debounce); typing=false; pending?.abort(); pending=null; generation++;
        options={q:input.value.trim(),tag:selectedTag.value,sort:sort.value as CatalogOptions['sort'],includeMeta:true};
        page={items:[],nextCursor:null,hasMore:false,source:page.source};
        failed=false; error.hidden=true; empty.hidden=true; more.hidden=true; list.innerHTML='';
        document.getElementById('result-count')!.textContent='正在查找文章…';
        if (push) history.pushState(null,'',queryUrl());
        void load(true);
    }
    document.getElementById('catalog-form')!.addEventListener('submit',event=>{event.preventDefault();changeFilters();});
    input.addEventListener('input',()=>{clearTimeout(debounce);typing=true;pending?.abort();pending=null;generation++;debounce=setTimeout(()=>changeFilters(),300);});
    sort.addEventListener('change',()=>changeFilters());
    const tagClick=(event:MouseEvent)=>{
        const anchor=(event.target as Element).closest<HTMLAnchorElement>('a');
        if (!anchor||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0) return;
        const url=new URL(anchor.href);
        if (url.origin!==location.origin||url.pathname.replace(/\/$/,'')!=='/blog') return;
        if (anchor.id!=='reset-filters'&&!anchor.hasAttribute('data-tag')&&!anchor.closest('.post-tags')&&!anchor.closest('.catalog-empty')) return;
        event.preventDefault(); selectedTag.value=url.searchParams.get('tag')||'';
        if (anchor.id==='reset-filters'||anchor.closest('.catalog-empty')) { input.value='';sort.value='latest'; }
        changeFilters();
    };
    document.getElementById('blog-app')!.addEventListener('click',tagClick);
    document.getElementById('expand-tags')?.addEventListener('click',event=>{
        const button=event.currentTarget as HTMLButtonElement;
        const open=button.getAttribute('aria-expanded')!=='true';
        button.setAttribute('aria-expanded',String(open)); tags.classList.toggle('expanded',open);
        button.textContent=open?'收起标签':'展开全部标签';
    });
    more.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();void load(false);});
    window.addEventListener('popstate',()=>{
        const params=new URLSearchParams(location.search);
        if (params.has('cursor')) { location.reload();return; }
        input.value=params.get('q')||''; selectedTag.value=params.get('tag')||''; sort.value=params.get('sort')||'latest'; changeFilters(false);
    });
    const navigation=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined;
    if (!initial.error&&navigation?.type==='back_forward') {
        try {
            const cached=JSON.parse(sessionStorage.getItem(storageKey)||'null');
            if (cached&&cached.url===location.pathname+location.search&&Date.now()-cached.savedAt<600_000) {
                page=cached.page;options=cached.options;update();
                requestAnimationFrame(()=>window.scrollTo(0,cached.scroll));
            }
        } catch { /* Use the server-rendered page if restoration fails. */ }
    }
    window.addEventListener('pagehide',save);
    document.addEventListener('click',event=>{if((event.target as Element).closest('.post-title,.post-cover'))save();},true);
    document.documentElement.classList.add('catalog-enhanced');
    if ('IntersectionObserver' in window) {
        const observer=new IntersectionObserver(entries=>{
            if(entries.some(entry=>entry.isIntersecting)&&!failed&&!pending&&!typing&&page.hasMore) void load(false);
        },{rootMargin:'300px'});
        observer.observe(document.getElementById('load-sentinel')!);
    }
}
