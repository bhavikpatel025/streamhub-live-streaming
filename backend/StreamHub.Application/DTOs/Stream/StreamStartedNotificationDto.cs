namespace StreamHub.Application.DTOs.Stream;

public class StreamStartedNotificationDto
{
    public int Id { get; set; }
    public int StreamId { get; set; }
    public string StreamTitle { get; set; } = string.Empty;
    public string StreamerName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
