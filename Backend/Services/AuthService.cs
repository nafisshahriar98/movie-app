using Backend.Models;
using Backend.Models.Dtos;
using MongoDB.Driver;

namespace Backend.Services;
public class AuthService
{
    private readonly MongoDbService _mongo;
    private readonly JwtService _jwt;

    public AuthService(MongoDbService mongo, JwtService jwt)
    {
        _mongo = mongo;
        _jwt = jwt;
    }

    public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
    {
        var existing = await _mongo.Users
            .Find(u => u.Email == dto.Email)
            .FirstOrDefaultAsync();

        if (existing is not null)
            return null;

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "User"
        };

        await _mongo.Users.InsertOneAsync(user);
        return BuildResponse(user);

    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _mongo.Users
            .Find(u => u.Email == dto.Email)
            .FirstOrDefaultAsync();

        if (user is null)
            return null;

        var ok = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!ok)
            return null;

        return BuildResponse(user);

    }

    private AuthResponseDto BuildResponse(User user) => new()
    {
        Token = _jwt.GenerateToken(user),
        Username = user.Username,
        Email = user.Email,
        Role = user.Role
    };
}