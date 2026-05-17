using HospitalManagement.Application.DTOs;
using HospitalManagement.Config;
using HospitalManagement.Data;
using HospitalManagement.DTOs;
using HospitalManagement.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HospitalManagement.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AppDbContext _context;
        private readonly JwtConfig _jwtConfig;
        private const string RefreshTokenType = "refresh";
        private readonly IEmailService _emailService;

        public AuthService(UserManager<ApplicationUser> userManager, AppDbContext context, IOptions<JwtConfig> jwtConfig, IEmailService emailService)
        {
            _userManager = userManager;
            _context = context;
            _jwtConfig = jwtConfig.Value;
            _emailService = emailService;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email)
                ?? throw new UnauthorizedAccessException("Invalid email or password.");

            if (!await _userManager.CheckPasswordAsync(user, request.Password))
                throw new UnauthorizedAccessException("Invalid email or password.");

            var roles = await _userManager.GetRolesAsync(user);

            
            if (roles.Contains("Doctor"))
            {
                await SendTwoFactorCodeAsync(request.Email);
                return new AuthResponseDto
                {
                    RequiresTwoFactor = true,
                    Email = user.Email ?? string.Empty,
                    Roles = roles
                };
            }

            return await GenerateTokenAsync(user);
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequest request)
        {
            var (principal, jti) = ValidateRefreshJwtAndGetJti(request.RefreshToken);
            var storedToken = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.JwtId == jti)
                ?? throw new UnauthorizedAccessException("Invalid refresh token");

            if (!storedToken.IsActive)
                throw new UnauthorizedAccessException("Refresh token has been revoked or expired");

            var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId!)
                ?? throw new UnauthorizedAccessException("User not found");

            storedToken.RevokedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return await GenerateTokenAsync(user);
        }

        public async Task RevokeRefreshTokenAsync(RefreshTokenRequest request)
        {
            string? jti;
            try { (_, jti) = ValidateRefreshJwtAndGetJti(request.RefreshToken, false); }
            catch { return; }

            var storedToken = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.JwtId == jti);
            if (storedToken is null || !storedToken.IsActive) return;

            storedToken.RevokedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        private async Task<AuthResponseDto> GenerateTokenAsync(ApplicationUser user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtConfig.SecretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var roles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id),
                new(ClaimTypes.Name, user.UserName ?? string.Empty),
                new(ClaimTypes.Email, user.Email ?? string.Empty),
                new(ClaimTypes.GivenName, user.FirstName ?? string.Empty),
                new(ClaimTypes.Surname, user.LastName ?? string.Empty),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };
            claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

            var token = new JwtSecurityToken(
                issuer: _jwtConfig.Issuer,
                audience: _jwtConfig.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtConfig.ExpirationMinutes),
                signingCredentials: credentials);

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            var (refreshToken, refreshJwt) = await CreateRefreshTokenAsync(user.Id);

            return new AuthResponseDto
            {
                AccessToken = tokenString,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtConfig.ExpirationMinutes),
                RefreshToken = refreshJwt,
                RefreshTokenExpiresAt = refreshToken.ExpiresAt,
                Email = user.Email ?? string.Empty,
                Roles = roles
            };
        }

        private (ClaimsPrincipal principal, string jti) ValidateRefreshJwtAndGetJti(string refreshToken, bool validateLifetime = true)
        {
            var handler = new JwtSecurityTokenHandler();
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtConfig.RefreshTokenSecretKey));

            var principal = handler.ValidateToken(refreshToken, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = validateLifetime,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _jwtConfig.Issuer,
                ValidAudience = _jwtConfig.Audience,
                IssuerSigningKey = key,
                ClockSkew = TimeSpan.Zero
            }, out var validatedToken);

            if (validatedToken is not JwtSecurityToken jwt)
                throw new UnauthorizedAccessException("Invalid refresh token");

            if (jwt.Claims.FirstOrDefault(c => c.Type == "token_type")?.Value != RefreshTokenType)
                throw new UnauthorizedAccessException("Invalid refresh token");

            var jti = jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti)?.Value
                ?? throw new UnauthorizedAccessException("Invalid refresh token");

            return (principal, jti);
        }

        private async Task<(RefreshToken, string)> CreateRefreshTokenAsync(string userId)
        {
            var jti = Guid.NewGuid().ToString("N");
            var expiresAt = DateTime.UtcNow.AddDays(_jwtConfig.RefreshTokenExpirationDays);
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtConfig.RefreshTokenSecretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, userId),
                new(JwtRegisteredClaimNames.Jti, jti),
                new(JwtRegisteredClaimNames.Sub, userId),
                new("token_type", RefreshTokenType)
            };

            var token = new JwtSecurityToken(
                issuer: _jwtConfig.Issuer,
                audience: _jwtConfig.Audience,
                claims: claims,
                expires: expiresAt,
                signingCredentials: credentials);

            var jwtString = new JwtSecurityTokenHandler().WriteToken(token);
            var refreshToken = new RefreshToken
            {
                JwtId = jti,
                UserId = userId,
                ExpiresAt = expiresAt,
                CreatedAt = DateTime.UtcNow
            };

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();
            return (refreshToken, jwtString);
        }

        public async Task ForgotPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return; 

            var token = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
            user.PasswordResetToken = token;
            user.PasswordResetTokenExpiry = DateTimeOffset.UtcNow.AddHours(1);
            await _userManager.UpdateAsync(user);

            await _emailService.SendPasswordResetAsync(user.Email!, user.FullName, token);
        }

        public async Task ResetPasswordAsync(string token, string newPassword)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.PasswordResetToken == token &&
                u.PasswordResetTokenExpiry > DateTimeOffset.UtcNow)
                ?? throw new Exception("The token is invalid or has expired.");

            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, resetToken, newPassword);

            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;
            await _userManager.UpdateAsync(user);
        }

        public async Task SendTwoFactorCodeAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email)
                ?? throw new UnauthorizedAccessException("User not found");

            var code = new Random().Next(100000, 999999).ToString();
            user.TwoFactorCode = code;
            user.TwoFactorCodeExpiry = DateTimeOffset.UtcNow.AddMinutes(5);
            await _userManager.UpdateAsync(user);

            await _emailService.SendTwoFactorCodeAsync(user.Email!, user.FullName, code);
        }

        public async Task<AuthResponseDto> VerifyTwoFactorCodeAsync(VerifyTwoFactorDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email)
                ?? throw new UnauthorizedAccessException("User not found");

            if (user.TwoFactorCode != dto.Code)
                throw new UnauthorizedAccessException("Wrong code");

            if (user.TwoFactorCodeExpiry < DateTimeOffset.UtcNow)
                throw new UnauthorizedAccessException("The code has expired");

            user.TwoFactorCode = null;
            user.TwoFactorCodeExpiry = null;
            await _userManager.UpdateAsync(user);

            return await GenerateTokenAsync(user);
        }
    }
}
