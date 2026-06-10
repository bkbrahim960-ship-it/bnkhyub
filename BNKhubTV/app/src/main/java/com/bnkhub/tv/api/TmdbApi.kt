package com.bnkhub.tv.api

import com.bnkhub.tv.model.*
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor

interface TmdbApi {
    @GET("trending/all/day")
    suspend fun getTrending(@Query("language") lang: String = "ar"): TmdbPage

    @GET("movie/popular")
    suspend fun getPopularMovies(@Query("page") page: Int = 1, @Query("language") lang: String = "ar"): TmdbPage

    @GET("tv/popular")
    suspend fun getPopularTv(@Query("page") page: Int = 1, @Query("language") lang: String = "ar"): TmdbPage

    @GET("movie/{id}")
    suspend fun getMovieDetail(@Path("id") id: Int, @Query("language") lang: String = "ar"): TmdbMovieDetail

    @GET("tv/{id}")
    suspend fun getTvDetail(@Path("id") id: Int, @Query("language") lang: String = "ar"): TmdbMovieDetail

    @GET("movie/{id}/videos")
    suspend fun getMovieVideos(@Path("id") id: Int, @Query("language") lang: String = "en"): TmdbVideos

    @GET("tv/{id}/videos")
    suspend fun getTvVideos(@Path("id") id: Int, @Query("language") lang: String = "en"): TmdbVideos

    @GET("search/multi")
    suspend fun search(@Query("query") query: String, @Query("page") page: Int = 1): TmdbPage

    @GET("genre/movie/list")
    suspend fun getGenres(@Query("language") lang: String = "ar"): GenreResponse

    companion object {
        private const val BASE_URL = "https://api.themoviedb.org/3/"
        const val API_KEY = "f0190fee06b7ba5c5180d2a1f97d3831"
        const val IMAGE_BASE = "https://image.tmdb.org/t/p/w500"
        const val BACKDROP_BASE = "https://image.tmdb.org/t/p/w780"

        fun create(): TmdbApi {
            val logging = HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BASIC }
            val client = OkHttpClient.Builder()
                .addInterceptor { chain ->
                    val request = chain.request().newBuilder()
                        .addHeader("Authorization", "Bearer $API_KEY")
                        .build()
                    chain.proceed(request)
                }
                .addInterceptor(logging)
                .build()

            return Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(TmdbApi::class.java)
        }
    }
}

data class GenreResponse(val genres: List<TmdbGenre>)
