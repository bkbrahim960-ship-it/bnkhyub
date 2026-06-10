package com.bnkhub.tv

import android.content.Intent
import android.graphics.drawable.Drawable
import android.os.Bundle
import androidx.leanback.app.BrowseSupportFragment
import androidx.leanback.widget.*
import androidx.lifecycle.lifecycleScope
import com.bnkhub.tv.api.TmdbApi
import com.bnkhub.tv.model.TmdbMovie
import com.bumptech.glide.Glide
import com.bumptech.glide.request.target.CustomTarget
import com.bumptech.glide.request.transition.Transition
import kotlinx.coroutines.launch

class MainBrowseFragment : BrowseSupportFragment() {

    private val api = TmdbApi.create()
    private val rowsAdapter = ArrayObjectAdapter(ListRowPresenter())

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        setupUI()
        loadData()
    }

    private fun setupUI() {
        title = "BNKhub"
        headersState = HEADERS_ENABLED
        isHeadersTransitionOnBackEnabled = true
        brandColor = resources.getColor(R.color.primary)
        adapter = rowsAdapter

        onItemViewClickedListener = ItemViewClickedListener()
    }

    private fun loadData() {
        lifecycleScope.launch {
            try {
                val trending = api.getTrending()
                addCardRow(getString(R.string.trending), trending.results.take(20))

                val movies = api.getPopularMovies()
                addCardRow(getString(R.string.popular_movies), movies.results.take(20))

                val series = api.getPopularTv()
                addCardRow(getString(R.string.popular_series), series.results.take(20))
            } catch (_: Exception) {}
        }
    }

    private fun addCardRow(title: String, movies: List<TmdbMovie>) {
        val cardAdapter = ArrayObjectAdapter(CardPresenter())
        movies.forEach { cardAdapter.add(it) }
        rowsAdapter.add(ListRow(HeaderItem(title), cardAdapter))
    }

    inner class CardPresenter : Presenter() {
        override fun onCreateViewHolder(parent: android.view.ViewGroup): ViewHolder {
            val cardView = ImageCardView(parent.context).apply {
                isFocusable = true
                isFocusableInTouchMode = true
                cardType = ImageCardView.CARD_TYPE_INFO_UNDER
                setBackgroundColor(resources.getColor(R.color.surface))
            }
            return ViewHolder(cardView)
        }

        override fun onBindViewHolder(viewHolder: ViewHolder, item: Any) {
            val movie = item as TmdbMovie
            val cardView = viewHolder.view as ImageCardView
            cardView.titleText = movie.title ?: movie.name ?: ""
            cardView.contentText = "★ ${String.format("%.1f", movie.vote_average ?: 0.0)}"

            val poster = movie.poster_path
            if (poster != null) {
                Glide.with(this@MainBrowseFragment)
                    .load(TmdbApi.IMAGE_BASE + poster)
                    .into(object : CustomTarget<Drawable>() {
                        override fun onResourceReady(resource: Drawable, transition: Transition<in Drawable>?) {
                            cardView.mainImage = resource
                        }
                        override fun onLoadCleared(placeholder: Drawable?) {}
                    })
            }
        }

        override fun onUnbindViewHolder(viewHolder: ViewHolder) {}
    }

    inner class ItemViewClickedListener : OnItemViewClickedListener {
        override fun onItemClicked(
            itemViewHolder: Presenter.ViewHolder?,
            item: Any?,
            rowViewHolder: Presenter.ViewHolder?,
            row: Any?
        ) {
            val movie = item as? TmdbMovie ?: return
            val isMovie = movie.media_type == "movie" || movie.title != null
            val tmdbId = movie.id
            val embedUrl = if (isMovie) {
                "https://nhdapi.com/embed/movie/$tmdbId?autoplay=true&subtitle=ar&primarycolor=C124A0"
            } else {
                "https://nhdapi.com/embed/tv/$tmdbId/1/1?autoplay=true&subtitle=ar&primarycolor=C124A0"
            }

            startActivity(Intent(requireContext(), WebPlayerActivity::class.java).apply {
                putExtra(WebPlayerActivity.EXTRA_URL, embedUrl)
                putExtra(WebPlayerActivity.EXTRA_TITLE, movie.title ?: movie.name ?: "")
            })
        }
    }
}
