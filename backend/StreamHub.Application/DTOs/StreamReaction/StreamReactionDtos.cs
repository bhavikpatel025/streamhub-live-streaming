namespace StreamHub.Application.DTOs.StreamReaction;

public class ReactionRequestDto
{
    public string ReactionType { get; set; } = null!; // LIKE or DISLIKE
}

public class StreamReactionResponseDto
{
    public int Likes { get; set; }
    public int Dislikes { get; set; }
    public string UserReaction { get; set; } = "NONE"; // LIKE, DISLIKE, or NONE
}
