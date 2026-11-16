"""Renders the app icon, splash, Play Store feature graphic and phone screenshots from the game's own art.
Run:  python3 store/make_assets.py   (needs playwright + Chrome)"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WWW = 'file://' + os.path.join(ROOT, 'www')
ASSETS = os.path.join(ROOT, 'assets'); STORE = os.path.join(ROOT, 'store')
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')

PAGE = '''<!doctype html><meta charset=utf-8><link rel=stylesheet href="%s/css/fonts.css">
<style>html,body{margin:0;background:transparent}img{image-rendering:pixelated}
.card{position:absolute;background:#34364b;box-shadow:0 0 0 8px #f0883a,inset 0 0 0 6px #2a2b3f,inset 0 0 0 12px #3b3d54}
</style><body><div id=s></div><script src="%s/js/sprites.js"></script><script>window.S=window.SPR</script>'''

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=['--no-sandbox', '--allow-file-access-from-files'])
        async def draw(w, h, body, out, transparent=False):
            pg = await b.new_page(viewport={'width': w, 'height': h})
            tmp = os.path.join(ROOT, '.tmp_page.html')
            open(tmp, 'w').write(PAGE % (WWW, WWW) + '<script>' + body + '</script>')
            await pg.goto('file://' + tmp)
            await pg.wait_for_timeout(500)
            await pg.screenshot(path=out, omit_background=transparent)
            await pg.close()
        sp = "function put(n,x,y,s){var i=new Image();i.src=SPR[n];i.style.cssText='position:absolute;left:'+x+'px;top:'+y+'px;width:'+s+'px;height:'+s+'px';document.body.appendChild(i);}"
        # icon: knight on a dark card with the hero's orange frame
        await draw(1024, 1024, sp + "document.body.style.background='#25263a';var c=document.createElement('div');c.className='card';c.style.cssText='left:96px;top:96px;width:832px;height:832px';document.body.appendChild(c);put('knight',212,190,600);", os.path.join(ASSETS, 'icon-only.png'))
        # adaptive icon layers (the foreground keeps the art inside the safe zone)
        await draw(1024, 1024, sp + "put('knight',292,262,440);", os.path.join(ASSETS, 'icon-foreground.png'), True)
        await draw(1024, 1024, "document.body.style.background='#34364b'", os.path.join(ASSETS, 'icon-background.png'))
        # splash
        await draw(2732, 2732, sp + "document.body.style.background='#181425';put('knight',1066,900,600);var t=document.createElement('div');t.textContent='CRYPT CARDS';t.style.cssText=\"position:absolute;left:0;right:0;top:1640px;text-align:center;font:72px 'Press Start 2P';color:#fee761\";document.body.appendChild(t);", os.path.join(ASSETS, 'splash.png'))
        await draw(2732, 2732, sp + "document.body.style.background='#0c0a14';put('knight',1066,900,600);var t=document.createElement('div');t.textContent='CRYPT CARDS';t.style.cssText=\"position:absolute;left:0;right:0;top:1640px;text-align:center;font:72px 'Press Start 2P';color:#fee761\";document.body.appendChild(t);", os.path.join(ASSETS, 'splash-dark.png'))
        # feature graphic 1024x500
        row = ['skeleton','chest','knight','sword','ghost']
        fg = sp + "document.documentElement.style.background='linear-gradient(#25263a,#181425)';document.documentElement.style.height='100%';var names=__NAMES__;names.forEach(function(n,i){put(n,60+i*190,300-(i==2?20:0),(i==2?170:140));});var t=document.createElement('div');t.textContent='CRYPT CARDS';t.style.cssText=\"position:absolute;left:0;right:0;top:90px;text-align:center;font:62px 'Press Start 2P';color:#fee761;text-shadow:6px 6px 0 #a22633\";document.body.appendChild(t);var u=document.createElement('div');u.textContent='Swipe. Slay. Score.';u.style.cssText=\"position:absolute;left:0;right:0;top:210px;text-align:center;font:26px 'Press Start 2P';color:#c0cbdc\";document.body.appendChild(u);".replace("__NAMES__", json.dumps(row))
        await draw(1024, 500, fg, os.path.join(STORE, 'feature-graphic-1024x500.png'))
        # screenshots from the real game, 1080x1920
        L = [{"name": "Cellar", "w": 4, "h": 4, "heroHP": 30, "shieldP": 0.3, "weights": {"firearrow": 3, "icearrow": 3, "webspider": 3, "gemblade": 3, "ninjastar": 2, "elecbow": 2, "goblin": 6, "troll": 3, "skeleton": 3, "potion": 3, "trap": 2, "coin": 4, "gem": 2, "chest": 1}}]
        ctx = await b.new_context(viewport={'width': 360, 'height': 640}, device_scale_factor=3)
        pg = await ctx.new_page()
        await pg.goto(WWW + '/index.html')
        await pg.evaluate("l=>{localStorage.setItem('cc_hero','knight');localStorage.setItem('cc_all','1')}", json.dumps(L))
        await pg.reload(); await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(STORE, 'screenshot-1-map.png'))
        await pg.evaluate("l=>localStorage.setItem('cc_levels',l)", json.dumps(L))
        await pg.reload(); await pg.wait_for_timeout(300)
        await pg.locator('.room').nth(0).click(); await pg.wait_for_timeout(600)
        await pg.screenshot(path=os.path.join(STORE, 'screenshot-2-board.png'))
        for k in ['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'] * 4:
            await pg.keyboard.press(k); await pg.wait_for_timeout(420)
        await pg.screenshot(path=os.path.join(STORE, 'screenshot-3-play.png'))
        await pg.keyboard.press('ArrowUp'); await pg.wait_for_timeout(120)
        await pg.screenshot(path=os.path.join(STORE, 'screenshot-4-action.png'))
        await b.close()
        os.path.exists(os.path.join(ROOT, '.tmp_page.html')) and os.remove(os.path.join(ROOT, '.tmp_page.html'))
asyncio.run(main())
