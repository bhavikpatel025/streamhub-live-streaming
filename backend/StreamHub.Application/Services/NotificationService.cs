using StreamHub.Application.DTOs.Notification;
using StreamHub.Application.Interfaces;

namespace StreamHub.Application.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;

    public NotificationService(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    public async Task<IReadOnlyCollection<NotificationDto>> GetUserNotificationsAsync(int userId)
    {
        var notifications = await _notificationRepository.GetByUserIdAsync(userId);
        return notifications.Select(MapNotification).ToArray();
    }

    public async Task<IReadOnlyCollection<NotificationDispatchDto>> CreateStreamStartedNotificationsAsync(
        int streamerUserId,
        int streamId,
        string streamerName,
        string streamTitle)
    {
        var createdAt = DateTime.UtcNow;
        var notifications = await _notificationRepository.CreateStreamStartedNotificationsAsync(
            streamerUserId,
            streamId,
            streamerName,
            streamTitle,
            createdAt);

        return notifications
            .Select(notification => new NotificationDispatchDto
            {
                UserId = notification.UserId,
                Notification = MapNotification(notification)
            })
            .ToArray();
    }

    public async Task<bool> DeleteNotificationAsync(int userId, int notificationId)
    {
        var notification = await _notificationRepository.GetByIdAsync(notificationId, userId);
        if (notification == null)
        {
            return false;
        }

        await _notificationRepository.DeleteAsync(notification);
        return true;
    }

    public Task DeleteAllNotificationsAsync(int userId)
    {
        return _notificationRepository.DeleteAllByUserIdAsync(userId);
    }

    public Task MarkAllAsReadAsync(int userId)
    {
        return _notificationRepository.MarkAllAsReadAsync(userId);
    }

    private static NotificationDto MapNotification(Domain.Entities.Notification notification)
    {
        return new NotificationDto
        {
            Id = notification.Id,
            StreamId = notification.StreamId,
            StreamTitle = notification.StreamTitle,
            StreamerName = notification.StreamerName,
            Message = notification.Message,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt
        };
    }
}
