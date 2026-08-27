using System.Net;
using Backend.Settings;
using Microsoft.Extensions.Options;

namespace Backend.Services;

public class TmdbService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;

    public TmdbService(HttpClient http, IOptions<TmdbSettings> settings)
    {
        _http = http;
        _apiKey = settings.Value.ApiKey;
    }

    public Task<string> GetPopularAsync(int page, CancellationToken ct) =>
        GetAsync($"movie/popular?api_key={_apiKey}&page={page}", ct);

    public Task<string> SearchAsync(string query, int page, CancellationToken ct) =>
        GetAsync($"search/movie?api_key={_apiKey}&query={Uri.EscapeDataString(query)}&page={page}", ct);

    public Task<string> GetDetailsAsync(int movieId, CancellationToken ct) =>
        GetAsync($"movie/{movieId}?api_key={_apiKey}", ct);

    public Task<string> GetVideosAsync(int movieId, CancellationToken ct) =>
        GetAsync($"movie/{movieId}/videos?api_key={_apiKey}", ct);

    public Task<string> GetCreditsAsync(int movieId, CancellationToken ct) =>
        GetAsync($"movie/{movieId}/credits?api_key={_apiKey}", ct);

    public Task<string> GetProvidersAsync(int movieId, CancellationToken ct) =>
        GetAsync($"movie/{movieId}/watch/providers?api_key={_apiKey}", ct);

    public Task<string> GetRecommendationsAsync(int movieId, CancellationToken ct) =>
        GetAsync($"movie/{movieId}/recommendations?api_key={_apiKey}", ct);


    private async Task<string> GetAsync( string path, CancellationToken ct)
    {
        using var response = await _http.GetAsync(path, ct);

        if(response.StatusCode == HttpStatusCode.TooManyRequests)
                throw new InvalidOperationException("TMDB rate limit reached. Try again in a moment.");

        if(!response.IsSuccessStatusCode)
            throw new HttpRequestException(
                $"TMDB returned {(int)response.StatusCode} for {path}",
                inner: null,
                statusCode: response.StatusCode);

        return await response.Content.ReadAsStringAsync(ct);
    }
     


}