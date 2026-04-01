namespace StreamHub.Application.DTOs.Chat;

public class ChatMessageDto
{
    public int Id { get; set; }
    public int StreamId { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
}

public class SendMessageDto
{
    public int StreamId { get; set; }
    public string Message { get; set; } = string.Empty;
}