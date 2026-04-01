namespace StreamHub.Domain.Entities;

public class ChatMessage
{
    public int Id { get; set; }
    public int StreamId { get; set; }
    public int UserId { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Stream Stream { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}