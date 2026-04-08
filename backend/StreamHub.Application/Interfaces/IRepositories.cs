using StreamHub.Domain.Entities;
using Stream = StreamHub.Domain.Entities.Stream;

namespace StreamHub.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByUsernameAsync(string username);
    Task<User> CreateAsync(User user);
    Task UpdateAsync(User user);
    Task<bool> ExistsAsync(string email);
}

public interface IStreamRepository
{
    Task<Stream?> GetByIdAsync(int id);
    Task<Stream?> GetByStreamKeyAsync(string streamKey);
    Task<IEnumerable<Stream>> GetAllLiveStreamsAsync();
    Task<IEnumerable<Stream>> GetUserStreamsAsync(int userId);
    Task<Stream> CreateAsync(Stream stream);
    Task UpdateAsync(Stream stream);
    Task DeleteAsync(int id);
}

public interface IChatRepository
{
    Task<ChatMessage> CreateAsync(ChatMessage message);
    Task<IEnumerable<ChatMessage>> GetStreamMessagesAsync(int streamId, int limit = 50);
}

public interface INotificationRepository
{
    Task<IReadOnlyCollection<Notification>> CreateStreamStartedNotificationsAsync(
        int streamerUserId,
        int streamId,
        string streamerName,
        string streamTitle,
        DateTime createdAt);
    Task<IReadOnlyCollection<Notification>> GetByUserIdAsync(int userId);
    Task<Notification?> GetByIdAsync(int id, int userId);
    Task DeleteAsync(Notification notification);
    Task DeleteAllByUserIdAsync(int userId);
    Task MarkAllAsReadAsync(int userId);
}
