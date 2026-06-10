package com.bnkhub.tv

import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity

class WebPlayerActivity : AppCompatActivity() {
    companion object {
        const val EXTRA_URL = "embed_url"
        const val EXTRA_TITLE = "media_title"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val url = intent.getStringExtra(EXTRA_URL) ?: finish()
        val title = intent.getStringExtra(EXTRA_TITLE) ?: "BNKhub"

        val webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowContentAccess = true
            settings.mediaPlaybackRequiresUserGesture = false
            settings.loadWithOverviewMode = true
            settings.useWideViewPort = true
            settings.builtInZoomControls = false
            settings.userAgentString = settings.userAgentString
                .replace("Android", "BNKhubTV")
                .replace("Mobile", "TV")

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                    url?.let { view?.loadUrl(it) }
                    return true
                }
            }
            webChromeClient = WebChromeClient()
            loadUrl(url)
        }

        val container = FrameLayout(this).apply {
            addView(webView, FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            ))
        }
        setContentView(container)
        supportActionBar?.hide()
    }

    override fun onBackPressed() {
        val webView = (findViewById<FrameLayout>(android.R.id.content)?.getChildAt(0) as? WebView)
        if (webView?.canGoBack() == true) webView.goBack()
        else super.onBackPressed()
    }
}
