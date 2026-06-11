using Backend.Models;
using Backend.Settings;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Runtime;
using System.Security.Claims;
using System.Text;

namespace Backend.Services;

public class JwtService
{
    private readonly JwtSettings _settings;
    public JwtService(IOptions<JwtSettings> settings)
    {
        _settings = settings.Value;
    }

    public String GenerateToken(User user)
    {
        var claims = new[]
         {
              new Claim(JwtRegisteredClaimNames.Sub, user.Id ?? string.Empty),
              new Claim(JwtRegisteredClaimNames.Email, user.Email),
              new Claim("username", user.Username),
              new Claim(ClaimTypes.Role, user.Role),
              new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
          };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_settings.ExpiryMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);

    }


}

