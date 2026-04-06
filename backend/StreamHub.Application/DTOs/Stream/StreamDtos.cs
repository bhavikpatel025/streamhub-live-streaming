namespace StreamHub.Application.DTOs.Stream;

public class CreateStreamDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class StreamDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string StreamKey { get; set; } = string.Empty;
    public bool IsLive { get; set; }
    public int ViewerCount { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class StreamListDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsLive { get; set; }
    public int ViewerCount { get; set; }
    public DateTime? StartedAt { get; set; }
}

public class StreamKeyDto
{
    public string StreamKey { get; set; } = string.Empty;
    public string RtmpUrl { get; set; } = string.Empty;
}