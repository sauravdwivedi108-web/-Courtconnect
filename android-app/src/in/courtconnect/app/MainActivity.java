package in.courtconnect.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.DownloadListener;
import android.webkit.MimeTypeMap;
import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class MainActivity extends Activity {

    /* The bundled site (assets/www) is served from this https origin, so fetch(),
       localStorage and relative links behave exactly as they do on the website.
       file:// URLs block fetch(), which the Drafting Desk library needs. */
    private static final String APP_HOST = "appassets.androidplatform.net";
    private static final String APP_START = "https://" + APP_HOST + "/index.html";

    private static final Map<String, String> MIME = new HashMap<>();
    static {
        MIME.put("html", "text/html");
        MIME.put("htm", "text/html");
        MIME.put("css", "text/css");
        MIME.put("js", "text/javascript");
        MIME.put("mjs", "text/javascript");
        MIME.put("json", "application/json");
        MIME.put("webmanifest", "application/manifest+json");
        MIME.put("svg", "image/svg+xml");
        MIME.put("png", "image/png");
        MIME.put("jpg", "image/jpeg");
        MIME.put("jpeg", "image/jpeg");
        MIME.put("webp", "image/webp");
        MIME.put("gif", "image/gif");
        MIME.put("ico", "image/x-icon");
        MIME.put("woff", "font/woff");
        MIME.put("woff2", "font/woff2");
        MIME.put("txt", "text/plain");
        MIME.put("pdf", "application/pdf");
    }

    private WebView webView;
    private ProgressBar progressBar;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FrameLayout root = new FrameLayout(this);
        webView = new WebView(this);
        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);

        FrameLayout.LayoutParams wvParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT);
        FrameLayout.LayoutParams pbParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                8);
        pbParams.gravity = android.view.Gravity.TOP;

        root.addView(webView, wvParams);
        root.addView(progressBar, pbParams);
        setContentView(root);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setSupportZoom(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        /* Everything is served over the virtual https origin; no file:// access needed. */
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return serveAsset(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (isAppUrl(uri) && !isLiveSiteFile(uri)) {
                    return false;
                }
                openExternally(uri);
                return true;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                progressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(View.GONE);
                progressBar.setProgress(100);
            }
        });

        webView.setWebChromeClient(new android.webkit.WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
            }
        });

        /* <a download> links (e.g. "Download original" in the draft viewer). */
        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition,
                                        String mimeType, long contentLength) {
                openExternally(Uri.parse(url));
            }
        });

        /* Service-worker requests bypass WebViewClient; serve them from the bundle too
           (sw.js itself is 404'd, so the app never installs a stale offline cache). */
        ServiceWorkerController.getInstance().setServiceWorkerClient(new ServiceWorkerClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebResourceRequest request) {
                return serveAsset(request.getUrl());
            }
        });

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(APP_START);
        }
    }

    private static boolean isAppUrl(Uri uri) {
        return uri != null && "https".equals(uri.getScheme()) && APP_HOST.equals(uri.getHost());
    }

    /* Original RTF/DOCX drafts (drafts-library/) and the APK/ISO (downloads/) are too large
       to bundle; they come from the live site. */
    private static boolean isLiveSiteFile(Uri uri) {
        String path = uri.getPath();
        return path != null && (path.startsWith("/drafts-library/") || path.startsWith("/downloads/"));
    }

    private WebResourceResponse serveAsset(Uri uri) {
        if (!isAppUrl(uri)) {
            return null;
        }
        String path = uri.getPath();
        if (path == null || path.isEmpty() || path.equals("/")) {
            path = "/index.html";
        } else if (path.endsWith("/")) {
            path = path + "index.html";
        }
        if (path.equals("/sw.js") || path.contains("..")) {
            return notFound();
        }
        String assetPath = "www" + path;
        try {
            InputStream in = getAssets().open(assetPath);
            String mime = mimeFor(assetPath);
            String encoding = mime.startsWith("text/") || mime.endsWith("json") ? "UTF-8" : null;
            return new WebResourceResponse(mime, encoding, in);
        } catch (IOException e) {
            return notFound();
        }
    }

    private static WebResourceResponse notFound() {
        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                null, new ByteArrayInputStream(new byte[0]));
    }

    private static String mimeFor(String path) {
        int dot = path.lastIndexOf('.');
        String ext = dot >= 0 ? path.substring(dot + 1).toLowerCase(Locale.ROOT) : "";
        String mime = MIME.get(ext);
        if (mime == null) {
            mime = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext);
        }
        return mime != null ? mime : "application/octet-stream";
    }

    private void openExternally(Uri uri) {
        if (uri == null) {
            return;
        }
        if (isAppUrl(uri)) {
            /* Only drafts-library/ and downloads/ files reach here: fetch them from the live site. */
            Uri site = Uri.parse(getString(R.string.site_url));
            uri = uri.buildUpon()
                    .scheme(site.getScheme())
                    .encodedAuthority(site.getEncodedAuthority())
                    .build();
        }
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "No app found to open this link.", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
