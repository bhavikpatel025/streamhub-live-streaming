namespace StreamHub.Domain.Entities;

public class Notification
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int StreamId { get; set; }
    public string StreamerName { get; set; } = string.Empty;
    public string StreamTitle { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual User User { get; set; } = null!;
    public virtual Stream Stream { get; set; } = null!;
}
