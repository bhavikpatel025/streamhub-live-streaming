using StreamHub.Application.DTOs.Auth;
using StreamHub.Application.Interfaces;
using StreamHub.Domain.Entities;

namespace StreamHub.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;

    public AuthService(IUserRepository userRepository, IJwtService jwtService)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        // Check if user exists
        if (await _userRepository.ExistsAsync(request.Email))
        {
            throw new Exception("User with this email already exists");
        }

        // Check username
        var existingUser = await _userRepository.GetByUsernameAsync(request.Username);
        if (existingUser != null)
        {
            throw new Exception("Username already taken");
        }

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // Create user
        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow
        };

        var createdUser = await _userRepository.CreateAsync(user);

        // Generate token
        var token = _jwtService.GenerateToken(createdUser.Id, createdUser.Username, createdUser.Email);

        return new AuthResponseDto
        {
            UserId = createdUser.Id,
            Username = createdUser.Username,
            Email = createdUser.Email,
            ProfileImageUrl = createdUser.ProfileImageUrl,
            Token = token
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        // Get user by email
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            throw new Exception("Invalid email or password");
        }

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new Exception("Invalid email or password");
        }

        // Generate token
        var token = _jwtService.GenerateToken(user.Id, user.Username, user.Email);

        return new AuthResponseDto
        {
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email,
            ProfileImageUrl = user.ProfileImageUrl,
            Token = token
        };
    }
}