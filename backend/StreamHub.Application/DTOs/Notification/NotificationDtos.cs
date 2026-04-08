using StreamHub.Application.DTOs.Stream;

namespace StreamHub.Application.DTOs.Notification;

public class NotificationDto : StreamStartedNotificationDto
{
}

public class NotificationDispatchDto
{
    public int UserId { get; set; }
    public NotificationDto Notification { get; set; } = new();
}
