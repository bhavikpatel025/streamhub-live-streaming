using StreamHub.Application.DTOs.StreamReaction;

namespace StreamHub.Application.Interfaces;

public interface IStreamReactionService
{
    Task<StreamReactionResponseDto> ToggleReactionAsync(int streamId, int userId, string reactionType);
    Task<StreamReactionResponseDto> GetStreamReactionsAsync(int streamId, int userId);
}
