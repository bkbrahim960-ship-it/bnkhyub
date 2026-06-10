package com.bnkhub.tv.model

data class TmdbMovie(
    val id: Int,
    val title: String? = null,
    val name: String? = null,
    val overview: String? = null,
    val poster_path: String? = null,
    val backdrop_path: String? = null,
    val vote_average: Double? = null,
    val first_air_date: String? = null,
    val release_date: String? = null,
    val media_type: String? = null
)

data class TmdbPage(
    val results: List<TmdbMovie>,
    val total_pages: Int
)

data class TmdbGenre(
    val id: Int,
    val name: String
)

data class TmdbMovieDetail(
    val id: Int,
    val title: String? = null,
    val name: String? = null,
    val overview: String? = null,
    val poster_path: String? = null,
    val backdrop_path: String? = null,
    val vote_average: Double? = null,
    val release_date: String? = null,
    val first_air_date: String? = null,
    val runtime: Int? = null,
    val genres: List<TmdbGenre>? = null,
    val number_of_seasons: Int? = null,
    val number_of_episodes: Int? = null
)

data class TmdbVideo(
    val key: String?,
    val site: String?,
    val type: String?
)

data class TmdbVideos(
    val results: List<TmdbVideo>?
)
