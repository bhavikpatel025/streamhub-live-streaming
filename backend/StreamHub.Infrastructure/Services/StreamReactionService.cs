using Microsoft.EntityFrameworkCore;
using StreamHub.Application.DTOs.StreamReaction;
using StreamHub.Application.Interfaces;
using StreamHub.Domain.Entities;
using StreamHub.Infrastructure.Data;

namespace StreamHub.Infrastructure.Services;

public class StreamReactionService : IStreamReactionService
{
    private readonly ApplicationDbContext _context;

    public StreamReactionService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<StreamReactionResponseDto> ToggleReactionAsync(int streamId, int userId, string reactionType)
    {
        var existingReaction = await _context.StreamReactions
            .FirstOrDefaultAsync(sl => sl.StreamId == streamId && sl.UserId == userId);

        if (existingReaction != null)
        {
            if (existingReaction.ReactionType == reactionType)
            {
                // Case 2 & 3: User clicks same reaction -> Remove
                _context.StreamReactions.Remove(existingReaction);
            }
            else
            {
                // Case 4 & 5: User switches reaction -> Update
                existingReaction.ReactionType = reactionType;
                _context.StreamReactions.Update(existingReaction);
            }
        }
        else
        {
            // Case 1: User has no reaction -> Insert
            var newReaction = new StreamReaction
            {
                StreamId = streamId,
                UserId = userId,
                ReactionType = reactionType,
                CreatedAt = DateTime.UtcNow
            };
            _context.StreamReactions.Add(newReaction);
        }

        await _context.SaveChangesAsync();

        return await GetStreamReactionsAsync(streamId, userId);
    }

    public async Task<StreamReactionResponseDto> GetStreamReactionsAsync(int streamId, int userId)
    {
        var likesCount = await _context.StreamReactions
            .CountAsync(sl => sl.StreamId == streamId && sl.ReactionType == "LIKE");
            
        var dislikesCount = await _context.StreamReactions
            .CountAsync(sl => sl.StreamId == streamId && sl.ReactionType == "DISLIKE");

        var userReaction = await _context.StreamReactions
            .Where(sl => sl.StreamId == streamId && sl.UserId == userId)
            .Select(sl => sl.ReactionType)
            .FirstOrDefaultAsync() ?? "NONE";

        return new StreamReactionResponseDto
        {
            Likes = likesCount,
            Dislikes = dislikesCount,
            UserReaction = userReaction
        };
    }
}
