namespace StreamHub.Application.DTOs.User;

public class UserProfileDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UploadProfilePictureResponseDto
{
    public string ProfileImageUrl { get; set; } = string.Empty;
}