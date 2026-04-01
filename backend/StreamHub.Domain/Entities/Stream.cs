namespace StreamHub.Domain.Entities;

public class Stream
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string StreamKey { get; set; } = string.Empty;
    public bool IsLive { get; set; } = false;
    public int ViewerCount { get; set; } = 0;
    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();
}