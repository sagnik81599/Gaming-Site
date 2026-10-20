/* =========================================================
   GamingZone – interactions, scroll animation & 3D effects
   ========================================================= */
(() => {
   "use strict";

   const $ = (s, c = document) => c.querySelector(s);
   const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
   const body = document.body;
   const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
   const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

   /* ---------------------------------------------------------
      1. NAVBAR / MENU / LOGIN POPUP
   --------------------------------------------------------- */
   const header = $("header");
   const navbarMenu = $(".navbar .links");
   const hamburgerBtn = $(".navbar .hamburger-btn");
   const hideMenuBtn = $(".close-btn", navbarMenu);
   const showPopupBtn = $(".login-btn");
   const formPopup = $(".form-popup");
   const hidePopupBtn = $(".close-btn", formPopup);
   const overlay = $(".blur-bg-overlay");
   const bottomLinks = $$(".bottom-link a", formPopup);

   $$("li", navbarMenu).forEach((li, i) => li.style.setProperty("--n", i));

   const setMenu = (open) => {
      navbarMenu.classList.toggle("show-menu", open);
      body.classList.toggle("menu-open", open);
   };
   const setPopup = (open) => body.classList.toggle("show-popup", open);

   hamburgerBtn.addEventListener("click", () => setMenu(!navbarMenu.classList.contains("show-menu")));
   hideMenuBtn.addEventListener("click", () => setMenu(false));
   // close the mobile menu after tapping a link (it used to stay open)
   $$("a", navbarMenu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

   showPopupBtn.addEventListener("click", () => setPopup(!body.classList.contains("show-popup")));
   hidePopupBtn.addEventListener("click", () => setPopup(false));
   overlay.addEventListener("click", () => setPopup(false));
   document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
         setPopup(false);
         setMenu(false);
      }
   });

   // switch between Login and Signup forms
   bottomLinks.forEach((link) =>
      link.addEventListener("click", (e) => {
         e.preventDefault();
         formPopup.classList.toggle("show-signup", link.id === "signup-link");
      })
   );
   // forms have no backend yet – stop the page jumping to "#"
   $$("form", formPopup).forEach((f) => f.addEventListener("submit", (e) => e.preventDefault()));

   addEventListener("resize", () => {
      if (innerWidth > 950) setMenu(false);
   });

   /* ---------------------------------------------------------
      2. GAME FILTER (All / PC / Mobile)
         – fixed: data-items typo, and footer cards no longer hidden
   --------------------------------------------------------- */
   const tabs = $$(".games ul .list");
   const gameCards = $$(".games .cardBx .card");

   const applyFilter = (tab) => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const f = tab.dataset.filter;
      let n = 0;
      gameCards.forEach((card) => {
         const show = f === "all" || card.dataset.items === f;
         card.classList.toggle("hide", !show);
         card.classList.toggle("active", show);
         if (show) {
            card.classList.add("in");
            card.style.setProperty("--i", Math.min(n++, 14));
            card.classList.remove("pop");
            void card.offsetWidth; // restart the animation
            card.classList.add("pop");
         }
      });
   };

   tabs.forEach((tab) => {
      tab.setAttribute("role", "button");
      tab.tabIndex = 0;
      tab.addEventListener("click", () => applyFilter(tab));
      tab.addEventListener("keydown", (e) => {
         if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            applyFilter(tab);
         }
      });
   });
   gameCards.forEach((c) => c.addEventListener("animationend", (e) => e.target === c && c.classList.remove("pop")));

   /* ---------------------------------------------------------
      3. SCROLL REVEAL (IntersectionObserver)
   --------------------------------------------------------- */
   const addReveal = (els, opts = {}) => {
      els.forEach((el, i) => {
         el.classList.add("reveal");
         if (opts.dir) el.classList.add(opts.dir);
         if (opts.zoom) el.classList.add("zoom");
         const step = opts.step ?? 0.08;
         const wrap = opts.wrap ?? 6;
         el.style.setProperty("--d", ((i % wrap) * step).toFixed(2) + "s");
      });
      return els;
   };

   addReveal($$(".content2 > *"), { dir: "from-left", step: 0.12, wrap: 5 });
   addReveal($$(".img-sec"), { dir: "from-right", zoom: true });
   addReveal($$(".games > ul"));
   addReveal($$(".games .cardBx .card"), { zoom: true, wrap: 6 });
   addReveal($$(".tournaments .Box"), { zoom: true, wrap: 4, step: 0.1 });
   addReveal($$("#footer .cards .card"), { zoom: true, step: 0.15, wrap: 3 });
   addReveal($$(".footer-col"), { step: 0.1, wrap: 4 });

   /* 3D tilt targets */
   $$(".games .cardBx .card, .tournaments .Box, #footer .cards .card").forEach((el) => el.classList.add("tilt"));
   $$(".img-sec img").forEach((el) => {
      el.classList.add("tilt-img");
      el.dataset.tilt = "8";
   });

   /* animated counters for "NN Matches in progress" */
   const counters = new WeakMap();
   $$(".tournaments .Box .content h4 span").forEach((span) => {
      const target = parseInt(span.textContent, 10);
      if (!isNaN(target)) {
         counters.set(span.closest(".Box"), { span, target });
         if (!reduceMotion) span.textContent = "0";
      }
   });

   const runCounter = (box) => {
      const c = counters.get(box);
      if (!c || reduceMotion) return;
      const t0 = performance.now();
      const dur = 1400;
      const tick = (t) => {
         const p = Math.min((t - t0) / dur, 1);
         c.span.textContent = Math.round(c.target * (1 - Math.pow(1 - p, 3)));
         if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
   };

   if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
         (entries) => {
            entries.forEach((entry) => {
               if (!entry.isIntersecting) return;
               const el = entry.target;
               el.classList.add("in");
               runCounter(el);
               io.unobserve(el);
            });
         },
         { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );
      $$(".reveal").forEach((el) => io.observe(el));
   } else {
      $$(".reveal").forEach((el) => el.classList.add("in"));
   }

   /* ---------------------------------------------------------
      4. 3D TILT ON HOVER (mouse only – skipped on touch)
   --------------------------------------------------------- */
   if (finePointer && !reduceMotion) {
      let cur = null;
      let evt = null;
      let raf = 0;

      const reset = (el) => {
         if (el) el.style.transform = "";
      };

      const apply = () => {
         raf = 0;
         if (!cur || !evt) return;
         const r = cur.getBoundingClientRect();
         const px = Math.min(Math.max((evt.clientX - r.left) / r.width, 0), 1);
         const py = Math.min(Math.max((evt.clientY - r.top) / r.height, 0), 1);
         const max = parseFloat(cur.dataset.tilt) || 12;
         cur.style.transform =
            `perspective(800px) rotateX(${((0.5 - py) * max).toFixed(2)}deg) ` +
            `rotateY(${((px - 0.5) * max).toFixed(2)}deg) scale3d(1.03,1.03,1.03)`;
         cur.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
         cur.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      };

      document.addEventListener(
         "pointermove",
         (e) => {
            if (e.pointerType === "touch") return;
            const t = e.target.closest ? e.target.closest(".tilt, .tilt-img") : null;
            if (t !== cur) {
               reset(cur);
               cur = t;
            }
            if (!cur) return;
            evt = e;
            if (!raf) raf = requestAnimationFrame(apply);
         },
         { passive: true }
      );
      document.addEventListener("mouseleave", () => {
         reset(cur);
         cur = null;
      });
   }

   /* ---------------------------------------------------------
      5. CURSOR GLOW + HERO MOUSE PARALLAX
   --------------------------------------------------------- */
   const hero = $(".warpper");
   const stage = $(".stage");

   if (finePointer && !reduceMotion) {
      const glow = document.createElement("div");
      glow.className = "cursor-glow";
      body.appendChild(glow);
      let gx = 0, gy = 0, gRaf = 0;
      addEventListener(
         "pointermove",
         (e) => {
            gx = e.clientX;
            gy = e.clientY;
            glow.classList.add("on");
            if (!gRaf)
               gRaf = requestAnimationFrame(() => {
                  glow.style.transform = `translate3d(${gx}px,${gy}px,0)`;
                  gRaf = 0;
               });
         },
         { passive: true }
      );
      document.addEventListener("mouseleave", () => glow.classList.remove("on"));
   }

   if (stage && !reduceMotion) {
      let pRaf = 0;
      hero.addEventListener(
         "pointermove",
         (e) => {
            if (e.pointerType === "touch" || pRaf) return;
            pRaf = requestAnimationFrame(() => {
               const r = hero.getBoundingClientRect();
               stage.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
               stage.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
               pRaf = 0;
            });
         },
         { passive: true }
      );
   }

   /* ---------------------------------------------------------
      6. PARTICLE NETWORK (hero canvas)
   --------------------------------------------------------- */
   (function particles() {
      const canvas = $("#fx-canvas");
      if (!canvas || reduceMotion) return;
      const ctx = canvas.getContext("2d");
      let w = 0, h = 0, parts = [], raf = 0, visible = true;
      const mouse = { x: -9999, y: -9999 };

      const resize = () => {
         const dpr = Math.min(window.devicePixelRatio || 1, 2);
         const r = canvas.getBoundingClientRect();
         w = r.width;
         h = r.height;
         canvas.width = w * dpr;
         canvas.height = h * dpr;
         ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
         const n = Math.round(Math.min(90, Math.max(24, (w * h) / 24000)));
         parts = Array.from({ length: n }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 1.8 + 0.7,
            c: Math.random() < 0.7 ? "26,238,239" : "123,77,255",
         }));
      };

      const LINK = 120;
      const step = () => {
         raf = 0;
         if (!visible || document.hidden) return;
         ctx.clearRect(0, 0, w, h);
         for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 14000) {
               const d = Math.sqrt(d2) || 1;
               p.x += (dx / d) * 1.4;
               p.y += (dy / d) * 1.4;
            }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, 6.2832);
            ctx.fillStyle = `rgba(${p.c},0.85)`;
            ctx.fill();
            for (let j = i + 1; j < parts.length; j++) {
               const q = parts[j];
               const ax = p.x - q.x;
               const ay = p.y - q.y;
               const dist = ax * ax + ay * ay;
               if (dist < LINK * LINK) {
                  ctx.strokeStyle = `rgba(${p.c},${(1 - Math.sqrt(dist) / LINK) * 0.35})`;
                  ctx.lineWidth = 1;
                  ctx.beginPath();
                  ctx.moveTo(p.x, p.y);
                  ctx.lineTo(q.x, q.y);
                  ctx.stroke();
               }
            }
         }
         raf = requestAnimationFrame(step);
      };

      const start = () => {
         if (!raf) raf = requestAnimationFrame(step);
      };

      resize();
      start();

      let rt;
      addEventListener("resize", () => {
         clearTimeout(rt);
         rt = setTimeout(() => {
            resize();
            start();
         }, 150);
      });

      hero.addEventListener(
         "pointermove",
         (e) => {
            const r = canvas.getBoundingClientRect();
            mouse.x = e.clientX - r.left;
            mouse.y = e.clientY - r.top;
         },
         { passive: true }
      );
      hero.addEventListener("pointerleave", () => {
         mouse.x = mouse.y = -9999;
      });

      // pause when hero is off-screen or tab hidden (saves battery)
      if ("IntersectionObserver" in window) {
         new IntersectionObserver((en) => {
            visible = en[0].isIntersecting;
            if (visible) start();
         }).observe(hero);
      }
      document.addEventListener("visibilitychange", () => !document.hidden && start());
   })();

   /* ---------------------------------------------------------
      7. SCROLL: sticky header, progress bar, scroll-spy,
         hero parallax, back-to-top
   --------------------------------------------------------- */
   const progress = document.createElement("div");
   progress.className = "scroll-progress";
   progress.setAttribute("aria-hidden", "true");
   body.appendChild(progress);

   const toTop = document.createElement("button");
   toTop.className = "to-top";
   toTop.type = "button";
   toTop.setAttribute("aria-label", "Back to top");
   toTop.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
   toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
   body.appendChild(toTop);

   const article = $(".article");
   const spyLinks = $$(".navbar .links a").map((a) => {
      const id = a.getAttribute("href");
      return { a, el: id && id.length > 1 ? document.getElementById(id.slice(1)) : null };
   });

   let ticking = false;
   const onScroll = () => {
      ticking = false;
      const y = window.scrollY || document.documentElement.scrollTop;
      const max = document.documentElement.scrollHeight - innerHeight;

      header.classList.toggle("sticky", y > 10);
      progress.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
      toTop.classList.toggle("show", y > innerHeight * 0.6);

      // hero parallax + fade (only while hero is visible)
      if (article && !reduceMotion && y < innerHeight) {
         article.style.transform = `translate3d(0,${(y * 0.22).toFixed(1)}px,0)`;
         article.style.opacity = Math.max(1 - y / (innerHeight * 0.85), 0).toFixed(3);
      }

      // scroll-spy: highlight the link of the section in view
      const pos = y + innerHeight * 0.35;
      let current = spyLinks[0];
      spyLinks.forEach((l) => {
         if (l.el && l.el.getBoundingClientRect().top + y <= pos) current = l;
      });
      spyLinks.forEach((l) => l.a.classList.toggle("active", l === current));
   };

   addEventListener(
      "scroll",
      () => {
         if (!ticking) {
            ticking = true;
            requestAnimationFrame(onScroll);
         }
      },
      { passive: true }
   );
   addEventListener("resize", onScroll);
   onScroll();
})();
