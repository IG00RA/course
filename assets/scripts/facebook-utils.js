function initializeFacebookPixelOnConfirmPage() {
  const params = getQueryParams();
  const fbp = params.fbp;

  if (fbp) {
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", fbp);
    fbq("track", "Lead");
    fbq("track", "PageView");
  }
}

function initializeFacebookPixel() {
  const params = getQueryParams();
  const fbp = params.fbp;

  if (fbp) {
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", fbp);
    fbq("track", "PageView");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initializeFacebookPixelNoscript();
});

function initializeFacebookPixelNoscript() {
  const params = getQueryParams();
  const fbp = params.fbp;
  if (fbp) {
    const noscriptTag = document.querySelector("noscript");
    if (noscriptTag) {
      noscriptTag.innerHTML = `
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${fbp}&ev=PageView&noscript=1"
        />
      `;
    }
  }
}

function getQueryParams() {
  const searchParams = new URLSearchParams(window.location.search);
  const params = {};
  params.refId = searchParams.get("ref_id");
  params.sub1 = searchParams.get("sub1");
  params.sub2 = searchParams.get("sub2");
  params.sub3 = searchParams.get("sub3");
  params.sub4 = searchParams.get("sub4");
  params.sub5 = searchParams.get("sub5");
  params.sub6 = searchParams.get("sub6");
  params.sub7 = searchParams.get("sub7");
  params.sub8 = searchParams.get("sub8");
  params.fbp = searchParams.get("fbp");
  return params;
}

if (window.location.pathname === "/confirm.html") {
  initializeFacebookPixelOnConfirmPage();
}

if (window.location.pathname === "/index.html" || window.location.pathname === "/") {
  initializeFacebookPixel();
}
