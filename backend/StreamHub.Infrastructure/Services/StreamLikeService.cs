using Microsoft.EntityFrameworkCore;
using StreamHub.Application.DTOs.StreamLike;
using StreamHub.Application.Interfaces;
using StreamHub.Domain.Entities;
using StreamHub.Infrastructure.Data;

namespace StreamHub.Infrastructure.Services;

public class StreamLikeService : IStreamLikeService
{
    private readonly ApplicationDbContext _context;

    public StreamLikeService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<StreamLikeResponseDto> ToggleLikeAsync(int streamId, int userId)
    {
        var existingLike = await _context.StreamLikes
            .FirstOrDefaultAsync(sl => sl.StreamId == streamId && sl.UserId == userId);

        if (existingLike != null)
        {
            _context.StreamLikes.Remove(existingLike);
        }
        else
        {
            var newLike = new StreamLike
            {
                StreamId = streamId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };
            _context.StreamLikes.Add(newLike);
        }

        await _context.SaveChangesAsync();

        var totalLikes = await _context.StreamLikes
            .CountAsync(sl => sl.StreamId == streamId);

        return new StreamLikeResponseDto
        {
            TotalLikes = totalLikes,
            IsLikedByCurrentUser = existingLike == null
        };
    }

    public async Task<StreamLikeResponseDto> GetStreamLikesAsync(int streamId, int userId)
    {
        var totalLikes = await _context.StreamLikes
            .CountAsync(sl => sl.StreamId == streamId);

        var isLiked = await _context.StreamLikes
            .AnyAsync(sl => sl.StreamId == streamId && sl.UserId == userId);

        return new StreamLikeResponseDto
        {
            TotalLikes = totalLikes,
            IsLikedByCurrentUser = isLiked
        };
    }
}
