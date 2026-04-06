using Microsoft.AspNetCore.Http;
using StreamHub.Application.DTOs.Auth;
using StreamHub.Application.DTOs.Stream;
using StreamHub.Application.DTOs.Chat;

using StreamHub.Application.DTOs.User;

namespace StreamHub.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
}

public interface IStreamService
{
    Task<StreamDto> CreateStreamAsync(int userId, CreateStreamDto dto);
    Task<StreamDto?> GetStreamByIdAsync(int id);
    Task<StreamDto?> GetStreamByKeyAsync(string streamKey);
    Task<IEnumerable<StreamListDto>> GetLiveStreamsAsync();
    Task<IEnumerable<StreamDto>> GetUserStreamsAsync(int userId);
    Task<StreamKeyDto> GetStreamKeyAsync(int streamId, int userId);
    Task StartStreamAsync(int streamId, int userId);
    Task StopStreamAsync(int streamId, int userId);
    Task UpdateViewerCountAsync(int streamId, int count);
    Task DeleteStreamAsync(int streamId, int userId);
}

public interface IChatService
{
    Task<ChatMessageDto> SendMessageAsync(int userId, SendMessageDto dto);
    Task<IEnumerable<ChatMessageDto>> GetStreamMessagesAsync(int streamId);
}

public interface IUserService
{
    Task<UserProfileDto?> GetUserByIdAsync(int userId);
    Task<UploadProfilePictureResponseDto> UploadProfilePictureAsync(int userId, IFormFile file);
    Task RemoveProfilePictureAsync(int userId);
}

public interface IJwtService
{
    string GenerateToken(int userId, string username, string email);
}

